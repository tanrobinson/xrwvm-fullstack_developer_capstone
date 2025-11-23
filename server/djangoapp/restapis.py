import os
from urllib.parse import quote, urlencode, urljoin

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv("BACKEND_URL", "http://node-api-service:3030")
sentiment_analyzer_url = os.getenv(
    "SENTIMENT_ANALYZER_URL", "http://sentiment-analyzer-service:5050"
)


def get_request(endpoint, **kwargs):
    """
    Performs a GET request to the specified endpoint of the backend service.

    This function constructs the request URL, safely joins the base URL with the
    endpoint, and encodes any provided keyword arguments as query parameters.
    It then executes the GET request and returns the JSON response.

    Args:
        endpoint (str): The API endpoint to which the request will be sent.
        **kwargs: Arbitrary keyword arguments that will be sent as query
                  parameters.

    Returns:
        dict or None: A dictionary containing the JSON response from the
                      backend, or None if a network or HTTP error occurs.
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
    Analyzes the sentiment of a given text by sending it to a dedicated
    sentiment analyzer microservice.

    This function encodes the text to be URL-safe, constructs the request URL,
    and sends the text to the sentiment analyzer. It returns the sentiment
    analysis result as a JSON object.

    Args:
        text (str): The text whose sentiment is to be analyzed.

    Returns:
        dict or None: A dictionary containing the sentiment analysis results,
                      or None if a network or HTTP error occurs.
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
    Posts a new review to the backend service.

    This function sends a POST request with a JSON payload (the review data)
    to the backend's endpoint for inserting new reviews.

    Args:
        data_dict (dict): A dictionary containing the review data to be posted.

    Returns:
        dict or None: A dictionary containing the JSON response from the
                      backend, or None if a network or HTTP error occurs.
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
