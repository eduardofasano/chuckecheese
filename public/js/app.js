"use strict";

var googleMap = googleMap || {};

googleMap.getRestaurants = function () {
  $.get("http://localhost:3000/api/restaurants").done(this.loopThroughRestaurants);
};

googleMap.loopThroughRestaurants = function (data) {
  data.restaurants.forEach(function (restaurant) {
    //what is this?
    googleMap.createMarkerForRestaurant(restaurant);
  });
};

googleMap.createMarkerForRestaurant = function (restaurant) {
  var latLng = new google.maps.LatLng(restaurant.lat, restaurant.lng);
  var marker = new google.maps.Marker({
    position: latLng,
    map: googleMap.map
  });
  googleMap.addInfoWindowForRestaurant(restaurant, marker);
};

googleMap.addInfoWindowForRestaurant = function (restaurant, marker) {
  var _this = this;

  google.maps.event.addListener(marker, "click", function () {
    //why do we need the marker; is this event delegation?
    if (_this.infoWindow) {
      _this.infoWindow.close();
    }
    googleMap.infoWindow = new google.maps.InfoWindow({
      content: "<h2>" + restaurant.name + "</h2>\n                <p>" + restaurant.description + "</p>\n                <img src='" + restaurant.image + "'</>"
    });
    _this.infoWindow.open(_this.map, marker);
  });
};

googleMap.initEventHandlers = function () {
  var $newForm = $('.new');
  $newForm.on('submit', function (e) {
    e.preventDefault();
    console.log("Working");
    var data = $newForm.serialize();
    $.ajax({
      url: '/api/restaurants/',
      method: "POST",
      data: data
    }).done(function (data) {
      googleMap.createMarkerForRestaurant(data.restaurant);
    });
  });
};

googleMap.showPosition = function () {
  var _this2 = this;

  navigator.geolocation.getCurrentPosition(function (position) {
    var latLng = { lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    _this2.map.panTo(latLng);

    var marker = new google.maps.Marker({
      icon: './images/marker.png',
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      map: _this2.map
    });
  });
};

googleMap.mapSetup = function () {
  var canvas = document.getElementById("mapCanvas");
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(51.5, -0.08)
  };
  this.map = new google.maps.Map(canvas, mapOptions); //where is the little "map" coming from?
  this.getRestaurants();
  this.initEventHandlers();
  this.showPosition();
};

$(googleMap.mapSetup.bind(googleMap)); //why do we need the jQuery coat here?