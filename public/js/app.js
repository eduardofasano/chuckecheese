'use strict';

$(function () {
  var $mapDiv = $('#map');

  var map = new google.maps.Map($mapDiv[0], {
    center: { lat: 42.77509, lng: 13.01239 },
    zoom: 4
  });

  //CURRENT POSITION
  navigator.geolocation.getCurrentPosition(function (position) {
    var latLng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    map.panTo(latLng);
    //map.setZoom(5);

    var maker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      map: map
    });
  });

  //POPULATE MAP
  var getEvents = $.get('http://eonet.sci.gsfc.nasa.gov/api/v2/events').done(function (data) {
    data.events.forEach(function (disaster) {
      if (disaster.geometries[0].coordinates[0] instanceof Array) {
        (function () {
          var bounds = new google.maps.LatLngBounds();
          disaster.geometries[0].coordinates.forEach(function (coords) {
            bounds.extend(new google.maps.LatLng(coords[1], coords[0]));
          });
          var circle = new google.maps.Circle({
            center: bounds.getCenter(),
            map: map,
            radius: 500000,
            fillColor: '#ff00ff'
          });
          addInfoWindowForDisaster(disaster, circle);
        })();
      } else {
        var _circle = new google.maps.Circle({
          center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
          map: map,
          radius: 500000,
          fillColor: '#ff00ff'
        });
        addInfoWindowForDisaster(disaster, _circle);
      }
    });
  });

  //ADD INFO WINDOW
  function addInfoWindowForDisaster(disaster, circle) {
    google.maps.event.addListener(circle, "click", function () {
      console.log(circle);
      console.log(disaster);
      var infoWindow = new google.maps.InfoWindow({
        content: '\n      <h2>' + disaster.title + '</h2>',
        position: circle.center
      });
      infoWindow.open(map, circle);
    });
  }
});