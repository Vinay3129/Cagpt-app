# backend/rag_utils.py
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os

def load_documents_from_directory(directory_path: str):
    """
    Loads documents from a directory, assigning the subfolder name as the 'subject' metadata.
    Supports .pdf and .txt files.
    """
    all_docs = []
    
    # Walk through the directory
    for folder_name in os.listdir(directory_path):
        subject_path = os.path.join(directory_path, folder_name)
        
        # Ensure it's a directory
        if os.path.isdir(subject_path):
            subject = folder_name # The subject is the name of the folder
            
            # Iterate over files in the subject folder
            for filename in os.listdir(subject_path):
                file_path = os.path.join(subject_path, filename)
                
                # Use the appropriate loader based on file extension
                if filename.endswith(".pdf"):
                    loader = PyMuPDFLoader(file_path)
                elif filename.endswith(".txt"):
                    loader = TextLoader(file_path, encoding='utf-8')
                else:
                    continue # Skip unsupported file types
                
                print(f"📄 Loading: {filename} (Subject: {subject})")
                docs = loader.load()
                
                # Add subject metadata to each document
                for doc in docs:
                    doc.metadata['subject'] = subject
                
                all_docs.extend(docs)
                
    return all_docs

def prepare_vectorstore(data_directory: str):
    """
    Prepares the FAISS vector store from documents in the data directory.
    """
    # Load all documents with metadata
    docs = load_documents_from_directory(data_directory)
    
    if not docs:
        print("⚠️ No documents found. Please check the data directory.")
        return None

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Create FAISS vector store from the chunks
    print("🧠 Creating vector store from documents...")
    db = FAISS.from_documents(chunks, embeddings)
    print("✅ Vector store created successfully.")
    
    return db