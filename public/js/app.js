'use strict';

$(function () {
  var $mapDiv = $('#map');
  var circles = [];

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
  function populateMap() {
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
            circles.push(circle);
            addInfoWindowForDisaster(disaster, circle);
          })();
        } else {
          var _circle = new google.maps.Circle({
            center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
            map: map,
            radius: 500000,
            fillColor: '#ff00ff'
          });
          circles.push(_circle);
          addInfoWindowForDisaster(disaster, _circle);
        }
      });
    });
  }

  var $container = $('#container');
  $container.on('submit', 'form', handleForm);
  $container.on('click', '#logOut', logout);

  //CREATE FORM
  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if (isLoggedIn()) {
    showFilterForm();
    populateMap();
  } else {
    showLoginForm();
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $container.html('\n      <div id="logInForm">\n      <form class="login" action="api/login" method="post">\n      <label for="email"></label>\n      <input type="text" name="email" placeholder="email" value="">\n      <label for="password"></label>\n      <input type="password" name="password" placeholder="password" value="">\n      <input type="submit" name="Log in" value="Log in" class=\'button\'><br>\n      </form>\n      </div>\n      <br><br><br>\n      <div id="registerForm">\n      <form class="register" action="api/register" method="post">\n      <label for="username"></label>\n      <input type="text" name="username" placeholder="username" value="">\n      <label for="email"></label>\n      <input type="text" name="email" placeholder="email" value="">\n      <label for="password"></label>\n      <input type="password" name="password" placeholder="password" value="">\n      <label for="passwordConfirmation"></label>\n      <input type="password" name="passwordConfirmation" placeholder="password confirmation" value="">\n      <input type="submit" name="register" value="Register" class=\'button\'><br>\n      </form>\n      </div>\n      ');
  }

  function handleForm() {
    if (event) event.preventDefault();
    var token = localStorage.getItem('token');
    var $form = $(this);

    var url = $form.attr('action');
    var method = $form.attr('method');
    var data = $form.serialize();

    //LOGGING IN & REGISTRATION
    $.ajax({
      url: url,
      method: method,
      data: data,
      beforeSend: function beforeSend(jqXHR) {
        if (token) return jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }).done(function (data) {
      if (data.token) localStorage.setItem("token", data.token);
      console.log('hello');
      showFilterForm();
      populateMap();
    });
  }

  function showFilterForm() {
    if (event) event.preventDefault();
    $container.html('\n        <form class="filter" action="#" method="get">\n        <input type="checkbox" name="drought" value="Drought">Drought\n        <input type="checkbox" name="dustAndHaze" value="Dust and Haze">Dust and Haze\n        <input type="checkbox" name="wildfires" value="Wildfires">Wildfires\n        <input type="checkbox" name="floods" value="Floods">Floods\n        <input type="checkbox" name="severeStorms" value="Severe Storms">Severe Storms\n        <input type="checkbox" name="volcanoes" value="Volcanoes">Volcanoes\n        <input type="checkbox" name="waterColor" value="Water Color">Water Color\n        <input type="checkbox" name="landslides" value="Landslides">Landslides\n        <input type="checkbox" name="seaLakeIce" value="Sea Lake Ice">Sea Lake Ice\n        <input type="checkbox" name="earthquakes" value="Earthquakes">Earthquakes\n        <input type="checkbox" name="snow" value="Snow">Snow\n        <input type="checkbox" name="temperatureExtreme" value="Temperature Extreme">Temperature Extreme\n        <input type="checkbox" name="manMade" value="Man Made">Man Made\n        <button>Filter</button>\n        <button id="logOut">Log Out</button>\n        </form>\n        ');
  }

  function logout() {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    showLoginForm();
    circles.forEach(function (circle) {
      circle.setMap(null);
    });
    circles = [];
  }

  // //CURRENT POSITION
  //   navigator.geolocation.getCurrentPosition((position) => {
  //     let latLng = {
  //       lat: position.coords.latitude,
  //       lng:position.coords.longitude
  //     };
  //     map.panTo(latLng);
  //     //map.setZoom(5);
  //
  //     let maker = new google.maps.Marker({
  //       position: latLng,
  //       animation: google.maps.Animation.DROP,
  //       draggable: true,
  //       map
  //     });
  //   });


  //ADD INFO WINDOW
  function addInfoWindowForDisaster(disaster, circle) {
    google.maps.event.addListener(circle, "click", function () {
      // console.log(circle);
      // console.log(disaster);
      var infoWindow = new google.maps.InfoWindow({
        content: '\n            <h2>' + disaster.title + '</h2>',
        position: circle.center
      });
      infoWindow.open(map, circle);
      map.setCenter(circle.center);
      map.panTo(circle.center);
      smoothZoom(map, 8, map.getZoom());
    });
  }

  //http://stackoverflow.com/questions/4752340/how-to-zoom-in-smoothly-on-a-marker-in-google-maps
  function smoothZoom(map, max, cnt) {
    if (cnt >= max) {
      return;
    } else {
      (function () {
        var z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
          google.maps.event.removeListener(z);
          smoothZoom(map, max, cnt + 1);
        });
        setTimeout(function () {
          map.setZoom(cnt);
        }, 200);
      })();
    }
  }
});