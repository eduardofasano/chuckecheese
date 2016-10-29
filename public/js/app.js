$(() => {
  let $mapDiv = $('#map');

  let map = new google.maps.Map($mapDiv[0], {
    center: { lat: 42.77509, lng: 13.01239 },
    zoom: 3
  });

  navigator.geolocation.getCurrentPosition((position) => {
    let latLng = {
      lat: position.coords.latitude,
      lng:position.coords.longitude
    };
    map.panTo(latLng);
    map.setZoom(5);

    let maker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      map
    });
  });


  let getEvents = $.get('http://eonet.sci.gsfc.nasa.gov/api/v2/events')
  .done(function(data) {
    let res = data;
    // console.log(res);
    let firstRes = res.events[0].geometries[0].coordinates[2];
    // console.log(firstRes);
    // console.log(res.events[0].geometries[0].coordinates[0][0]);
    let eventLinks = [];
    let bounds = new google.maps.LatLngBounds();
    res.events[0].geometries[0].coordinates.forEach((coords) => {
      // console.log("Lat: "+ varLat);
      // console.log("Lng: "+ varLng);
      // new google.maps.Marker({
      //   position: { lat: coords[1], lng: coords[0] },
      //   map: map
      // });
      bounds.extend(new google.maps.LatLng(coords[1], coords[0]));
    });

    // let rectangle = new google.maps.Rectangle({
    //   strokeColor: '#FF0000',
    //   strokeOpacity: 0.8,
    //   strokeWeight: 2,
    //   fillColor: '#ffffff',
    //   fillOpacity: 0.35,
    //   map: map,
    //   bounds: bounds
    // });

    new google.maps.Circle({
      center: bounds.getCenter(),
      map: map,
      radius: 5000,
      fillColor: '#ff00ff'
    });
});










});
