/**
 * @file This file contains the `Dealers` component, which is responsible for displaying a list of car dealerships.
 *
 * @module Dealers
 */
import React, { useState, useEffect } from "react";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  // let [state, setState] = useState("")
  let [states, setStates] = useState([]);

  // let root_url = window.location.origin
  let dealer_url = "/djangoapp/get_dealers/";

  let dealer_url_by_state = "/djangoapp/get_dealers/";

  const filterDealers = async (state) => {
    try {
      const url = `${dealer_url_by_state}${state}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const retobj = await res.json();
      if (retobj.status === 200 && retobj.dealers) {
        const state_dealers = Array.from(retobj.dealers || []);
        setDealersList(state_dealers);
      } else {
        console.error("Invalid response format:", retobj);
        setDealersList([]);
      }
    } catch (error) {
      console.error("Error fetching dealers by state:", error);
      setDealersList([]);
    }
  };

  const get_dealers = async () => {
    try {
      const res = await fetch(dealer_url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const retobj = await res.json();
      if (retobj.status === 200 && retobj.dealers) {
        const all_dealers = Array.from(retobj.dealers || []);
        const states = all_dealers
          .map((dealer) => dealer.state)
          .filter((state) => state); // Filter out null/undefined states

        setStates(Array.from(new Set(states)));
        setDealersList(all_dealers);
      } else {
        console.error("Invalid response format:", retobj);
        setDealersList([]);
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching all dealers:", error);
      setDealersList([]);
      setStates([]);
    }
  };
  useEffect(() => {
    get_dealers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
  return (
    <div>
      <Header />
      <table className="table">
        <tr>
          <th>ID</th>
          <th>Dealer Name</th>
          <th>City</th>
          <th>Address</th>
          <th>Zip</th>
          <th>
            <select
              name="state"
              id="state"
              onChange={(e) => filterDealers(e.target.value)}
            >
              <option value="" selected disabled hidden>
                State
              </option>
              <option value="All">All States</option>
              {states.map((state) => (
                <option value={state}>{state}</option>
              ))}
            </select>
          </th>
          {isLoggedIn ? <th>Review Dealer</th> : <></>}
        </tr>
        {dealersList.map((dealer) => (
          <tr>
            <td>{dealer["id"]}</td>
            <td>
              <a href={"/dealer/" + dealer["id"]}>{dealer["full_name"]}</a>
            </td>
            <td>{dealer["city"]}</td>
            <td>{dealer["address"]}</td>
            <td>{dealer["zip"]}</td>
            <td>{dealer["state"]}</td>
            {isLoggedIn ? (
              <td>
                <a href={`/postreview/${dealer["id"]}`}>
                  <img
                    src={review_icon}
                    className="review_icon"
                    alt="Post Review"
                  />
                </a>
              </td>
            ) : (
              <></>
            )}
          </tr>
        ))}
      </table>
      ;
    </div>
  );
};

export default Dealers;
