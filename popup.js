var PERMISSIONS = {origins: ['https://api.meetup.com/']};
var API_KEY = '<INSERT_API_KEY_HERE>';
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

function findMeetupEventsRequest(callback) {
  URL  += params;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', URL);
  xhr.addEventListener('load', function(e) {
    var result = xhr.responseText;
    callback(result);
  });
  xhr.send();
}

function renderMeetups(meetups) {
  var $results = document.querySelector('#results');
  for (var i = 0; i < meetups.length; i++) {
    var meetup = buildMeetupDisplayObject(meetups[i]);
    var $meetup = document.createElement('li');
    $meetup.innerHTML = renderMeetupCard(meetup);
    results.appendChild($meetup);
  }

  function buildMeetupDisplayObject(meetup) {
    var date = new Date(meetup.time);
    var venue = meetup.venue;
    var group = meetup.group;
    return {
      "name": meetup.name,
      "venue": venue ? venue.name : 'No venue specified',
      "date": moment(date).format('MMM DD'),
      "time": moment(date).format('h:mm A'),
      "link": meetup.link,
      "group": meetup.group,
      "description": meetup.description ? meetup.description : ''
    };
  }

  function renderMeetupCard(meetup) {
    return  `
      <div  class="content">
        <div class="card">
        <div class="block-prefix">
          <div class="date-box">
            <div class="meetup-date">${meetup.date}</div>
            <i class="fa fa-meetup  fa-5x" aria-hidden="true"></i>
            <div class="meetup-time">${meetup.time}</div>
          </div>
        </div>
            <div class="firstinfo">

                <div class="meetupinfo">
                    <h1>
                      ${titleCase(meetup.name)}
                      <a href="${meetup.link}">
                        <i class="fa fa-external-link" aria-hidden="true"></i>
                      </a>
                    </h1>
                    <h3><b>Venue: </b>${meetup.venue} <br />
                      <b>Group: </b>
                      <a href="${MEETUP_URL + meetup.group.urlname}">${meetup.group.name}</a>
                    </h3>
                    <div class="description">${meetup.description}</div>
                </div>
            </div>
        </div>
    </div>`;
  }

  function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
  }


}
