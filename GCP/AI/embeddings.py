import ollama
import numpy as np
input_list = ["My Kubernetes applications store persistent data using Ceph.", "Rook Ceph provides persistent storage for my Kubernetes cluster", "my dog is a cat"]
single = ollama.embed(
  model='qwen3-embedding:0.6b',
  input=input_list
)
a = single['embeddings'][0]
b = single['embeddings'][1]
c = single['embeddings'][2]
# calculating cosine

def cosine_similarity(first:list , second:list):
  A = first
  B = second


  dot_product = np.dot(A, B)

  magnitude_A = np.linalg.norm(A)
  magnitude_B = np.linalg.norm(B)

  result_similarity = dot_product / (magnitude_A * magnitude_B)
  return result_similarity


ab = cosine_similarity(a, b)
bc = cosine_similarity(b, c)
ac = cosine_similarity(a, c)
# Group them into a dictionary
similarities = {
    'Pair A-B': ab,
    'Pair B-C': bc,
    'Pair A-C': ac
}

best_pair = max(similarities, key=similarities.get)
print(f"The highest similarity is {best_pair} with a score of {similarities[best_pair]}")
print(len(single['embeddings'][0]))
#
# if ab > bc:
#   if ab > ac:
#     print(f" the highest similarity is a and b")
#   else:
#     print("The highest similarity is a and c")
# elif bc> ac:
#   print("The highest similarity is b and c")
# else:
#   print(" The highest similarity is a and c")
