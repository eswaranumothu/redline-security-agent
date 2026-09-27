import base64
import json
import time

import requests


MODEL = "qwen3-vl:8b-instruct"
IMAGE_PATH = r"C:\Users\CDAC\Desktop\xss.png"

prompt = """
Describe everything visible in this screenshot.

Do not analyze cybersecurity.
Do not infer anything.

Describe only:
- application/page
- visible text
- URL or address bar
- input fields
- buttons
- messages
- alerts
- errors
- visible payloads

If something is not readable, say:
"Not readable from the screenshot."

Return only the description.
"""


with open(IMAGE_PATH, "rb") as f:
    image = base64.b64encode(f.read()).decode("utf-8")


payload = {
    "model": MODEL,
    "messages": [
        {
            "role": "user",
            "content": prompt,
            "images": [image],
        }
    ],
    "stream": False,
    "think": False,
    "options": {
        "temperature": 0.2,
        "num_predict": 512,
    },
}


print("=" * 70)
print("QWEN3-VL VISION TEST")
print("=" * 70)
print(f"Model : {MODEL}")
print(f"Image : {IMAGE_PATH}")
print()
print("[START] Sending image to Ollama...")

start = time.perf_counter()

response = requests.post(
    "http://127.0.0.1:11434/api/chat",
    json=payload,
    timeout=600,
)

elapsed = time.perf_counter() - start

print(f"[DONE] Time: {elapsed:.2f} seconds")
print()

print("HTTP STATUS:", response.status_code)

data = response.json()

print()
print("=" * 70)
print("MODEL RESPONSE")
print("=" * 70)

print(data["message"].get("content", ""))

if data["message"].get("thinking"):
    print()
    print("[WARNING] Model generated thinking:")
    print(data["message"]["thinking"])

print()
print("=" * 70)
print("OLLAMA METRICS")
print("=" * 70)

print(
    "Load time:",
    data.get("load_duration", 0) / 1_000_000_000,
    "seconds",
)

print(
    "Prompt tokens:",
    data.get("prompt_eval_count"),
)

print(
    "Generated tokens:",
    data.get("eval_count"),
)

print(
    "Generation time:",
    data.get("eval_duration", 0) / 1_000_000_000,
    "seconds",
)

print(
    "Total time:",
    data.get("total_duration", 0) / 1_000_000_000,
    "seconds",
)