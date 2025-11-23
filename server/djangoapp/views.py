"""
Django views for handling user authentication, car data, and dealership
reviews.

This module provides the view functions for the 'djangoapp' application.
These views handle user registration, login, and logout, as well as fetching
car and dealership information from the backend service. It also includes
views for retrieving and submitting dealership reviews.
"""

import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.
@csrf_exempt
def login_user(request):
    """
    Handles user sign-in requests.

    This view authenticates a user based on the provided username and password.
    If authentication is successful, it logs the user in and returns an
    'Authenticated' status. Otherwise, it returns an 'Unauthenticated' status.

    Args:
        request (HttpRequest): The incoming HTTP request, expected to contain
                               a JSON body with 'userName' and 'password'.

    Returns:
        JsonResponse: A JSON response indicating the authentication status.
                      Returns status 400 for invalid JSON or missing fields,
                      401 for failed authentication, and 200 for success.
    """
    # Get username and password from request.POST dictionary
    # Safely parse JSON body
    try:
        data = json.loads(request.body or b"{}")
    except Exception:
        return JsonResponse(
            {"error": "Invalid JSON in request body"}, status=400
        )

    # Use .get() to avoid KeyError and support multiple possible keys
    username = data.get("userName") or data.get("username") or ""
    password = data.get("password", "")

    if not username or not password:
        return JsonResponse(
            {"error": "username and password are required"}, status=400
        )
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    response = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        response.update({"status": "Authenticated"})
        return JsonResponse(response)

    # Authentication failed
    response.update({"status": "Unauthenticated"})
    return JsonResponse(response, status=401)


def logout_request(request):
    """
    Handles user sign-out requests.

    This view logs out the current user, effectively terminating their session.
    It returns a JSON response with an empty username and a 'success' status.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        JsonResponse: A JSON response confirming successful logout.
    """
    logout(request)  # Terminate user session
    # Return empty username and success status
    data = {"userName": "", "status": "success"}
    return JsonResponse(data)


@csrf_exempt
def registration(request):
    """
    Handles new user registration requests.

    This view creates a new user with the provided details (username, password,
    email, etc.). It checks for existing users with the same username or email
    to prevent duplicates. On successful registration, the new user is
    automatically logged in.

    Args:
        request (HttpRequest): The incoming HTTP request, expected to be a POST
                               request with a JSON body containing user details.

    Returns:
        JsonResponse: A JSON response indicating the status of the registration.
                      Returns status 405 for non-POST requests, 400 for
                      invalid JSON or missing fields, 200 with an error message
                      for duplicates, and 200 with a success message for
                      successful registration.
    """
    # Ensure the request method is POST. Client-side fetch is POST.
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are accepted"}, status=405
        )

    # 1. Safely parse the JSON body, just like in login_user
    try:
        # Use request.body or b"{}" for safety, then load JSON
        data = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        logger.error("Invalid JSON in registration request body")
        return JsonResponse(
            {"error": "Invalid JSON in request body"}, status=400
        )

    # 2. Extract data, matching the keys used by Register.jsx
    # (userName, firstName, lastName)
    username = data.get("userName")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")

    # Input validation (Crucial to prevent the ValueError)
    if not username or not password or not email:
        return JsonResponse(
            {"error": "All fields (username, password, email) are required"},
            status=400,
        )

    # 3. Check for existence (username and email)
    if User.objects.filter(username=username).exists():
        logger.warning(
            f"Registration attempt failed: Username {username} already taken."
        )
        # Client expects a JSON response, not a redirect
        return JsonResponse(
            {"userName": username, "error": "Already Registered"},
            status=200,  # Use 200 for a successful check, client handles the error message
        )

    if User.objects.filter(email=email).exists():
        logger.warning(
            f"Registration attempt failed: Email {email} already taken."
        )
        return JsonResponse(
            {"userName": username, "error": "Email already registered"},
            status=200,
        )

    # 4. Create the user and handle successful response
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.save()

        # Log the user in automatically after registration
        login(request, user)

        # Return success JSON response (what Register.jsx expects)
        return JsonResponse(
            {"userName": username, "status": "success"},
            status=200,
        )
    except Exception as e:
        logger.error(f"Error during user creation: {e}")
        return JsonResponse(
            {"error": f"Server error during registration: {e}"},
            status=500,
        )


def get_cars(request):
    """
    Retrieves a list of all car models and their makes.

    If the car database is empty, it triggers a one-time population process.
    It then fetches all car models and returns them as a JSON list.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        JsonResponse: A JSON response containing a list of all car models.
    """
    count = CarMake.objects.filter().count()
    print(count)
    if count == 0:
        initiate()

    car_models = CarModel.objects.select_related("car_make")
    cars = []
    for car_model in car_models:
        cars.append(
            {"CarModel": car_model.name, "CarMake": car_model.car_make.name}
        )
    return JsonResponse({"CarModels": cars})


def get_dealerships(request, state="All"):
    """
    Retrieves a list of dealerships, optionally filtered by state.

    This view fetches dealership data from the backend service. If a state is
    provided, it requests dealerships from that specific state; otherwise, it
    requests all dealerships.

    Args:
        request (HttpRequest): The incoming HTTP request.
        state (str, optional): The state to filter dealerships by.
                               Defaults to "All".

    Returns:
        JsonResponse: A JSON response containing the list of dealerships.
    """
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_reviews(request, dealer_id):
    """
    Retrieves all reviews for a specific dealer and analyzes their sentiment.

    This view fetches reviews for the given 'dealer_id' from the backend
    service. It then sends each review to a sentiment analysis microservice
    and adds the sentiment to the review data.

    Args:
        request (HttpRequest): The incoming HTTP request.
        dealer_id (int): The ID of the dealer whose reviews are to be fetched.

    Returns:
        JsonResponse: A JSON response containing the reviews with sentiment,
                      or a 'Bad Request' error if 'dealer_id' is not provided.
    """
    # if dealer id has been provided
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail["review"])
            print(response)
            review_detail["sentiment"] = response["sentiment"]
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_details(request, dealer_id):
    """
    Retrieves the details of a specific dealer.

    This view fetches detailed information for the given 'dealer_id' from the
    backend service.

    Args:
        request (HttpRequest): The incoming HTTP request.
        dealer_id (int): The ID of the dealer to fetch details for.

    Returns:
        JsonResponse: A JSON response containing the dealer's details, or a
                      'Bad Request' error if 'dealer_id' is not provided.
    """
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


def add_review(request):
    """
    Submits a new review for a dealership.

    This view allows authenticated users to post a new review. The review data
    is received in the request body and sent to the backend service for storage.

    Args:
        request (HttpRequest): The incoming HTTP request, expected to contain
                               a JSON body with the review data.

    Returns:
        JsonResponse: A JSON response indicating the status of the submission.
                      Returns status 200 on success, 401 on error, and 403
                      for unauthenticated users.
    """
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            response = post_review(data)
            return JsonResponse({"status": 200})
        except Exception as e:
            return JsonResponse(
                {"status": 401, "message": "Error in posting review"}
            )
    else:
        return JsonResponse({"status": 403, "message": "Unauthorized"})
