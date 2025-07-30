# backend/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rag_utils import prepare_vectorstore
from model_utils import load_llm
from langchain.chains import RetrievalQA
import os
import uvicorn

app = FastAPI()

# Allow all origins for development purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Updated Paths ---
MODEL_PATH = "./models/phi-3-mini-4k-instruct-q4.gguf"
DATA_DIRECTORY = "./data/" # Path to the main data folder

qa = None

@app.on_event("startup")
def startup_event():
    """
    Loads the vector database and the language model on application startup.
    """
    global qa
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ LLM model not found at {MODEL_PATH}")
        return

    print("⏳ Preparing vector store from all documents...")
    # --- Use the new function with the directory path ---
    db = prepare_vectorstore(DATA_DIRECTORY)
    
    if not db:
        print("❌ Vector store could not be created. Halting startup.")
        return
        
    print("✅ Vector DB ready.")

    print("⏳ Loading LLM...")
    llm = load_llm(MODEL_PATH)
    print("✅ LLM ready.")

    # Create the QA chain
    qa = RetrievalQA.from_chain_type(llm=llm, retriever=db.as_retriever())

@app.get("/")
async def root():
    """
    Root endpoint to check if the server is running.
    """
    return {"message": "CAgpt is online with LLM!"}

@app.get("/ask/")
async def ask_question(q: str):
    """
    Endpoint to ask a question to the AI model.
    """
    if not qa:
        return {"error": "AI model is not ready. Please check server startup logs."}
    
    print(f"❓ Received question: {q}")
    answer = qa.run(q)
    print(f"💬 Sending answer: {answer}")
    
    return {"response": answer}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)