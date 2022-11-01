window.cebuCityLocation = null;
window.cityBounds = null;
window.markers = [];
window.googleMap = null
window.currentLoc = null;
window.directionsRenderer = null;

function findCebuBounds() {
  const geocoder = new google.maps.Geocoder()
  const request = {
    address: 'Cebu City',
    location: window.cebuCityLocation
  }
  return geocoder.geocode(request)
}

function findNearbyRestos(category) {
  var query = {
    query: 'restaurant near Cebu City',
    bounds: window.cityBounds
  }
  if (query != null) {
    query['query'] = category + ' near Cebu City'
  }
  var service = new google.maps.places.PlacesService(window.googleMap);
  var allResults = []
  return new Promise(function (resolved) {
    service.textSearch(query, function (results, status, pagination) {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        console.log(`results: ${results.length}`)
        allResults = allResults.concat(results)
        if (pagination && pagination.hasNextPage) {
          console.log('has next page')
          pagination.nextPage()
        } else {
          console.log(`allResults: ${allResults.length}`)
          resolved(allResults)
        }
      }
    });
  })

}

function filterByCategory(query) {

  findNearbyRestos(query)
    .then(
      function (result) {
        removeAllMarkers()
        addAllToMarkers(result)
        // showAllMarkers()
        console.log(window.googleMap)
      }
    )
}

function removeAllMarkers() {
  for (let marker of window.markers) {
    marker.setMap(null)
  }
}

function infowindowContent(place) {
  return `
  <div>
    <h2>${place.name}</h2>
    <p>${place.formatted_address}</p>
    <a href="#inline" class="navigation-btn" data-lat=${place.geometry.location.lat()} data-lng=${place.geometry.location.lng()}>navigate</a>
  </div>
  `
}


function renderDirections(origin, destination) {
  console.log(`render directions from ${origin} to ${destination}`)
  const request = {
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING'
  }
  var directionsService = new google.maps.DirectionsService();
  window.directionsRenderer.setMap(window.googleMap)
  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      window.directionsRenderer.setDirections(result);
    }
  });
}

function addAllToMarkers(places) {
  window.markers = []
  console.log(`results to add: ${places.length}`)
  for (let place of places) {
    // console.log(place)
    let marker = new google.maps.Marker({ position: place.geometry.location, map: window.googleMap, title: place.name })

    marker.addListener('click', () => {
      let infowindow = new google.maps.InfoWindow({
        content: infowindowContent(place),
        arial_label: place.name
      });
      window.googleMap.setCenter(marker.getPosition())
      infowindow.open({ anchor: marker, map: window.googleMap })
    })
    window.markers.push(marker)
  }
}

function getCurrenLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.currentLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      () => {
      }
    );
  }
}

function resetNavigation() {
  window.directionsRenderer.setMap(null)
  window.googleMap.setZoom(10)
  window.googleMap.setCenter(cebuCityLocation)
}

function initAllRestos() {
  findCebuBounds()
    .then(
      function (result) {
        window.cityBounds = result.results[0].geometry.bounds
        return findNearbyRestos()
      }
    ).then(
      function (results) {
        addAllToMarkers(results)
      }
    )
}

function initGoogleMap(){
  window.googleMap.setZoom(10)
  window.googleMap.setCenter(cebuCityLocation)
}

function initMap() {
  window.directionsRenderer = new google.maps.DirectionsRenderer();
  getCurrenLocation()
  window.cebuCityLocation = new google.maps.LatLng(10.3156992, 123.8854366);
  window.googleMap = new google.maps.Map(document.getElementById("map"))
  initGoogleMap();
  initAllRestos();

  $('#reset-filter').on('click', initAllRestos)
  $('button.resto-type-filter').on('click', function () { filterByCategory($(this).text()) })
  $('#reset-navigation').on('click', resetNavigation)
  $(document).on('click', 'a.navigation-btn', (e) => {
    let elem = $(e.target)
    let destination = new google.maps.LatLng(elem.data('lat'), elem.data('lng'))
    renderDirections(window.currentLoc, destination)
  })

}

window.initMap = initMap;
