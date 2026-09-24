import io, hashlib, hmac
import os


def documents_hash_generator():
    hashdict = {}
    for x in os.walk("rag/documents"):
        for y in x[2]:
            with open(f"rag/documents/{y}", "rb") as f:
                digest = hashlib.file_digest(f, "sha256")
            hashdict[f"{y}"] = digest.hexdigest()
    return hashdict