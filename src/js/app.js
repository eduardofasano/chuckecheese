$(() => {
  let $mapDiv = $('#map');
  let circles = [];

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



  //POPULATE MAP
  function populateMap() {
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
          circles.push(circle);
        } else {
          let circle = new google.maps.Circle({
            center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
            map: map,
            radius: 500000,
            fillColor: '#ff00ff'
          });
          circles.push(circle);
        }
      });
      console.log(circles);
    });
  }

  let $container = $('#container');
  $container.on('submit', 'form', handleForm);
  $container.on('click', '#logOut', logout);


  //CREATE FORM
  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  if(isLoggedIn()) {
    showFilterForm();
    populateMap();
  } else {
    showLoginForm();
  }

  function showLoginForm() {
    if (event) event.preventDefault();
    $container.html(`
      <div id="logInForm">
      <form class="login" action="api/login" method="post">
      <label for="email"></label>
      <input type="text" name="email" placeholder="email" value="">
      <label for="password"></label>
      <input type="password" name="password" placeholder="password" value="">
      <input type="submit" name="Log in" value="Log in" class='button'><br>
      </form>
      </div>
      <br><br><br>
      <div id="registerForm">
      <form class="register" action="api/register" method="post">
      <label for="username"></label>
      <input type="text" name="username" placeholder="username" value="">
      <label for="email"></label>
      <input type="text" name="email" placeholder="email" value="">
      <label for="password"></label>
      <input type="password" name="password" placeholder="password" value="">
      <label for="passwordConfirmation"></label>
      <input type="password" name="passwordConfirmation" placeholder="password confirmation" value="">
      <input type="submit" name="register" value="Register" class='button'><br>
      </form>
      </div>
      `);
    }

    function handleForm() {
      if(event) event.preventDefault();
      let token = localStorage.getItem('token');
      let $form = $(this);

      let url = $form.attr('action');
      let method = $form.attr('method');
      let data = $form.serialize();

      //LOGGING IN & REGISTRATION
      $.ajax({
        url,
        method,
        data,
        beforeSend: function(jqXHR) {
          if(token) return jqXHR.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }).done((data) => {
        if(data.token) localStorage.setItem("token", data.token);
        console.log('hello');
        showFilterForm();
        populateMap();
      });
    }

    function showFilterForm() {
      if (event) event.preventDefault();
      $container.html(`
        <form class="filter" action="#" method="get">
        <input type="checkbox" name="drought" value="Drought">Drought
        <input type="checkbox" name="dustAndHaze" value="Dust and Haze">Dust and Haze
        <input type="checkbox" name="wildfires" value="Wildfires">Wildfires
        <input type="checkbox" name="floods" value="Floods">Floods
        <input type="checkbox" name="severeStorms" value="Severe Storms">Severe Storms
        <input type="checkbox" name="volcanoes" value="Volcanoes">Volcanoes
        <input type="checkbox" name="waterColor" value="Water Color">Water Color
        <input type="checkbox" name="landslides" value="Landslides">Landslides
        <input type="checkbox" name="seaLakeIce" value="Sea Lake Ice">Sea Lake Ice
        <input type="checkbox" name="earthquakes" value="Earthquakes">Earthquakes
        <input type="checkbox" name="snow" value="Snow">Snow
        <input type="checkbox" name="temperatureExtreme" value="Temperature Extreme">Temperature Extreme
        <input type="checkbox" name="manMade" value="Man Made">Man Made
        <button>Filter</button>
        <button id="logOut">Log Out</button>
        </form>
        `);
      }

      function logout() {
        if(event) event.preventDefault();
        localStorage.removeItem('token');
        showLoginForm();
        circles.forEach((circle) => {
          circle.setMap(null);
        });
        circles = [];
      }












    });
