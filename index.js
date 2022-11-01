function findCebuBounds(callback, map) {
  const geocoder = new google.maps.Geocoder()
  const request = {
    address: 'Cebu City',
    location: new google.maps.LatLng(10.3156992, 123.8854366)
  }
  geocoder.geocode(request, function (results, status) {
    if (status = 'OK' && results.length > 0) {
      callback(results[0].geometry.bounds, map)
    }
  })
}

function findNearbyRestos(bounds, map) {
  var query = {
    query: 'restaurants',
    bounds: bounds
  }
  console.log(`findRequest: ${query}`)
  var service = new google.maps.places.PlacesService(map);

  service.textSearch(query, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log(`Restaurants found: ${results.length}`)
      for (var i = 0; i < results.length; i++) {
        console.log(results[i])
        new google.maps.Marker({ position: results[i].geometry.location, map: map })
      }
    }
  });
}
// Initialize and add the map
function initMap() {
  // The location of Uluru
  const cebu = new google.maps.LatLng(10.3156992, 123.8854366);
  // The map, centered at Uluru
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: cebu,
  });

  findCebuBounds(findNearbyRestos, map)

}

window.initMap = initMap;