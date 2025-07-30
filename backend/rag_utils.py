# backend/rag_utils.py
import os
import boto3
from botocore.client import Config
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tempfile
from dotenv import load_dotenv

load_dotenv()

def get_r2_client():
    """Initializes and returns the Boto3 client for Cloudflare R2."""
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    
    s3_client = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        config=Config(signature_version='s3v4')
    )
    return s3_client

def list_and_download_files(client, bucket_name, temp_dir):
    """Lists and downloads all files from the R2 bucket."""
    all_docs = []
    paginator = client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket_name)

    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                file_key = obj['Key']
                # Skip folders/directories
                if file_key.endswith('/'):
                    continue

                print(f"Downloading: {file_key}")
                local_file_path = os.path.join(temp_dir, os.path.basename(file_key))
                client.download_file(bucket_name, file_key, local_file_path)

                # Determine subject from folder structure
                subject = file_key.split('/')[0]

                if file_key.endswith(".pdf"):
                    loader = PyMuPDFLoader(local_file_path)
                    docs = loader.load()
                    for doc in docs:
                        doc.metadata['subject'] = subject
                    all_docs.extend(docs)
                # Add logic for other file types like .txt here if needed
    return all_docs

def prepare_vectorstore():
    """
    Prepares the FAISS vector store by automatically discovering and downloading
    documents from the Cloudflare R2 bucket.
    """
    bucket_name = os.getenv("R2_BUCKET_NAME")
    if not bucket_name:
        print("❌ R2_BUCKET_NAME not set in .env file.")
        return None

    r2_client = get_r2_client()

    with tempfile.TemporaryDirectory() as temp_dir:
        all_docs = list_and_download_files(r2_client, bucket_name, temp_dir)

    if not all_docs:
        print("⚠️ No documents were loaded. Vector store cannot be created.")
        return None

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.from_documents(chunks, embeddings)
    print("✅ Vector DB ready.")
    return db