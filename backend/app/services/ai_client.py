"""
Thin wrapper around Ollama's /api/chat endpoint. Kept deliberately small
and behind a simple .chat() method so app/api/deps.py can hand out a real
AIClient in production and tests can substitute a fake one via FastAPI's
dependency_overrides - matching the PRD's testing requirement to "mock
Ollama responses during automated tests" (section 48) without needing
Ollama actually running.
"""

import httpx


class AIServiceError(Exception):
    """Raised whenever the AI backend can't be reached or errors out."""


class AIClient:
    def __init__(self, base_url: str, model: str, timeout: float = 30.0):
        self.base_url = base_url
        self.model = model
        self.timeout = timeout

    def chat(self, system_prompt: str, user_message: str, json_mode: bool = False) -> str:
        """
        Sends a single-turn chat request (system + user message) to Ollama
        and returns the assistant's reply text. No conversation history is
        kept between calls - each request is self-contained, with the
        caller responsible for embedding whatever context is needed in
        system_prompt.
        """
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "stream": False,
        }
        if json_mode:
            payload["format"] = "json"

        try:
            with httpx.Client(base_url=self.base_url, timeout=self.timeout) as client:
                response = client.post("/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            raise AIServiceError("Unable to reach the AI assistant") from exc
