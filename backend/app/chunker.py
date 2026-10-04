def chunk_text(text, chunk_size=1000, overlap=200):
    if not text or not text.strip():
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            line_start = text[:start].count("\n") + 1
            line_end = text[:start + len(chunk)].count("\n") + 1

            chunks.append({
                "text": chunk,
                "line_start": line_start,
                "line_end": line_end
            })

        start += chunk_size - overlap

    return chunks