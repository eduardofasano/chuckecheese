$(() => {
  let $mapDiv = $('#map');

  let map = new google.maps.Map($mapDiv[0], {
    center: { lat: 42.77509, lng: 13.01239 },
    zoom: 4
  });

//CURRENT POSITION
  navigator.geolocation.getCurrentPosition((position) => {
    let latLng = {
      lat: position.coords.latitude,
      lng:position.coords.longitude
    };
    map.panTo(latLng);
    //map.setZoom(5);

    let maker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      map
    });
  });

  let getEvents = $.get('http://eonet.sci.gsfc.nasa.gov/api/v2/events')
  .done(function(data) {
    console.log(data);
    data.events.forEach((disaster) => {
      if(disaster.geometries[0].coordinates[0] instanceof Array) {
        let bounds = new google.maps.LatLngBounds();
        disaster.geometries[0].coordinates.forEach((coords) => {
          bounds.extend(new google.maps.LatLng(coords[1], coords[0]));
        });
        let circle = new google.maps.Circle({
          center: bounds.getCenter(),
          map: map,
          radius: 500000,
          fillColor: '#ff00ff'
        });
      } else {
        let circle = new google.maps.Circle({
          center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
          map: map,
          radius: 500000,
          fillColor: '#ff00ff'
        });
      }
    });
});

// //RECTANGLE FUNCTIONALITY
// let rectangle = new google.maps.Rectangle({
//   strokeColor: '#FF0000',
//   strokeOpacity: 0.8,
//   strokeWeight: 2,
//   fillColor: '#ffffff',
//   fillOpacity: 0.35,
//   map: map,
//   bounds: bounds
// });








});
