var PERMISSIONS = {origins: ['https://api.meetup.com/']};
var API_KEY = '<insert_api_key>';
var MEETUP_URL = 'https://www.meetup.com/';
var URL = 'https://api.meetup.com/find/events';
var params = '?photo-host=public&sign=true&key=' + API_KEY;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationFailure);
}

function onLocationSuccess(position) {
  params += '&lon=' + position.coords.longitude;
  params += '&lat=' + position.coords.latitude;
  loadPage();
}

function onLocationFailure() {
  loadPage();
}

function loadPage() {
  findMeetupEventsRequest(function(data) {
    renderMeetups(JSON.parse(data));
  });
}

function failedToLoadApiResponse() {
  var $results = document.querySelector('#results');
  var $errorDiv = document.createElement('div');
  $errorDiv.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade in" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">x</span></button>
      <strong>Holy guacamole!</strong> Failed to load data for meetups.com. Please try again later.
    </div>`;
  document.getElementById("loader").style.display = "none";
  results.appendChild($errorDiv);
}

function findMeetupEventsRequest(callback) {
  URL  += params;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', URL);
  xhr.timeout = 2000;
  xhr.onreadystatechange = function() {
    if (xhr.readyState==4 && xhr.status === 200) {
      var result = xhr.responseText;
      callback(result);
    } else if (xhr.status !== 200) {
      failedToLoadApiResponse();
    }

  };
  xhr.send();
}

function renderMeetups(meetups) {
  var $results = document.querySelector('#results');
  for (var i = 0; i < Math.min(20, meetups.length); i++) {
    var meetup = buildMeetupDisplayObject(meetups[i]);
    var $meetup = document.createElement('li');
    $meetup.innerHTML = renderMeetupCard(meetup, i);
    results.appendChild($meetup);
    document.getElementById("loader").style.display = "none";
    createGoogleMaps(i, meetup.venue_lat, meetup.venue_lon)
  }
}

function buildMeetupDisplayObject(meetup, index) {
  var date = new Date(meetup.time);
  var venue = meetup.venue;
  var group = meetup.group;
  return {
    "name": meetup.name,
    "venue": venue ? venue.name : 'No venue specified',
    "venue_lat":  venue ? venue.lat : undefined,
    "venue_lon": venue ? venue.lon : undefined,
    "date": moment(date).format('MMM DD'),
    "time": moment(date).format('h:mm A'),
    "link": meetup.link,
    "group": meetup.group,
    "description": meetup.description ? meetup.description : ''
  };
}

function renderMeetupCard(meetup, index) {
  return  `
    <div  class="content">
      <div class="card">
      <div class="block-prefix">
        <div class="sidebar">
          <div class="meetup-date">
            <i class="fa fa-calendar sidebar-icons" aria-hidden="true"></i>${meetup.date}
          </div>
          <i class="fa fa-meetup  fa-5x" aria-hidden="true"></i>
          <div class="meetup-time">
            <i class="fa fa-clock-o sidebar-icons" aria-hidden="true"></i>${meetup.time}
          </div>
          <div class="sidebar-section">
            <i class="fa fa-address-book sidebar-icons" aria-hidden="true"></i>${titleCase(meetup.venue)}
          </div>
          <div class="sidebar-section">
            <i class="fa fa-users sidebar-icons" aria-hidden="true"></i>
            <a href="${MEETUP_URL + meetup.group.urlname}" target="_blank">${titleCase(meetup.group.name)}</a>
          </div>
          <div class="sidebar-section">
            <a href="${meetup.link}" class="btn btn-primary" target="_blank">
            <span class="glyphicon glyphicon-link"></span> Meetup Link</a>
          </div>
        </div>
      </div>
          <div class="firstinfo">

              <div class="meetupinfo">
                  <h1>${titleCase(meetup.name)}</h1>
                  <div class="description">${meetup.description}</div>
                  <div id="venue${index}" class="maps"></div>
              </div>
          </div>
      </div>
  </div>`;
}

function createGoogleMaps(index, lat, lon) {
  if (typeof lat == 'undefined' && typeof lon == 'undefined') {
    return ;
  }
  var uluru = new google.maps.LatLng(lat, lon);
  var map = new google.maps.Map(document.getElementById('venue' + index), {
    zoom: 14,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}
