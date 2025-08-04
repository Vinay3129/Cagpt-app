# backend/pre_cache_model.py
from sentence_transformers import SentenceTransformer
import os

# Define the model name
model_name = 'sentence-transformers/all-MiniLM-L6-v2'

print(f"--- Caching embedding model: {model_name} ---")
print("This may take a few minutes...")

# This line downloads the model and saves it to a local cache
SentenceTransformer(model_name)

print("--- Model caching complete. ---")