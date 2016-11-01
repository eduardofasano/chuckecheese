$(() => {
  let circle;
  let circles = [];
  let infoWindow;
  let checkBoxesChecked;
  let $sidebar = $('.sidebar');
  let $container = $('#container');
  let $mapDiv = $('#map');
  let map = new google.maps.Map($mapDiv[0], {
    center: { lat: 42.77509, lng: 13.01239 },
    zoom: 4
  });

  //CURRENT POSITION
  let currentPosition = navigator.geolocation.getCurrentPosition((position) => {
    let latLng = {
      lat: position.coords.latitude,
      lng:position.coords.longitude
    };
    map.panTo(latLng);

    let maker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      map
    });
  });

  //GO BACK
  $mapDiv.on('click', '#goBack', goBack);
  function goBack() {
    resetMap();
    showFilterForm();
  }

  //RESET MAP
  function resetMap() {
      smoothZoomOut(map, 1, map.getZoom());
      populateMap();
      infoWindow.close();
      infoWindow = undefined;
    }

  //POPULATE MAP
  function populateMap() {
    let getEvents = $.get('http://eonet.sci.gsfc.nasa.gov/api/v2/events')
    .done(function(data) {
      data.events.forEach((disaster) => {
        if(disaster.geometries[0].coordinates[0] instanceof Array) {
          let bounds = new google.maps.LatLngBounds();
          disaster.geometries[0].coordinates.forEach((coords) => {
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

  //CREATE LOGIN FORM
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
    $sidebar.html(`
      <div id="logInForm">
      <form class="login" action="api/login" method="post" onchange="getCheckedBoxes()">
      <label for="email"></label>
      <input type="text" name="email" placeholder="email" value="">
      <label for="password"></label>
      <input type="password" name="password" placeholder="password" value="">
      <input type="submit" name="Log in" value="Log in" class='button'><br>
      </form>
      </div>

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

    //HANDLE-FORM
    $container.on('submit', 'form', handleForm);
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

    //LOGOUT
    $container.on('click', '#logOut', logout);
    function logout() {
      if(event) event.preventDefault();
      localStorage.removeItem('token');
      showLoginForm();
      circles.forEach((circle) => {
        circle.setMap(null);
      });
      circles = [];
    }

    //CREATE FILTER FORM
    function showFilterForm() {
      if (event) event.preventDefault();
      $sidebar.html(`
        <form class="filter" action="#" method="get">
        <input type="checkbox" class="checkBox" name="drought" value="Drought" checked="true">Drought
        <input type="checkbox" class="checkBox" name="dustAndHaze" value="Dust and Haze" checked="true">Dust and Haze
        <input type="checkbox" class="checkBox" name="wildfires" value="Wildfires" checked="true">Wildfires
        <input type="checkbox" class="checkBox" name="floods" value="Floods" checked="true">Floods
        <input type="checkbox" class="checkBox" name="severeStorms" value="Severe Storms" checked="true">Severe Storms
        <input type="checkbox" class="checkBox" name="volcanoes" value="Volcanoes" checked="true">Volcanoes
        <input type="checkbox" class="checkBox" name="waterColor" value="Water Color" checked="true">Water Color
        <input type="checkbox" class="checkBox" name="landslides" value="Landslides" checked="true">Landslides
        <input type="checkbox" class="checkBox" name="seaLakeIce" value="Sea Lake Ice" checked="true">Sea Lake Ice
        <input type="checkbox" class="checkBox" name="earthquakes" value="Earthquakes" checked="true">Earthquakes
        <input type="checkbox" class="checkBox" name="snow" value="Snow" checked="true">Snow
        <input type="checkbox" class="checkBox" name="temperatureExtreme" value="Temperature Extremes" checked="true">Temperature Extreme
        <input type="checkbox" class="checkBox" name="manMade" value="Manmade" checked="true">Manmade
        <button>Filter</button>
        <button id="logOut">Log Out</button>
        </form>
        `);
        $("input").on("click", function () {
          let inputValue = this.value;
          console.log(inputValue);
          getCheckedBoxes();
        });
      }

      //TWITTER FUNCTIONALITY
      function showTwitterForm() {
        if(event) event.preventDefault();
        $sidebar.html(`
          <div class="tweetStream">Tweets Div
            <ul class="tweetItems">
            </ul>
          </div>
        `);
      }

      let $tweetStream = $('.tweetStream');

      function getTweets(title) {
        let tweets = $.get(`http://localhost:8000/api/tweets?q=${title}`)
        .done(function(data) {
          let $tweetItems = $('.tweetItems');
          data.statuses.forEach((tweet) => {
            // console.log(tweet);
            let itemHtml =

              '<li class="stream-item">'+'<div class="tweet">'+'<a href="#">' +
                  '<img src="'+ tweet.user.profile_image_url +'" alt="User image goes here.">' +
                  '</a>' +
                '<div class="content">' +
                   '<strong class="fullname">'+ tweet.user.name +'</strong>' +
                   '<span>&rlm;</span>' +
                   '<span>@</span><b>' + tweet.user.screen_name + '</b>' +
                   '&nbsp;&middot;&nbsp;' +
                   '<small class="time">' +
                      tweet.created_at +
                   '</small>' +
                   '<p>' + tweet.text +'</p>' +
                  '</div>' +
                '</div>' +
              '</li>'
            ;
            $tweetItems.append(itemHtml);

              // '<li>'+tweet.text+'</li>');
          });
        });
      }

      //ADD INFO WINDOW
      function addInfoWindowForDisaster(disaster, circle) {
        google.maps.event.addListener(circle, "click", () => {
          getTweets(disaster.title);
          console.log(circle.category);
          infoWindow = new google.maps.InfoWindow({
            content: `
            <h2>${disaster.title}</h2>
            <h4>${disaster.geometries[0].date}</h4>
            <a href="${disaster.sources[0].url}" target="_blank">More Information</a>
            <button id="goBack">Go Back</button>`,
            position: circle.center,
          });
          map.setCenter(circle.center);
          map.panTo(circle.center);
          smoothZoomIn(map, 8, map.getZoom());
          circles.forEach((circle) => {
            circle.setMap(null);
          });
          circles = [];
            setTimeout(() =>{
              infoWindow.open(map, circle);
            }, 1500);
            showTwitterForm();
      });
    }

      //FILTERING FUNCTIONALITY
      function getCheckedBoxes () {
        console.log("change");
        let checkBoxes = $(".checkBox");
        checkBoxesChecked = [];
        for (var i=0; i<checkBoxes.length; i++) {
          if (checkBoxes[i].checked) {
            checkBoxesChecked.push(checkBoxes[i].defaultValue);
          }
        }
        console.log(checkBoxesChecked);
        filterCategories();
      }

      function filterCategories () {
        for(var i=0; i<circles.length; i++) {
          if((checkBoxesChecked.indexOf(circles[i].category)) > -1) {
              circles[i].setVisible(true);
          } else {
              circles[i].setVisible(false);
          }
        }
      }

      //ZOOM-FUNCTIONS
      //http://stackoverflow.com/questions/4752340/how-to-zoom-in-smoothly-on-a-marker-in-google-maps
      function smoothZoomIn (map, max, cnt) {
        if (cnt >= max) {
          return;
        }
        else {
          let z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoomIn(map, max, cnt + 1);
          });
          setTimeout(function(){ map.setZoom(cnt); }, 150);
        }
      }

      function smoothZoomOut (map, min, cnt) {
        if (cnt <= min) {
          return;
        }
        else {
          let z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoomOut(map, min, cnt - 1);
          });
          setTimeout(function(){ map.setZoom(cnt); }, 150);
        }
      }

});
