$(() => {
  let circle;
  let circles = [];
  let infoWindow;
  let checkBoxesChecked;
  let $sidebar = $('.sidebar');
  let $container = $('#container');
  let $mapDiv = $('#map');
  let map = new google.maps.Map($mapDiv[0], {
    center: { lat: 20, lng: 0 },
    zoom: 3,
    minZoom: 3,
    disableDefaultUI: true,
    styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#000000"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"saturation":"-39"},{"lightness":"35"},{"gamma":"1.08"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"saturation":"0"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"saturation":"-100"},{"lightness":"10"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"saturation":"-100"},{"lightness":"-14"}]},{"featureType":"poi","elementType":"all","stylers":[{"saturation":"-100"},{"lightness":"10"},{"gamma":"2.26"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"saturation":"-100"},{"lightness":"-3"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":"-100"},{"lightness":"54"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"saturation":"-100"},{"lightness":"-7"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"saturation":"-100"}]},{"featureType":"road.local","elementType":"all","stylers":[{"saturation":"-100"},{"lightness":"-2"}]},{"featureType":"transit","elementType":"all","stylers":[{"saturation":"-100"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"saturation":"-100"},{"lightness":"100"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"saturation":"-100"},{"lightness":"-100"}]}]
  });

  let colorPalette = {
    "Drought": "#88b086",
    "Dust And Haze": "#e9dab1",
    "Wildfires": "#d25566",
    "Floods": "#79b4e5",
    "Severe Storms": "#a4dddc",
    "Volcanoes": "#e3a744",
    "Water Color": "#bbe2b8",
    "Landslides": "#f1c7d9",
    "Sea Lake Ice": "#d686d8",
    "Earthquakes": "#d5bae5",
    "Snow": "#d98f91",
    "Temperature Extremes": "#f3f58c",
    "Manmade": "#8a88e5"
  };

  //CURRENT POSITION
  let currentPosition = navigator.geolocation.getCurrentPosition((position) => {
    let latLng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    // map.panTo(latLng);

    let marker = new google.maps.Marker({
      position: latLng,
      animation: google.maps.Animation.DROP,
      draggable: true,
      icon: "../images/green-pin.png",
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
    smoothZoomOut(map, 3, map.getZoom());
    populateMap();
    infoWindow.close();
    infoWindow = undefined;
  }

  //POPULATE MAP
  function populateMap() {
    let getEvents = $.get('http://eonet.sci.gsfc.nasa.gov/api/v2/events')
    .done(function(data) {
      data.events.forEach((disaster) => {
        let category = disaster.categories[0].title;
        if (disaster.geometries[0].coordinates[0] instanceof Array) {
          let bounds = new google.maps.LatLngBounds();
          disaster.geometries[0].coordinates.forEach((coords) => {
            bounds.extend(new google.maps.LatLng(coords[1], coords[0]));
          });
          circle = new google.maps.Circle({
            center: bounds.getCenter(),
            map: map,
            radius: 500000,
            fillColor: colorPalette[category],
            strokeWeight: 1,
            strokeColor: colorPalette[category],
            fillOpacity: 0.4,
            category: disaster.categories[0].title
          });
          $(circle).fadeIn(1000);
          circles.push(circle);
          addInfoWindowForDisaster(disaster, circle);
        } else {
          circle = new google.maps.Circle({
            center: new google.maps.LatLng(disaster.geometries[0].coordinates[1], disaster.geometries[0].coordinates[0]),
            map: map,
            radius: 500000,
            fillColor: colorPalette[category],
            strokeWeight: 1,
            strokeColor: colorPalette[category],
            fillOpacity: 0.4,
            category: disaster.categories[0].title
          });
          $(circle).fadeIn(1000);
          circles.push(circle);
          addInfoWindowForDisaster(disaster, circle);
        }
      });
      setBoxStatus();
    });
  }

  //CREATE LOGIN FORM
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
    $sidebar.html(`
    <div class="formDiv">
      <h1 class="dsquark">DISASTER SQUAWK</h1>
      <p class="strapline">Learn about the worlds disasters in real time.</p>

      <div id="logInForm">
      <p class="ourUsers">Log in...</p><br>
        <form class="login" action="api/login" method="post">
          <label for="email"></label>
          <input type="text" name="email" placeholder="email" value="">
          <label for="password"></label>
          <input type="password" name="password" placeholder="password" value=""><br>
          <input type="submit" name="Log in" value="Log in" class='button'><br>
        </form>
      </div>


      <div id="registerForm">
      <p class="ourUsers">New users...</p><br>
        <form class="register" action="api/register" method="post">
          <label for="username"></label>
          <input type="text" name="username" placeholder="username" value="">
          <label for="email"></label>
          <input type="text" name="email" placeholder="email" value="">
          <label for="password"></label>
          <input type="password" name="password" placeholder="password" value="">
          <label for="passwordConfirmation"></label>
          <input type="password" name="passwordConfirmation" placeholder="password confirmation" value=""><br>
          <input type="submit" name="register" value="Register" class='button'><br><br>
          <p class="powered">Powered by</p><img src="images/nasa.png" id="nasa">
        </form>
      </div>
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

    <ul class="checkbox-grid">
    <h1 class="dsquark">DISASTER SQUAWK</h1>
    <p class="strapline">Filter by available category...</p>
      <form class="filter" action="#" method="get">
        <li><label class="labelStyle" id="drought"><input type="checkbox" class="checkBox" name="drought" value="Drought" checked="true">Drought</label></li>
        <li><label class="labelStyle" id="dust"><input type="checkbox" class="checkBox" name="dustAndHaze" value="Dust and Haze" checked="true">Dust and Haze</label></li>
        <li><label class="labelStyle" id="wildfires"><input type="checkbox" class="checkBox" name="wildfires" value="Wildfires" checked="true">Wildfires</label></li>
        <li><label class="labelStyle" id="floods"><input type="checkbox" class="checkBox" name="floods" value="Floods" checked="true">Floods</label></li>
        <li><label class="labelStyle" id="storms"><input type="checkbox" class="checkBox" name="severeStorms" value="Severe Storms" checked="true">Severe Storms</label></li>
        <li><label class="labelStyle" id="volcanoes"><input type="checkbox" class="checkBox" name="volcanoes" value="Volcanoes" checked="true">Volcanoes</label></li>
        <li><label class="labelStyle" id="water"><input type="checkbox" class="checkBox" name="waterColor" value="Water Color" checked="true">Water Color</label></li>
        <li><label class="labelStyle" id="slides"><input type="checkbox" class="checkBox" name="landslides" value="Landslides" checked="true">Landslides</label></li>
        <li><label class="labelStyle" id="sea"><input type="checkbox" class="checkBox" name="seaLakeIce" value="Sea Lake Ice" checked="true">Sea Lake Ice</label></li>
        <li><label class="labelStyle" id="earthquakes"><input type="checkbox" class="checkBox" name="earthquakes" value="Earthquakes" checked="true">Earthquakes</label></li>
        <li><label class="labelStyle" id="snow"><input type="checkbox" class="checkBox" name="snow" value="Snow" checked="true">Snow</label></li>
        <li><label class="labelStyle" id="temp"><input type="checkbox" class="checkBox" name="temperatureExtreme" value="Temperature Extremes" checked="true">Temperature Extreme</label></li>
        <li><label class="labelStyle" id="man"><input type="checkbox" class="checkBox" name="manMade" value="Manmade" checked="true">Manmade</label></li>
      </form>
      <button id="logOut">Log Out</button>
    </ul>

    `);
    $("input").on("click", function () {
      $(this).parent().toggleClass('clicked');
      let inputValue = this.value;
      console.log(inputValue);
      getCheckedBoxes();
    });
  }

  //INPUT BOX FUNCTIONALITY
  function setBoxStatus () {
    let inputs = $(".checkBox");
    let categoriesOnBoard = [];
    for(let i=0; i<inputs.length; i++) {
      let category = circles[i].category;
      if ((categoriesOnBoard.indexOf(category)) < 0) {
        categoriesOnBoard.push(category);
        console.log(categoriesOnBoard);
      }
      if ((categoriesOnBoard.indexOf(inputs[i].defaultValue)) < 0) {
        inputs[i].setAttribute("disabled", true);
        inputs[i].parentElement.className = "labelStyle clicked disabled";
      }
    }
  }

  //TWITTER FUNCTIONALITY
  function showTwitterForm() {
    if(event) event.preventDefault();
    $sidebar.html(`

      <div class="tweetStream">
      <div class="tweetStreamHeader">Here's what Twitter has to say...</div>
      <ul class="tweetItems">
      </ul>
      </div>
    `);
  }


  let $tweetStream = $('.tweetStream');

  function getTweets(title) {
    console.log("Title", title);
    let tweets = $.get(`http://localhost:8000/api/tweets?q=${title}`)
    .done((data) => {
      if(data.statuses.length === 0) {
          // Truncate the title
          title = title.split(",")[0];
          console.log("Truncated Title: ", title);
          tweets = $.get(`http://localhost:8000/api/tweets?q=${title}`).done((dataTweets) => {
            console.log("dt", dataTweets);
            appendTweet(title, dataTweets);
          }).fail((err)=> {console.log("Somethigng went wrong", err);});

      } else {
        appendTweet(title, data);
      }
    });
  }

let tweetText;

  function appendTweet(title, data){
    console.log(title);
    let $tweetItems = $('.tweetItems');
    data.statuses.forEach((tweet) => {
      tweetText = tweet.text;
      let tweetTime = (tweet.created_at.split(" +0000")[0])+(tweet.created_at.split(" +0000")[1]);
      let itemHtml =
        '<li class="stream-item">'+
          '<div class="tweet">'+
            '<div id="image">'+
              '<img src="'+ tweet.user.profile_image_url +'" alt="User image goes here.">' +
            '</div>' +
            '<div class="content">' +
              '<strong class="fullname">'+ tweet.user.name +'</strong>' +
              '<span>&rlm;</span>' +
              '<span>@</span><b>' + tweet.user.screen_name + '</b>' +
              '&nbsp;&middot;&nbsp;' +
              '<small>' +
                tweetTime +
              '</small>' +
              '<p>' + tweet.text +'</p>' +
            '</div>' +
          '</li>';
      $tweetItems.append(itemHtml);
            // '<li>'+tweet.text+'</li>');
    });
    $('.tweet a').attr('target', '_blank');
  }

  //ADD INFO WINDOW
  function addInfoWindowForDisaster(disaster, circle) {
    google.maps.event.addListener(circle, "click", () => {
      getTweets(disaster.title);
      console.log(circle.category);
      console.log(disaster);
      let date = new Date(disaster.geometries[0].date).toLocaleDateString("en-GB");
      infoWindow = new google.maps.InfoWindow({
        content: `
        <div class="infoWindow">
          <h2>${disaster.title}</h2>
          <h5>${date}</h5>
          <a class="button" href="${disaster.sources[0].url}" target="_blank">More Information</a>
          <button id="goBack">Go Back</button>
        </div>
        `,
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
  function smoothZoomIn(map, max, cnt) {
    if (cnt >= max) {
      return;
    } else {
      let z = google.maps.event.addListener(map, 'zoom_changed', function(event) {
        google.maps.event.removeListener(z);
        smoothZoomIn(map, max, cnt + 1);
      });
      setTimeout(function() {
        map.setZoom(cnt);
      }, 150);
    }
  }

  function smoothZoomOut(map, min, cnt) {
    if (cnt < min) {
      setTimeout(function() {
        map.panTo({ lat: 20, lng: map.getCenter().lng() });
      }, 150);
      return;
    } else {
      let z = google.maps.event.addListener(map, 'zoom_changed', function(event) {
        google.maps.event.removeListener(z);
        smoothZoomOut(map, min, cnt - 1);
      });
      setTimeout(function() {
        map.setZoom(cnt);
      }, 150);
    }
  }
});
