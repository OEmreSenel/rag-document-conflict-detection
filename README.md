# RAG-Based Document Conflict Detection System

A document analysis and question-answering system that combines Retrieval-Augmented Generation (RAG), vector similarity search, OCR, and LLM-based reasoning to detect contradictions and answer user questions using uploaded documents.

## Overview

This project allows users to upload PDF, DOCX, and TXT documents, automatically analyse their contents for conflicting statements, and ask questions based on the uploaded documents.

Documents are processed through text extraction and OCR, split into searchable chunks, converted into vector embeddings, and stored in a Qdrant vector database. During conflict detection, semantically similar sections from different documents are retrieved and analysed by the Qwen 3.5 9B large language model running locally through Ollama to determine whether they contain contradictory information.

The system also provides a RAG-based question answering interface that allows users to ask questions about the uploaded documents.

## Features

- Upload PDF, DOCX, and TXT documents
- Extract text from documents
- OCR for extracting text from scanned documents
- Split documents into searchable chunks
- Generate vector embeddings
- Store and search document embeddings using Qdrant
- Detect semantically similar sections across different documents
- Use Qwen 3.5 9B to identify contradictions
- Store detected conflicts in SQLite
- Display detected conflicts with confidence scores
- Show conflicting statements and their document locations
- Delete individual documents and their associated data
- Delete all uploaded documents
- Ask questions about uploaded documents using RAG
- REST API built with FastAPI

## Architecture

```text
Documents
    |
    v
Text Extraction / OCR
    |
    v
Text Chunking
    |
    v
Vector Embeddings
    |
    v
Qdrant Vector Database
    |
    +----------------------+
    |                      |
    v                      v
Similarity Search      RAG Question Answering
    |                      |
    v                      v
Qwen 3.5 9B           Qwen 3.5 9B
    |                      |
    v                      v
LLM Conflict Detection   Answer + Sources
    |
    v
SQLite Conflict Database
    |
    v
Conflict Detection UI
```

## Technologies

- Python
- FastAPI
- Qdrant
- SQLite
- Ollama
- Qwen 3.5 9B
- NumPy
- PyPDF
- python-docx
- OCR
- HTML
- CSS
- JavaScript
- REST API
- Retrieval-Augmented Generation (RAG)
- Vector Embeddings
- Large Language Models (LLMs)

## Project Structure

```text
rag-project/
│
├── backend/
│   ├── app/
│   │   ├── chunker.py
│   │   ├── conflict_db.py
│   │   ├── conflict_detector.py
│   │   ├── embedding.py
│   │   ├── extractor.py
│   │   ├── llm.py
│   │   ├── main.py
│   │   ├── test_qdrant.py
│   │   ├── test_rag.py
│   │   ├── test_search.py
│   │   └── vector_db.py
│   │
│   └── uploads/
│
├── frontend/
│   ├── conflict-ui/
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   │
│   ├── documents-ui/
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   │
│   └── uploads-ui/
│       ├── index.html
│       ├── script.js
│       └── style.css
│
├── .gitignore
├── README.md
└── requirements.txt
```

## API Endpoints

### Health Check

`GET /`

Returns a message confirming that the backend is running.

### Upload Documents

`POST /documents/upload`

Uploads and processes one or more PDF, DOCX, or TXT documents.

### List Documents

`GET /documents`

Returns all uploaded documents.

### Delete a Document

`DELETE /documents/{filename}`

Deletes a document together with its stored vectors and related conflicts.

### Delete All Documents

`DELETE /documents/all`

Removes all uploaded documents, vectors, and conflicts.

### Get Conflicts

`GET /conflicts`

Returns detected document conflicts.

### Ask a Question

`POST /ask`

Uses semantic search and Qwen 3.5 9B to answer questions using the uploaded documents as context.

## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/OEmreSenel/rag-document-conflict-detection.git
cd rag-document-conflict-detection
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start Qdrant

Make sure a Qdrant instance is running on:

```text
localhost:6333
```

### 5. Install and run Ollama

Make sure Ollama is installed and the required model is available:

```bash
ollama pull qwen3.5:9b
```

### 6. Start the FastAPI backend

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Conflict Detection

When a document is uploaded:

1. The document text is extracted.
2. OCR is used where required for scanned document content.
3. The extracted text is divided into chunks.
4. Each chunk is converted into an embedding.
5. The embeddings are stored in Qdrant.
6. Similar chunks from other documents are retrieved using vector similarity search.
7. The retrieved statements are analysed by Qwen 3.5 9B.
8. Detected contradictions are stored in SQLite.
9. The frontend displays the conflicting documents, statements, locations, and confidence scores.

## RAG Question Answering

The `/ask` endpoint uses the following process:

```text
User Question
      |
      v
Question Embedding
      |
      v
Qdrant Similarity Search
      |
      v
Relevant Document Chunks
      |
      v
Qwen 3.5 9B
      |
      v
Answer + Sources
```

If the uploaded documents do not contain relevant information, the system returns an "I don't know" response instead of generating an unsupported answer.

## Document Management

The document management interface allows users to:

- Upload PDF, DOCX, and TXT documents
- Extract text from uploaded documents
- Use OCR to extract text from scanned documents
- View all uploaded documents
- View document file sizes
- Delete individual documents
- Delete all documents
- Automatically remove associated vector data
- Automatically remove related conflict records

## Security

Sensitive configuration files and local data are excluded from version control using `.gitignore`.

Do not commit:

- API keys
- `.env` files
- Virtual environments
- Local databases
- Qdrant storage
- Uploaded documents containing sensitive information

## Future Improvements

Possible future improvements include:

- More advanced document parsing
- Improved OCR processing
- Improved chunking strategies
- Better conflict classification
- Highlighting conflicting text directly inside documents
- Authentication and user accounts
- Background document processing
- Automated evaluation of conflict detection accuracy
- Docker-based deployment
- Cloud-based vector storage

## Author

Oguzhan Emre Senel

Computer Science Student  
University of Surrey
