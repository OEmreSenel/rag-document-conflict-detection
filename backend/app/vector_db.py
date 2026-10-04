from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    VectorParams,
)

client = QdrantClient(
    host="localhost",
    port=6333
)

collection_name = "documents"

if not client.collection_exists(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=1024,
            distance=Distance.COSINE
        )
    )

    print("Collection created")

def save_embedding(
    vector,
    text,
    filename,
    line_start=None,
    line_end=None
):

    point = PointStruct(
        id=abs(hash(text)),
        vector=vector,
        payload={
            "text": text,
            "filename": filename,
            "line_start": line_start,
            "line_end": line_end
        }
    )

    client.upsert(
        collection_name=collection_name,
        points=[point]
    )

    print("Saved to Qdrant")

    client.upsert(
        collection_name=collection_name,
        points=[point]
    )

    print("Saved to Qdrant")

def delete_document_vectors(filename):
    client.delete(
        collection_name=collection_name,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="filename",
                        match=MatchValue(value=filename)
                    )
                ]
            )
        ),
        wait=True
    )

def search_similar_chunks(query_vector, limit=3, exclude_filename=None):

    query_filter = None

    if exclude_filename:
        query_filter = Filter(
            must_not=[
                FieldCondition(
                    key="filename",
                    match=MatchValue(value=exclude_filename)
                )
            ]
        )

    results = client.query_points(
        collection_name=collection_name,
        query=query_vector,
        query_filter=query_filter,
        limit=limit,
        with_payload=True
    )

    return results.points

def clear_all_vectors():
    client.delete(
        collection_name=collection_name,
        points_selector=FilterSelector(
            filter=Filter()
        ),
        wait=True
    )

    print("All vectors cleared")