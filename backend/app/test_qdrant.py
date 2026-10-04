from embedding import create_embedding
from vector_db import save_embedding


text = "Python is a programming language."

vector = create_embedding(text)

save_embedding(
    vector,
    text,
    "test.txt"
)