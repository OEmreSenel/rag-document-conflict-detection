import ollama

def create_embedding(text):
    response = ollama.embeddings(
        model="qwen3-embedding:0.6b",
        prompt=text
    )
    return response["embedding"]
