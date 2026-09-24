# Source CHATGPT

from pathlib import Path

DOCUMENT_PATH = Path("./rag/documents")
MAX_CHARS = 500


def split_large_text(text: str, max_chars: int) -> list[str]:
    """Fallback for a single paragraph larger than max_chars."""
    return [
        text[i:i + max_chars]
        for i in range(0, len(text), max_chars)
    ]


def chunk_document(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    paragraphs = text.split("\n\n")

    file_chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        paragraph = paragraph.strip()

        if not paragraph:
            continue

        # A paragraph is already too large to fit in a normal chunk.
        if len(paragraph) > max_chars:

            # Save whatever we accumulated before this paragraph.
            if current_chunk:
                file_chunks.append(current_chunk)
                current_chunk = ""

            # Fallback split for oversized paragraph.
            file_chunks.extend(
                split_large_text(paragraph, max_chars)
            )

            continue

        # Try adding this paragraph to the existing chunk.
        if current_chunk:
            candidate = current_chunk + "\n\n" + paragraph
        else:
            candidate = paragraph

        if len(candidate) <= max_chars:
            current_chunk = candidate

        else:
            # Current chunk is finished.
            file_chunks.append(current_chunk)

            # Start the next chunk with this paragraph.
            current_chunk = paragraph

    # The loop ends without automatically saving the last chunk.
    if current_chunk:
        file_chunks.append(current_chunk)

    return file_chunks


def chunks_data():
    chunks = []

    for path in DOCUMENT_PATH.glob("*.md"):
        text = path.read_text(encoding="utf-8")

        file_chunks = chunk_document(text)

        for chunk_index, content in enumerate(file_chunks):
            chunks.append({
                "source": path.name,
                "chunk_index": chunk_index,
                "content": content
            })
    return chunks


data = chunks_data()
for i in data:
    print(i["source"])
