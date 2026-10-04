import ollama

def generate_answer(question, context):

    prompt = f"""
You are an AI assistant that answers questions using the provided documents.

Rules:
- Use only the information from the provided context.
- Answer the question clearly and accurately.
- Do not repeat the question.
- Do not mention the context or documents.
- Keep the answer concise but include important details.
- Do not invent information that is not present in the context.
- Break long answers into short paragraphs.
- Avoid ending sentences abruptly.
- Provide complete answers before stopping.
- Do not mention phrases like "the context", "the provided context", or "the documents".
- Explain concepts as if teaching a user who is learning the topic.
- Never add a Sources, References, or citation section.
- Never mention file names or document names in the answer.
- Do not include anything except the answer.
- Do not repeat information.

Formatting:
- Use markdown formatting when it improves readability.
- Use **bold text** for important concepts.
- Use paragraphs, bullet points, or numbered lists when appropriate.

Response style:
- Answer like ChatGPT: natural, helpful, and easy to understand.
- Start with a direct explanation instead of describing the source.
- Explain concepts clearly and conversationally.
- Prefer short paragraphs over long blocks of text.
- Adapt the level of detail to the user's question.
- Explain technical concepts simply while staying strictly within the provided context.
- Only include details that help answer the user's question.
- Never begin answers with phrases like "Based on the provided context", "According to the documents", or similar expressions.
- Answer directly as if you already know the information.
- Answer concisely using only the provided context.

Context:
{context}

Question:
{question}

Answer:
"""

    response = ollama.chat(
        model="qwen3.5:9b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]

def detect_conflict(text_a, text_b):

    prompt = f"""
You are checking whether two pieces of text contradict each other.

Text A:
{text_a}

Text B:
{text_b}

Determine whether the two texts contain a factual contradiction.

Rules:
- Return exactly CONFLICT if they contradict each other.
- Return exactly NO_CONFLICT if they do not contradict each other.
- Do not use outside knowledge.
- Only compare the information explicitly stated in the two texts.
- Similar or related information is NOT necessarily a conflict.
- A conflict means that the two texts make incompatible claims about the same thing.

Answer:
"""

    response = ollama.chat(
        model="qwen3.5:9b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    result = response["message"]["content"].strip().upper()

    if "CONFLICT" in result and "NO_CONFLICT" not in result:
        return True

    return False
