var googleMap = googleMap || {};

googleMap.getRestaurants = function () {
  $.get("http://localhost:3000/api/restaurants")
  .done(this.loopThroughRestaurants);
};

googleMap.loopThroughRestaurants = (data) => {
  data.restaurants.forEach((restaurant) => { //what is this?
    googleMap.createMarkerForRestaurant(restaurant);
  });
};

googleMap.createMarkerForRestaurant = (restaurant) => {
  let latLng = new google.maps.LatLng(restaurant.lat, restaurant.lng);
  let marker = new google.maps.Marker({
    position: latLng,
    map: googleMap.map
  });
  googleMap.addInfoWindowForRestaurant(restaurant, marker);
};

googleMap.addInfoWindowForRestaurant = function(restaurant, marker) {
  google.maps.event.addListener(marker, "click", () => { //why do we need the marker; is this event delegation?
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    googleMap.infoWindow = new google.maps.InfoWindow({
      content: `<h2>${restaurant.name}</h2>
                <p>${restaurant.description}</p>
                <img src='${restaurant.image}'</>`
    });
    this.infoWindow.open(this.map, marker);
  });
};

googleMap.initEventHandlers = function() {
  let $newForm = $('.new');
  $newForm.on('submit', (e) => {
     e.preventDefault();
     console.log("Working");
     let data = $newForm.serialize();
     $.ajax({
       url: '/api/restaurants/',
       method: "POST",
       data
     }).done((data) => {
       googleMap.createMarkerForRestaurant(data.restaurant);
     });
   });
};

googleMap.showPosition = function () {
  navigator.geolocation.getCurrentPosition((position) => {
  let latLng =
  { lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  this.map.panTo(latLng);

  let marker = new google.maps.Marker({
    icon: './images/marker.png',
    position: latLng,
    animation: google.maps.Animation.DROP,
    draggable: true,
    map: this.map
  });
});
};

googleMap.mapSetup = function() {
  let canvas = document.getElementById("mapCanvas");
  let mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(51.5, -0.08),
  };
  this.map = new google.maps.Map(canvas, mapOptions);  //where is the little "map" coming from?
  this.getRestaurants();
  this.initEventHandlers();
  this.showPosition();
};

$(googleMap.mapSetup.bind(googleMap)); //why do we need the jQuery coat here?
