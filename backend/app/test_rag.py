from embedding import create_embedding
from vector_db import search_similar_chunks
from llm import generate_answer

question = "What is deadlock?"

query_vector = create_embedding(question)
results = search_similar_chunks(query_vector)

context = ""

for result in results:
    context += result.payload["text"]
    context += "\n\n"

answer = generate_answer(
    question,
    context
)

print("ANSWER:")
print(answer)