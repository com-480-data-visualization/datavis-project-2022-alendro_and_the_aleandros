//Setting variables and the map
var jsonData = [
    {"fact":"Oldest Bar", "lat": 51.74936, "lon": -0.34694, "text": "A lot of bars fight to obtain the title of \"Oldest Bar\" in the UK. But the \"Ye Olde Fighting Cocks\" has the advantage to receive the distinction from the Guiness Book of records. However, the title was rested in 2000. Nevertheless, it seems to be a very good place to drink a pint", "link": "https://www.fightingcockssa.com/"},
    {"fact":"Smallest Bar", "lat": 52.2448, "lon":0.71275, "text": "The Nutshell is supposedly the smallest pub in the UK. The bar measures just 15ft (=4.57m) by 7ft (=2.13m) for a total surface of 105 feet squared (=9.75 meter squared). Nevertheless, it seems to be a very good place to drink a beer", "link": "http://www.thenutshellpub.co.uk/"},
    {"fact":"Biggest Bar", "lat": 51.3319, "lon":1.4237, "text":"The \"Royal Victoria Pavilion\" is supposedly the biggest bar in the UK. The Guardian writes that the building can seat up to 800 people with a total capacity of more than 1,400. And if it's not enough, it has a 6'500 feat squared (603 squared meter) terrace. Nevertheless, it seems to be a very good place to drink a cider", "link": "https://fr.tripadvisor.ch/Restaurant_Review-g186314-d12863074-Reviews-Royal_Victoria_Pavilion-Ramsgate_Isle_of_Thanet_Kent_England.html"},
    {"fact":"Bar with the longest Name", "lat": 51.36996,  "lon":-0.285478, "text": "\"Love Your Greens Catering, King George Fields Indoor Bowls Club\" is the bar with the longest name according to the dataset with 63 letters. It seems to be a very good place play bowls and drink a beer", "link": "https://www.kgfindoorbowlsclub.co.uk/"},
    {"fact":"Bar with the shortest Name", "lat": 52.191353, "lon":1.000189, "text": "\"v\" is the bar with the smallest name with just one letter. It can be an error in our dataset or it has maybe a longer name in reality because we don't find any information checking the bar on google. Nevertheless, if it still existed, it would have been a very nice place to grab a drink", "link": ""},
    {"fact":"Bar furthest away from any other Bar", "lat": 56.620741, "lon":-6.069821, "text": "If you're at the \"MacGochans\" and someone tells you \"Alright mate, we'll go to another bar, want to come?\". Answer no. According to our dataset, there is no other bar in the vicinity of this one. You would have to cross the sea in order to go to another bar. You better stay where you are...as it seems to be a nice place to drink a beer", "link": "https://macgochans-tobermory.co.uk/"},
    {"fact":"Point furthest away from any other Bar in England", "lat": 55.49057203, "lon":-2.30319293, "text": "Here, there is no bar of course. But the neirest one is at 13 kms away (as the crow flies). If you think about it, it's maybe the best place to start your bar. We are sure it we'll be a very nice place to drink your beer", "link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"}
  ];

var map = L.map("map", {zoomControl: false});
map.setView([54.05, 0], 5.75);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoicXVlbnRpbm11bGxlciIsImEiOiJjbDJoaHhuN3MwZHpjM2lwaG8zeTYxMGxjIn0.k47skeSjpBY-QnUQ7RvuJw'
            }).addTo(map);

L.control.zoom({position: "topleft"}).addTo(map);

var markers = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        var n_markers = cluster.getChildCount();
        if(n_markers < 100) {
            var html = '<div class = "beer" style = "transform: scale(0.4)"><div style = "transform: scale(2.5); text-align: center; padding: 15px">' + n_markers + '</div></div>';
        } else {
            var html = '<div style = "display: flex; transform: scale(0.4)"><div class = "beer" style = "flex: 1; -webkit-transform: scaleX(-1); transform: scaleX(-1) rotate(-20deg);"></div><div class = "beer" style = "flex: 1; position: relative; left: 10px; transform: rotate(-20deg)"><div style = "transform: scale(2.5); text-align: center; padding: 15px">' + n_markers + '</div></div></div>';
        }
        return L.divIcon({html: html, className: 'beerCluster', iconAnchor: [50, 50]});
    },
});

var sidebar = L.control.sidebar({ container: "sidebar", position: "right" }).addTo(map)
    .open("home");
    

function  remove_loading_screen_callback(){
    document.getElementById("loading_screen").style.display = 'none';
}

function load_markers(){
    return new Promise(() => {
        d3.csv("https://raw.githubusercontent.com/com-480-data-visualization/datavis-project-2022-alendro_and_the_aleandros/master/open_pubs.csv").then(function (data) {
            for (var i = 0; i < data.length; i++) {
                // The condition below is there to take care of some lat/lon being /N and /N.
                if(data[i].latitude != data[i].longitude) {
                    var marker = L.marker([data[i].latitude, data[i].longitude], {icon: L.icon({iconUrl: "house.png", iconSize: [32, 32]})});
                    marker.bindPopup(`Name: ${data[i].name}`).openPopup();
                    markers.addLayer(marker);
                  }
                }
            var marker = L.marker([55.49057203,-2.30319293], {icon: L.icon({iconUrl: "house.png", iconSize: [32, 32]})}); //adding the marker of the pub furthest away from any bar
            marker.bindPopup("Name: Heaven's doors (just a suggestion)")
            markers.addLayer(marker)

            var marker = L.marker([51.3319, 1.4237], {icon: L.icon({iconUrl: "house.png", iconSize: [32, 32]})}) //Adding the marker of the biggest bar
            marker.bindPopup("Name: Royal Victoria Pavilion")
            markers.addLayer(marker)

            var marker = L.marker([52.2448, 0.71275], {icon: L.icon({iconUrl: "house.png", iconSize: [32, 32]})}) //Adding the marker of the smallest bar
            marker.bindPopup("Name: The Nutshell")
            markers.addLayer(marker)

            map.addLayer(markers);
            remove_loading_screen_callback(); //Once loading is done, we remove the loading
            })
        })
    }


load_markers() 

//Creating the table
var table = d3.select("#table_container").append("table");
var	tbody = table.append('tbody');// append the header row
var rows = tbody.selectAll('tr').data(jsonData).enter().append('tr');
var columns = ['Dummy column']; //Need a dummy column that we'll not show to 

//Function that returns all the data based on the name of the fact
function get_all_data_by_fact(name){
    for(let i = 0; i < jsonData.length; i++){
        if(name == jsonData[i]["fact"]){
            return [jsonData[i]["lat"], jsonData[i]["lon"], jsonData[i]["text"], jsonData[i]["link"]];
        }
    }
};

//Fill the cells of the table
var cells = rows.selectAll('td').data(function (row) {
    return ['Dummy'].map(function (column) {
      return {column: column, value: row["fact"]};
    });
  }).enter().append('td').text(function (d) {return d.value;}).on("click", function(d, object){
          
    var [lat, long, new_text, new_link] = get_all_data_by_fact(object.value);
    
    //Update text and link
    d3.select("#text_to_update").select("h2").text(object.value)
    d3.select("#text_to_update").select('p').text(new_text);
    d3.select('#update_link').select('a').attr("href", new_link).text(new_link == ""? "No Website available":"Check website")

    map.flyTo([lat, long], 18);
    }
);

       
    
    

        
        

        
       
       
        
       