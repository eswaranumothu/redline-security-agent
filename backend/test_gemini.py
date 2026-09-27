import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash",
)

print("API key configured:", bool(api_key))
print("Model:", model)

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing."
    )

client = genai.Client(
    api_key=api_key
)

response = client.models.generate_content(
    model=model,
    contents="Say only: Hello",
)

print()
print("GEMINI RESPONSE:")
print(response.text)