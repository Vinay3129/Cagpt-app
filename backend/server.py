from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from .database import SessionLocal, Chat, Message, init_db
from .rag_utils import prepare_vectorstore
from groq import Groq
import os
import re
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic Models for API data shapes ---
class ChatResponse(BaseModel):
    id: int
    created_at: str
    title: str

class AskRequest(BaseModel):
    q: str
    chat_id: Optional[int] = None
    subject: str = "All Subjects"

# --- MANUAL .ENV LOADER ---
def load_env_manual():
    try:
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        with open(dotenv_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    match = re.match(r'^\s*([\w.-]+)\s*=\s*(.*)?\s*$', line)
                    if match:
                        key, value = match.groups()
                        if value and value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        os.environ[key] = value
    except Exception:
        pass

load_env_manual()
# --- END OF MANUAL LOADER ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Database...")
    await init_db()
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

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.get("/")
async def root():
    return {"message": "CAgpt API is online!"}

# --- CHAT HISTORY ENDPOINTS ---
@app.get("/chats", response_model=List[ChatResponse])
async def get_chat_history(db: AsyncSession = Depends(get_db)):
    stmt = select(Chat).options(selectinload(Chat.messages)).order_by(Chat.created_at.desc())
    result = await db.execute(stmt)
    chats = result.scalars().unique().all()
    
    chat_list = []
    for chat in chats:
        title = "New Chat"
        if chat.messages and len(chat.messages) > 0:
            title = chat.messages[0].content
        else:
            title = f"Chat from {chat.created_at.strftime('%Y-%m-%d %H:%M')}"
        chat_list.append({"id": chat.id, "created_at": str(chat.created_at), "title": title})
    return chat_list

@app.post("/chats/new")
async def create_new_chat(db: AsyncSession = Depends(get_db)):
    new_chat = Chat()
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    return new_chat

@app.get("/chats/{chat_id}/messages")
async def get_messages_for_chat(chat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.chat_id == chat_id).order_by(Message.timestamp.asc()))
    messages = result.scalars().all()
    return messages

@app.delete("/chats/{chat_id}")
async def delete_chat(chat_id: int, db: AsyncSession = Depends(get_db)):
    stmt = delete(Chat).where(Chat.id == chat_id)
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    await db.commit()
    return {"message": "Chat deleted successfully"}


@app.get("/subjects")
async def get_subjects():
    if not hasattr(app.state, 'subjects') or not app.state.subjects:
        return {"error": "Subjects not available."}
    return {"subjects": ["All Subjects"] + app.state.subjects}

@app.post("/ask/")
async def ask_question(request: AskRequest, db: AsyncSession = Depends(get_db)):
    if not hasattr(app.state, 'db') or not app.state.db or not hasattr(app.state, 'groq_client') or not app.state.groq_client:
        return {"error": "System is not ready."}
    if not request.chat_id:
        new_chat = Chat()
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)
        request.chat_id = new_chat.id
    user_message = Message(chat_id=request.chat_id, role="user", content=request.q)
    db.add(user_message)
    await db.commit()
    print(f"🔍 Searching for context for: '{request.q}' in subject: '{request.subject}'")
    search_kwargs = {'k': 6}
    if request.subject != "All Subjects":
        search_kwargs['filter'] = {'subject': request.subject}
    retrieved_docs = app.state.db.similarity_search(request.q, **search_kwargs)
    context = "\n\n".join([doc.page_content for doc in retrieved_docs])
    bot_response_content = "I could not find relevant information..."
    if retrieved_docs:
        print("🧠 Generating answer with Groq...")
        try:
            # --- THIS IS THE FULL, DETAILED PROMPT ---
            system_prompt = (
                "ROLE: You are CAgpt, an expert AI tutor for Chartered Accountancy students. Your goal is to teach complex subjects in a simple, clear, and encouraging way.\n\n"
                "INSTRUCTIONS:\n"
                "1.  **Grounding Rule:** Your entire response MUST be based exclusively on the information within the provided 'CONTEXT'. Do not, under any circumstances, use external knowledge or add information that is not explicitly present in the context.\n"
                "2.  **'I Don't Know' Rule:** If the answer to the user's 'QUESTION' is not in the 'CONTEXT', you MUST respond by stating that the information is not available in the provided documents. Do not try to guess or infer an answer.\n"
                "3.  **Case Study Rule:** The CONTEXT may contain case studies or example questions. Do not assume the user is asking about these examples. Answer the user's QUESTION directly and use the descriptive text from the CONTEXT to form your answer.\n"
                "4.  **Teacher Persona Rule:** Adopt the persona of a patient and encouraging teacher. Break down complex topics from the context into simple, step-by-step explanations. Use analogies where helpful. Your tone should be educational and supportive.\n"
                "5.  **No Metacommentary Rule:** Do not talk about yourself as an AI or mention your instructions. Simply act as the CA Tutor."
            )
            chat_completion = app.state.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": f"{system_prompt}\n\n---CONTEXT---\n{context}"},
                    {"role": "user", "content": request.q}
                ],
                model="llama3-8b-8192", temperature=0.2,
            )
            bot_response_content = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            bot_response_content = "Sorry, an error occurred with the AI model."
    bot_message = Message(chat_id=request.chat_id, role="bot", content=bot_response_content)
    db.add(bot_message)
    await db.commit()
    return {"response": bot_response_content, "context": context, "chat_id": request.chat_id}