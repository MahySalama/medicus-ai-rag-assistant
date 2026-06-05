def build_context(chunks: list[dict]) -> str:
    """Build context string from retrieved chunks."""
    if not chunks:
        return "No relevant documents found."

    context_parts = []

    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        source = f"[Source: {meta.get('filename', 'Unknown')} | Page {meta.get('page', '?')}]"
        context_parts.append(f"--- Chunk {i} {source} ---\n{chunk['text']}")

    return "\n\n".join(context_parts)