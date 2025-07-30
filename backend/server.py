# backend/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rag_utils import prepare_vectorstore
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Global variables to hold the database and AI client
db = None
groq_client = None

@app.on_event("startup")
def startup_event():
    """
    On startup, prepare the vector store and initialize the Groq client.
    """
    global db, groq_client

    # The prepare_vectorstore function now handles everything automatically
    print("⏳ Preparing vector store from cloud documents...")
    db = prepare_vectorstore()
    
    # The rest of the function stays the same
    if db:
        print("✅ Vector DB ready.")
    else:
        print("❌ Vector DB could not be initialized.")

    # Initialize Groq client from the API key in the .env file
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq client ready.")
    else:
        print("❌ GROQ_API_KEY not found. Please set it in the .env file.")

@app.get("/")
async def root():
    return {"message": "CAgpt API is online!"}

@app.get("/ask/")
async def ask_question(q: str):
    """
    Endpoint to ask a question. It retrieves context from the vector store
    and generates an answer using the Groq API.
    """
    if not db or not groq_client:
        return {"error": "System is not ready. Please check server logs."}

    print(f"🔍 Searching for context for: {q}")
    # 1. Retrieve relevant documents from the vector store
    retrieved_docs = db.similarity_search(q, k=3) # Get top 3 most relevant chunks
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    print("🧠 Generating answer with Groq...")
    # 2. Generate an answer using the context
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant for Chartered Accountancy (CA) students. "
                        "Answer the user's question based on the following context. "
                        "If the context doesn't contain the answer, say that you don't know."
                        "\n\n---CONTEXT---\n"
                        f"{context}"
                    )
                },
                {
                    "role": "user",
                    "content": q,
                }
            ],
            model="llama3-8b-8192", # Using Llama3 8B model on Groq
            temperature=0.2,
        )
        answer = chat_completion.choices[0].message.content
        return {"response": answer}

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {"error": "Failed to generate answer from AI model."}