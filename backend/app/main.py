from multiprocessing import context
from pathlib import Path
from unittest import result

from fastapi import FastAPI, File, HTTPException, UploadFile
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.extractor import extract_text
from app.chunker import chunk_text
from app.embedding import create_embedding

from app.vector_db import (
    delete_document_vectors,
    save_embedding,
    search_similar_chunks,
    clear_all_vectors
)

from app.llm import generate_answer

from app.conflict_db import (
    init_database,
    get_conflicts,
    delete_conflicts_for_document,
    clear_all_conflicts
)

from app.conflict_detector import check_chunk_for_conflicts


app = FastAPI()

init_database()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


@app.get("/")
def root():
    return {
        "message": "Backend is running"
    }

@app.post("/documents/upload")
async def upload_documents(
    files: Annotated[
        list[UploadFile],
        File(description="Select one or more PDF, DOCX, or TXT files")
    ]
):

    saved_files = []

    for file in files:

        file_extension = Path(file.filename).suffix.lower()

        if file_extension not in ALLOWED_EXTENSIONS:

            raise HTTPException(
                status_code=400,
                detail=f"{file.filename} is not a supported file type."
            )


        file_path = UPLOAD_DIR / file.filename


        if file_path.exists():

            saved_files.append({
                "filename": file.filename,
                "content_type": file.content_type,
                "status": "already_saved"
            })

            continue


        file_content = await file.read()

        file_path.write_bytes(file_content)


        text = extract_text(file_path)

        chunks = chunk_text(text)


        print("Extracted characters:", len(text))

        print("Number of chunks:", len(chunks))


        for chunk in chunks:

            chunk_text_value = chunk["text"]


            if not chunk_text_value.strip():
                continue


            vector = create_embedding(
                chunk_text_value
            )


            check_chunk_for_conflicts(
                chunk_text_value,
                file.filename,
                vector,
                chunk["line_start"],
                chunk["line_end"]
            )


            save_embedding(
                vector,
                chunk_text_value,
                file.filename,
                chunk["line_start"],
                chunk["line_end"]
            )


        saved_files.append({
            "filename": file.filename,
            "content_type": file.content_type,
            "status": "saved"
        })


    if saved_files and all(
        file["status"] == "already_saved"
        for file in saved_files
    ):

        message = "Documents already saved"

    else:

        message = "Documents saved successfully"


    return {
        "saved_files": saved_files,
        "message": message
    }

@app.get("/documents")
def get_all_documents():

    documents = []


    for file_path in UPLOAD_DIR.iterdir():

        if file_path.is_file():

            documents.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size
            })


    documents.sort(
        key=lambda document: document["filename"].lower()
    )


    return {
        "documents": documents
    }

@app.delete("/documents/all")
def clear_all_documents():

    deleted_files = 0


    for file_path in UPLOAD_DIR.iterdir():

        if file_path.is_file():

            file_path.unlink()

            deleted_files += 1


    clear_all_vectors()

    clear_all_conflicts()


    return {
        "message": "All documents deleted successfully",
        "files_deleted": deleted_files
    }

@app.delete("/documents/{filename}")
def delete_document(filename: str):

    file_path = UPLOAD_DIR / filename


    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    delete_document_vectors(filename)

    delete_conflicts_for_document(filename)

    file_path.unlink()


    return {
        "filename": filename,
        "message": "Document deleted successfully"
    }

@app.get("/conflicts")
def get_all_conflicts():

    return {
        "conflicts": get_conflicts()
    }

class QuestionRequest(BaseModel):
    question: str


@app.post("/ask")
async def ask_question(request: QuestionRequest):

    question = request.question


    query_vector = create_embedding(
        question
    )


    results = search_similar_chunks(
        query_vector
    )


    context = ""

    sources = []


    for result in results:

        print("SCORE:", result.score)


        if result.score < 0.55:
            continue


        context += result.payload["text"]

        context += "\n\n"


        filename = result.payload.get(
            "filename"
        )


        if filename and filename not in sources:

            sources.append(filename)


    if not context.strip():

        return {
            "answer": "I don't know. The uploaded documents do not contain relevant information about this question.",
            "sources": []
        }


    answer = generate_answer(
        question,
        context
    )


    if "i don't know" in answer.lower():

        sources = []


    return {
        "answer": answer,
        "sources": sources
    }