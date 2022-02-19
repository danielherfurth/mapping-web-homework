function markerSize(magnitude) {
    return magnitude * 5;
}

// palette made with http://tristen.ca/hcl-picker/#/hlc/6/1/57A46D/EE8767
function markerColor(eqDepth) {
    if (eqDepth < 1) {
        // light green
        return '#2ce260'
    } else if (eqDepth < 5) {
        // greenish
        return '#88d743'
    } else if (eqDepth < 10) {
        // yellowish
        return '#b0b439'
    } else if (eqDepth < 20) {
        // orangeish
        return '#bb8609'
    } else if (eqDepth < 30) {
        // orange
        return '#ce6000'
    } else if (eqDepth >= 30) {
        // red
        return '#db3100'
    }
}


var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";


Promise.all([d3.json(queryUrl)
]).then(function (data) {
    createFeatures(data[0].features);
});


function createFeatures(earthquakeData) {


    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: createPopup,
        pointToLayer: createMarker
    });


    createMap(earthquakes);

}

function createPopup(feature, layer) {
    return layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magntude:" + feature.properties.mag + "</p>" + "</p><hr><p>Depth:" + feature.geometry.coordinates[2] + "</p>");
}

function createMarker(feature, location) {
    var options = {
        fillOpacity: 0.7,
        fillColor: markerColor(feature.geometry.coordinates[2]),
        // stroke: true,
        opacity: 1,
        weight: 1,
        color: '#ffffff',
        radius: markerSize(feature.properties.mag)
    }
    return L.circleMarker(location, options);
}

function createMap(earthquakes) {

    var attr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

    var darkmap = L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: attr,
            maxZoom: 18,
            id: 'mapbox/dark-v10',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: API_KEY
        });


    var myMap = L.map("map", {
        center: [34, -118],
        zoom: 4.5,
        layers: [earthquakes, darkmap]
    })


    // make the legend
    var legend = L.control({position: "bottomleft"});
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var limits = ['<1', '5', '10', '20', '30', '>=30']
        var colors = ['#2ce260', '#88d743', '#b0b439', '#bb8609', '#ce6000', '#db3100'];

        var labels = [];

        // Add min & max
        var legendInfo = "<h1 style=\"color:red\">Earthquake Depth</h1>" +
            "<div class=\"labels\">" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function (limit, index) {
            labels.push(`<li style="background-color: ${colors[index]}">${limit}</li>`);
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    }
    legend.addTo(myMap);

}


