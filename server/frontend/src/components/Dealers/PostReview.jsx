import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState();
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  let params = useParams();
  let id = params.id;
  let review_url = `/djangoapp/add_review/`;

  const postreview = async () => {
    let name =
      sessionStorage.getItem("firstname") +
      " " +
      sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if (!model || review === "" || date === "" || year === "" || model === "") {
      alert("All details are mandatory");
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split[1];

    let jsoninput = JSON.stringify({
      name: name,
      dealership: id,
      review: review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    });

    console.log(jsoninput);
    const res = await fetch(review_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsoninput,
    });

    const json = await res.json();
    console.log("SERVER RESPONSE TO ADD REVIEW", json);
    if (json.status === 200) {
      window.location.href = window.location.origin + "/dealer/" + id;
    } else {
      // Log the rejection reason if the server sends one
      alert(
        `Failed to post review. Server message: ${
          json.message || "Unknown Error"
        }`
      );
    }
  };
  useEffect(() => {
    const dealer_url = `/djangoapp/dealer/${id}`;
    const carmodels_url = `/djangoapp/get_cars/`;
    const fetchData = async () => {
      // Fetch dealer info
      try {
        const res = await fetch(dealer_url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const retobj = await res.json();
          if (retobj.status === 200 && retobj.dealer) {
            const dealerobjs = Array.from(retobj.dealer || []);
            if (dealerobjs.length > 0) setDealer(dealerobjs[0]);
          } else {
            console.error("Unexpected dealer response:", retobj);
          }
        } else {
          console.error("Failed to fetch dealer, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching dealer:", err);
      }

      // Fetch car models
      try {
        const res = await fetch(carmodels_url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const retobj = await res.json();
          if (retobj && retobj.CarModels) {
            const carmodelsarr = Array.from(retobj.CarModels || []);
            setCarmodels(carmodelsarr);
          } else {
            console.warn("No CarModels in response:", retobj);
          }
        } else {
          console.error("Failed to fetch car models, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching car models:", err);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>
        <textarea
          id="review"
          cols="50"
          rows="7"
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <div className="input_field">
          Purchase Date{" "}
          <input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="input_field">
          Car Make
          <select
            name="cars"
            id="cars"
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" selected disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel) => (
              <option value={carmodel.CarMake + " " + carmodel.CarModel}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year{" "}
          <input
            type="int"
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
          />
        </div>

        <div>
          <button className="postreview" onClick={postreview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};
export default PostReview;
