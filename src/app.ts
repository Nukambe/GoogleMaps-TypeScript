import { Loader } from "@googlemaps/js-api-loader";
import axios from "axios";

type GoogleGeocodingResponse = {
  results: { geometry: { location: { lat: number; lng: number } } }[];
  status: "OK" | "ZERO_RESULTS";
};

let map: google.maps.Map;
let marker: google.maps.Marker;

const loader = new Loader({
  apiKey: process.env.GOOGLE_API_KEY!,
  version: "weekly",
});

const form = document.querySelector("form")!;
const addressInput = document.getElementById("address")! as HTMLInputElement;
let coordinates: { lat: number; lng: number };

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAddress = addressInput.value;

  axios
    .get<GoogleGeocodingResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
        enteredAddress
      )}&key=${process.env.GOOGLE_API_KEY}`
    )
    .then((res) => {
      if (res.data.status !== "OK") {
        throw new Error("Could not fetch location!");
      }
      coordinates = res.data.results[0].geometry.location;
    })
    .then(() =>
      loader.load().then(() => {
        map = new google.maps.Map(
          document.getElementById("map") as HTMLElement,
          {
            center: coordinates,
            zoom: 16,
          }
        );
        marker = new google.maps.Marker({
          position: coordinates,
          map: map,
        });
        return marker;
      })
    )
    .catch((err) => console.log(err));
}

form.addEventListener("submit", searchAddressHandler);
