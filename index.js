window.cebuCityLocation = null;
window.cityBounds = null;
window.markers = [];
window.googleMap = null

function findCebuBounds() {
  const geocoder = new google.maps.Geocoder()
  const request = {
    address: 'Cebu City',
    location: window.cebuCityLocation
  }

  return geocoder.geocode(request)
}

function findNearbyRestos(price_level) {
  var query = {
    query: 'restaurant near Cebu City',
    bounds: window.cityBounds
  }
  if (price_level != null) {
    query['query'] = price_level + ' near Cebu City'
  }
  console.log(`findRequest: ${query}`)
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

function filterByPriceLevel(price_level) {

  findNearbyRestos(price_level)
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
  </div>
  `
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
      infowindow.open({anchor: marker, map: window.googleMap})
    })
    window.markers.push(marker)
  }
}

function initMap() {
  window.cebuCityLocation = new google.maps.LatLng(10.3156992, 123.8854366);
  window.googleMap = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: cebuCityLocation,
  });

  findCebuBounds()
    .then(
      function (result) {
        window.cityBounds = result.results[0].geometry.bounds
        let bounds = window.cityBounds
        return findNearbyRestos()
      }
    ).then(
      function (results) {
        addAllToMarkers(results)
      }
    )

  $('button.resto-type-filter').on('click', function () { filterByPriceLevel($(this).text()) })
}

window.initMap = initMap;
