/**
 * @file This file contains the `Dealer` component, which is responsible for displaying detailed information about a specific car dealership, including its reviews.
 *
 * @module Dealer
 */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>);

  let params = useParams();
  let id = params.id;
  // sentiment icon helper (kept at component scope for rendering)
  const senti_icon = (sentiment) => {
    return sentiment === "positive"
      ? positive_icon
      : sentiment === "negative"
      ? negative_icon
      : neutral_icon;
  };

  useEffect(() => {
    const fetchData = async () => {
      const dealer_url = `/djangoapp/dealer/${id}`;
      const reviews_url = `/djangoapp/reviews/dealer/${id}`;
      const post_review = `/postreview/${id}`;
      // Fetch dealer
      try {
        const res = await fetch(dealer_url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const retobj = await res.json();
          if (retobj.status === 200 && retobj.dealer) {
            const dealerobjs = Array.from(retobj.dealer || []);
            setDealer(dealerobjs[0] || {});
          } else {
            console.error("Unexpected dealer response:", retobj);
          }
        } else {
          console.error("Failed to fetch dealer, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching dealer:", err);
      }

      // Fetch reviews
      try {
        const res = await fetch(reviews_url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const retobj = await res.json();
          if (
            retobj.status === 200 &&
            Array.isArray(retobj.reviews) &&
            retobj.reviews.length > 0
          ) {
            setReviews(retobj.reviews);
          } else {
            setUnreviewed(true);
          }
        } else {
          console.error("Failed to fetch reviews, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }

      // (senti_icon is defined at component scope)

      // Set post review button if user is logged in (UI unchanged)
      if (sessionStorage.getItem("username")) {
        setPostReview(
          <a href={post_review}>
            <img
              src={review_icon}
              style={{ width: "10%", marginLeft: "10px", marginTop: "10px" }}
              alt="Post Review"
            />
          </a>
        );
      }
    };

    fetchData();
  }, [id]); // include id so effect re-runs if route param changes

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>
          {dealer.full_name}
          {postReview}
        </h1>
        <h4 style={{ color: "grey" }}>
          {dealer["city"]},{dealer["address"]}, Zip - {dealer["zip"]},{" "}
          {dealer["state"]}{" "}
        </h4>
      </div>
      <div class="reviews_panel">
        {reviews.length === 0 && unreviewed === false ? (
          <text>Loading Reviews....</text>
        ) : unreviewed === true ? (
          <div>No reviews yet! </div>
        ) : (
          reviews.map((review) => (
            <div className="review_panel">
              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model}{" "}
                {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
