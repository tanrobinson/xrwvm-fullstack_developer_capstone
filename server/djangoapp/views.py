# Uncomment the required imports before adding the code
import json
import logging

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import analyze_review_sentiments, get_request, post_review

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.


# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
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


# Create a `logout_request` view to handle sign out request
def logout_request(request):
    logout(request)  # Terminate user session
    # Return empty username and success status
    data = {"userName": "", "status": "success"}
    return JsonResponse(data)


# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
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


# Create a `get_cars` view to return a list of cars
def get_cars(request):
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


# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# Update the `get_dealerships` render list of dealerships all by default,
# particular state if state is passed
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
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


# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


# Create a `add_review` view to submit a review
def add_review(request):
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
