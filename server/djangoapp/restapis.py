import os
from urllib.parse import quote, urlencode, urljoin

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv("BACKEND_URL", "http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    "SENTIMENT_ANALYZER_URL", "http://localhost:5050"
)


def get_request(endpoint, **kwargs):
    """
    Generic GET request handler using urllib.parse.urlencode
    for explicit encoding.
    """
    try:
        # Safely join base URL and endpoint
        base = urljoin(backend_url, endpoint)

        # Manually encode the query parameters (if any)
        query_string = urlencode(kwargs)

        # Build final request URL (with ? only if needed)
        request_url = f"{base}?{query_string}" if query_string else base

        print(f"GET from {request_url}")
        response = requests.get(request_url)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as err:
        print(f"Network or HTTP exception occurred: {err}")
        return None


def analyze_review_sentiments(text):
    """
    Sends text to the sentiment analyzer microservice for sentiment analysis.
    """
    try:
        encoded_text = quote(text)
        request_url = urljoin(
            sentiment_analyzer_url, f"/analyze/{encoded_text}"
        )

        print(f"GET from {request_url}")
        response = requests.get(request_url)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as err:
        print(f"Network or HTTP exception occurred: {err}")
        return None


def post_review(data_dict):
    """
    Sends a JSON review payload to the backend API for insertion.
    """
    try:
        request_url = urljoin(backend_url, "/insert_review/")
        print(f"POST to {request_url} with data: {data_dict}")

        response = requests.post(request_url, json=data_dict)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as err:
        print(f"Network or HTTP exception occurred: {err}")
        return None
