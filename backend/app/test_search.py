from embedding import create_embedding
from vector_db import search_similar_chunks

query = "What is python?"

vector = create_embedding(query)

results = search_similar_chunks(vector)

print("RESULT COUNT:", len(results))

for result in results:
    print("----------------")
    print("Score:", result.score)
    print("Text:", result.payload["text"])
    print("File:", result.payload["filename"])