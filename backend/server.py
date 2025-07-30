# backend/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .rag_utils import prepare_vectorstore
from groq import Groq
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# --- Updated Loading Logic ---
print("--- Forcing .env load from explicit path ---")
# Build the absolute path to the .env file located in the same directory as this script
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# Load the .env file using the explicit path
load_dotenv(dotenv_path=dotenv_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    print("⏳ Preparing vector store from cloud documents...")
    app.state.db = prepare_vectorstore()
    if app.state.db:
        print("✅ Vector DB ready.")
    else:
        print("❌ Vector DB could not be initialized.")

    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        app.state.groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq client ready.")
    else:
        print("❌ GROQ_API_KEY not found.")
    
    yield
    print("Application shutdown.")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "CAgpt API is online!"}

@app.get("/ask/")
async def ask_question(q: str):
    if not hasattr(app.state, 'db') or not app.state.db or not hasattr(app.state, 'groq_client') or not app.state.groq_client:
        return {"error": "System is not ready. Please check server logs."}

    print(f"🔍 Searching for context for: {q}")
    retrieved_docs = app.state.db.similarity_search(q, k=3)
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    print("🧠 Generating answer with Groq...")
    try:
        chat_completion = app.state.groq_client.chat.completions.create(
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
            model="llama3-8b-8192",
            temperature=0.2,
        )
        answer = chat_completion.choices[0].message.content
        return {"response": answer}
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {"error": "Failed to generate answer from AI model."}