'use strict';

$(function () {
  var circle = void 0;
  var $mapDiv = $('#map');
  var circles = [];
  var checkBoxesChecked = void 0;

  var map = new google.maps.Map($mapDiv[0], {
    center: { lat: 42.77509, lng: 13.01239 },
    zoom: 4
  });

  //CURRENT POSITION
  var currentPosition = navigator.geolocation.getCurrentPosition(function (position) {
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
            circle = new google.maps.Circle({
              center: bounds.getCenter(),
              map: map,
              radius: 500000,
              fillColor: '#ff00ff',
              category: disaster.categories[0].title
            });
            circles.push(circle);
            addInfoWindowForDisaster(disaster, circle);
          })();
        } else {
          circle = new google.maps.Circle({
            center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
            map: map,
            radius: 500000,
            fillColor: '#ff00ff',
            category: disaster.categories[0].title
          });
          circles.push(circle);
          addInfoWindowForDisaster(disaster, circle);
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
    $container.html('\n      <div id="logInForm">\n      <form class="login" action="api/login" method="post" onchange="getCheckedBoxes()">\n      <label for="email"></label>\n      <input type="text" name="email" placeholder="email" value="">\n      <label for="password"></label>\n      <input type="password" name="password" placeholder="password" value="">\n      <input type="submit" name="Log in" value="Log in" class=\'button\'><br>\n      </form>\n      </div>\n      <br><br><br>\n      <div id="registerForm">\n      <form class="register" action="api/register" method="post">\n      <label for="username"></label>\n      <input type="text" name="username" placeholder="username" value="">\n      <label for="email"></label>\n      <input type="text" name="email" placeholder="email" value="">\n      <label for="password"></label>\n      <input type="password" name="password" placeholder="password" value="">\n      <label for="passwordConfirmation"></label>\n      <input type="password" name="passwordConfirmation" placeholder="password confirmation" value="">\n      <input type="submit" name="register" value="Register" class=\'button\'><br>\n      </form>\n      </div>\n      ');
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
    $container.html('\n        <form class="filter" action="#" method="get">\n        <input type="checkbox" class="checkBox" name="drought" value="Drought" checked="true">Drought\n        <input type="checkbox" class="checkBox" name="dustAndHaze" value="Dust and Haze" checked="true">Dust and Haze\n        <input type="checkbox" class="checkBox" name="wildfires" value="Wildfires" checked="true">Wildfires\n        <input type="checkbox" class="checkBox" name="floods" value="Floods" checked="true">Floods\n        <input type="checkbox" class="checkBox" name="severeStorms" value="Severe Storms" checked="true">Severe Storms\n        <input type="checkbox" class="checkBox" name="volcanoes" value="Volcanoes" checked="true">Volcanoes\n        <input type="checkbox" class="checkBox" name="waterColor" value="Water Color" checked="true">Water Color\n        <input type="checkbox" class="checkBox" name="landslides" value="Landslides" checked="true">Landslides\n        <input type="checkbox" class="checkBox" name="seaLakeIce" value="Sea Lake Ice" checked="true">Sea Lake Ice\n        <input type="checkbox" class="checkBox" name="earthquakes" value="Earthquakes" checked="true">Earthquakes\n        <input type="checkbox" class="checkBox" name="snow" value="Snow" checked="true">Snow\n        <input type="checkbox" class="checkBox" name="temperatureExtreme" value="Temperature Extremes" checked="true">Temperature Extreme\n        <input type="checkbox" class="checkBox" name="manMade" value="Manmade" checked="true">Manmade\n        <button>Filter</button>\n        <button id="logOut">Log Out</button>\n        </form>\n        ');
    $("input").on("click", function () {
      var inputValue = this.value;
      console.log(inputValue);
      getCheckedBoxes();
    });
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

  //ADD INFO WINDOW
  function addInfoWindowForDisaster(disaster, circle) {
    google.maps.event.addListener(circle, "click", function () {
      getTweets(disaster.title);
      console.log(circle.category);
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

  function getTweets(title) {
    var tweets = $.get('http://localhost:8000/api/tweets?title=' + title).done(function (data) {
      console.log(data);
    });
  }

  function getCheckedBoxes() {
    console.log("change");
    var checkBoxes = $(".checkBox");
    checkBoxesChecked = [];
    for (var i = 0; i < checkBoxes.length; i++) {
      if (checkBoxes[i].checked) {
        checkBoxesChecked.push(checkBoxes[i].defaultValue);
      }
    }
    console.log(checkBoxesChecked);
    filterCategories();
  }

  function filterCategories() {
    for (var i = 0; i < circles.length; i++) {
      if (checkBoxesChecked.indexOf(circles[i].category) > -1) {
        circles[i].setVisible(true);
      } else {
        circles[i].setVisible(false);
      }
    }
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
        }, 150);
      })();
    }
  }
});