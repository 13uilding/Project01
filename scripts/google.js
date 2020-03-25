// Google Maps Implementation
var latLng;

export function createMarker(event, color) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(
      event._embedded.venues[0].location.latitude,
      event._embedded.venues[0].location.longitude
    ),
    title: event.name,
    animation: google.maps.Animation.DROP
  });
  //   marker.addListener()

  marker.setIcon(`http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`);
  return marker;
}

export async function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        initMap(position)
      }, showError)
  } else {
      var x = document.getElementById("location");
      x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function initMap(position) {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: lat, lng: lng }
  });
  var marker = new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: map
  });
  latLng = [lat, lng];
}


export function populateMarkers(storedEvents) {
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: latLng[0], lng: latLng[1] }
  });
  for (event in storedEvents) {
    storedEvents[event].marker.setMap(map);
  }
  var marker = new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: map
  });
}

function showError(error) {
  switch(error.code) {
      case error.PERMISSION_DENIED:
          x.innerHTML = "User denied the request for Geolocation."
          break;
      case error.POSITION_UNAVAILABLE:
          x.innerHTML = "Location information is unavailable."
          break;
      case error.TIMEOUT:
          x.innerHTML = "The request to get user location timed out."
          break;
      case error.UNKNOWN_ERROR:
          x.innerHTML = "An unknown error occurred."
          break;
  }
}

export function testerino() {
  console.log("WORKS")
}