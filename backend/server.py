from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .rag_utils import prepare_vectorstore
from groq import Groq
import os
import re # Import the regex library
from contextlib import asynccontextmanager

# --- MANUAL .ENV LOADER ---
def load_env_manual():
    """A simple, manual function to read the .env file and set environment variables."""
    try:
        # Build the explicit path to the .env file
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        print(f"--- Manually loading .env from: {dotenv_path} ---")
        with open(dotenv_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    # Use regex to safely parse KEY=VALUE pairs, handling quotes
                    match = re.match(r'^\s*([\w.-]+)\s*=\s*(.*)?\s*$', line)
                    if match:
                        key, value = match.groups()
                        # Strip quotes if they exist
                        if value and value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        os.environ[key] = value
                        print(f"  ✅ Manually loaded key: {key}")
    except FileNotFoundError:
        print(f"  ❌ ERROR: Manual loader could not find the .env file at {dotenv_path}")
    except Exception as e:
        print(f"  ❌ ERROR: An error occurred while manually loading .env: {e}")

load_env_manual()
# --- END OF MANUAL LOADER ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup...")
    print("⏳ Preparing vector store from cloud documents...")
    app.state.db, app.state.subjects = prepare_vectorstore()
    
    if app.state.db:
        print(f"✅ Vector DB ready with subjects: {app.state.subjects}")
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

@app.get("/subjects")
async def get_subjects():
    subjects = ["All Subjects"] + getattr(app.state, 'subjects', [])
    return {"subjects": subjects}

@app.get("/ask/")
async def ask_question(q: str, subject: str = "All Subjects"):
    if not hasattr(app.state, 'db') or not app.state.db or not hasattr(app.state, 'groq_client') or not app.state.groq_client:
        return {"error": "System is not ready. Please check server logs."}

    print(f"🔍 Searching for context for: '{q}' in subject: '{subject}'")

    search_kwargs = {'k': 4}
    if subject != "All Subjects":
        search_kwargs['filter'] = {'subject': subject}
    
    retrieved_docs = app.state.db.similarity_search(q, **search_kwargs)
    
    if not retrieved_docs:
        print("No relevant documents found in the vector store.")
        return {"response": "I could not find any relevant information in the provided documents to answer your question."}
        
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])

    print("🧠 Generating answer with Groq...")
    try:
        chat_completion = app.state.groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant for Chartered Accountancy (CA) students. "
                        "Answer the user's question based *only* on the following context. "
                        "If the context doesn't contain the answer, state that the information is not available in the provided documents."
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
            temperature=0.1,
        )
        answer = chat_completion.choices[0].message.content
        return {"response": answer}
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return {"error": "Failed to generate answer from AI model."}