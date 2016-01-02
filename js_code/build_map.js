  var school_icon = L.Icon.extend({
        options: {
        iconSize:     [45, 45],
        iconAnchor:   [15, 15],
        popupAnchor:  [0, 0]
        }
      });

  var markers = new L.FeatureGroup();

  /* Creating Map */ 
  var map = L.map("map", {zoomControl: false}).setView([39.00, -100.50], 5);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: "",
              maxZoom: 9,
              id: 'elsage.ni57hacg',
              accessToken: ki_leaflet
              }).addTo(map);
  /*             */ 

  document.getElementById("header").innerHTML = ("Pick a School Below");

  var data;
   d3.text('my_data/path_data.csv', function(error, _data){
             data = d3.csv.parseRows(_data);
        });

   var school_data;
   d3.text('my_data/school_data.csv', function(error, _data){
             school_data = d3.csv.parseRows(_data);
             console.log("Finished loading!")
        });
       


  /* This is used to clear the map before polylines are drawn */ 
    function clearMap() {
      markers.clearLayers();
      for(i in map._layers) {
          if(map._layers[i]._path != undefined) {
              try {
                  map.removeLayer(map._layers[i]);
             }
             catch(e) {
                 console.log("problem with " + e + map._layers[i]);
             }
          }
      }
    }


    /* Drawing polylines */ 
    function pull_routes(school_str) {
      clearMap();

      var decoded_path = new Array(data.length);
      var path_array = new Array(data.length);

      var school_lat, my_school_icon;

      my_school_icon = new school_icon({iconUrl: 'my_icons/' + school_str + '_icon.png'});

      // This is a stupid way to do this. Think of a better one.
      var i = 0;
      while(i < school_data.length) {
        if(school_data[i][3] == school_str) break;
        i++;
      }

      school_col = "crimson";

      //L.marker([school_data[i][1], school_data[i][0]], {icon: my_school_icon}).addTo(map);
      var marker = L.marker([school_data[i][1], school_data[i][0]], {icon: my_school_icon});
      markers.addLayer(marker);
      map.addLayer(markers);

      for(i = 0; i < data.length; i++) {
        if(data[i][5] == school_str) {
          decoded_path[i] = L.Polyline.fromEncoded(data[i][0]);
          path_array[i] = new L.Polyline(decoded_path[i].getLatLngs(),
          {snakingSpeed: 800, snakingPause: 0, color: school_col, opacity: 0.75, weight: 1.00});
          path_array[i].addTo(map).snakeIn();
      }
    } 

     // Drawing 20 closest routes (in terms of duration);
      var decoded_path2 = new Array(50);
      var path_array2 = new Array(50);
      var count = 0;
      for(i = 0; count < 50; i++) {
        if(data[i][5] == school_str) {
          console.log("I'm printing.");
          decoded_path2[i] = L.Polyline.fromEncoded(data[i][0]);
          path_array2[i] = new L.Polyline(decoded_path2[i].getLatLngs(),
          {snakingSpeed: 100, snakingPause: 0, color: "blue", opacity: 1, weight: 3.00});
          path_array2[i].addTo(map).snakeIn();
          count++;
      } 
     }

      get_statistics_50(school_str);
   }

   function roundr(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + "e-" + decimals);
   }

   function get_statistics_50(school_str) {
    
    var count = total_dist = total_dur = 0;
    var top_num = 50;
    for(i = 0; count < top_num; i++) {
      if(data[i][5] == school_str) {
        total_dist += parseInt(data[i][3])  ;
        total_dur += parseInt(data[i][4]);
        count++;
      }
    }

    // Calculate output variables for display on the overlay div.
    var avg_dist = total_dist / top_num * 0.00062137;
    var avg_dur = total_dur / top_num / 3600;
    console.log("Average Distance: " + avg_dist);

    document.getElementById("header").innerHTML = (school_str);
    document.getElementById("avg_travel_time").innerHTML = ("Average Travel Time: " + roundr(avg_dur, 2) + " Hours");
    document.getElementById("avg_dist").innerHTML = ("Average Distance: " + roundr(avg_dist, 2) + " Miles");

   }



