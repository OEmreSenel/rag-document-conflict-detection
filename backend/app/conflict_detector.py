from app.vector_db import search_similar_chunks
from app.llm import detect_conflict
from app.conflict_db import save_conflict


SIMILARITY_THRESHOLD = 0.65


def check_chunk_for_conflicts(
    chunk,
    filename,
    vector,
    line_start=None,
    line_end=None
):

    similar_chunks = search_similar_chunks(
        vector,
        limit=2,
        exclude_filename=filename
    )

    for result in similar_chunks:

        if result.score < SIMILARITY_THRESHOLD:
            continue

        other_filename = result.payload.get("filename")
        other_text = result.payload.get("text")

        other_line_start = result.payload.get("line_start")
        other_line_end = result.payload.get("line_end")

        if not other_filename or not other_text:
            continue

        is_conflict = detect_conflict(
            chunk,
            other_text
        )

        if is_conflict:

            save_conflict(
                document_a=filename,
                document_b=other_filename,
                text_a=chunk,
                text_b=other_text,
                line_a=line_start,
                line_b=other_line_start,
                conflict_type="CONTRADICTION",
                confidence=result.score
            )

            print(
                f"CONFLICT FOUND: "
                f"{filename} <-> {other_filename}"
            )