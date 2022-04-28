var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicXVlbnRpbm11bGxlciIsImEiOiJjbDJoaHhuN3MwZHpjM2lwaG8zeTYxMGxjIn0.k47skeSjpBY-QnUQ7RvuJw'
}).addTo(map);

var markers = L.markerClusterGroup()

const pubs = d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-alendro_and_the_aleandros/master/open_pubs.csv")

pubs.then(function (data) {
    for (var i = 0; i < data.length; i++) {
        // The condition below is there to take care of some lat/lon being /N and /N.
        if(data[i].latitude != data[i].longitude) {
            var marker = L.marker([data[i].latitude, data[i].longitude]);
            marker.bindPopup(`Name: ${data[i].name}<br>Address: ${data[i].address}<br>District: ${data[i].local_authority}`).openPopup();
            markers.addLayer(marker);
        }
    }
    map.addLayer(markers);
});