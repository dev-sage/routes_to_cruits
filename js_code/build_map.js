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
             console.log("Finished loading path data.")
        });

   var school_data;
   d3.text('my_data/school_data.csv', function(error, _data){
             school_data = d3.csv.parseRows(_data);
             console.log("Finished loading school data.")
        });

   var recruit_data, coords;
   d3.text('my_data/recruit_loc_data.csv', function(error, _data) {
            recruit_data = d3.csv.parseRows(_data);
            console.log("Finished loading recruit data.")
            coords = convert_data(); // Me so crazy.
   			test_coords(coords);
        });

   function test_coords(coords) {
   	for(i = 0; i<coords.length; i++) {
   		if(isNaN(coords[i][0]) == true || isNaN(coords[i][1] == true )) {
   			console.log(i + " is NaN.");
   		}
   	}
   }

  /*var recruit_data2, coords;
   d3.text('my_data/all_recruits.csv', function(error, _data) {
            recruit_data2 = d3.csv.parseRows(_data);
            console.log("Finished loading recruit2 data.")
            coords = convert_data(); // Me so crazy.
        }); */ 
  
   function convert_data() {
     var coords = Array(recruit_data.length);
     for(i = 0; i < recruit_data.length; i++) {
      coords[i] = [parseFloat(recruit_data[i][1]), parseFloat(recruit_data[i][2])];
     }
     return(coords);
   }

   var heat, points, map_overlay = new L.FeatureGroup(), heat_state = false;
   function draw_heatmap(coords) {
    if(heat_state == false) {
      heat = L.heatLayer(coords, {radius: 13, blur: 25});
      map_overlay.addLayer(heat);
      map.addLayer(map_overlay);
      heat_state = true;
      //document.getElementById("heat_button").value = ("Remove 10-Year Heat Map");
    } else { clear_overlay(); }
   }
       
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

    function clear_overlay() {
      map_overlay.clearLayers();
      heat_state = chloro_state = false;
      document.getElementById("heat_button").value = (" 10-Year Heat Map");
      //document.getElementById("chl_button").value = ("Chloropleth Map");
    }
/*
   function getColor(d) {
    return d > 7 ? '#d73027' :
           d > 6  ? '#f46d43' :
           d > 5  ? '#fdae61' :
           d > 4  ? '#fee08b' :
           d > 3   ? '#d9ef8b' :
           d > 2   ? '#a6d96a' :
           d > 1   ? '#66bd63' :
                      '#1a9850';
}

    function style(feature) {
      return {
        weight: 0.5,
        color: 'black',
        fillOpacity: 0.65,
        fillColor: getColor(feature.properties.count)
      };
    }

    var chloro_state = false;
    function draw_chloropleth(coords) {
    if(chloro_state == false) {
      var chloro = L.geoJson(statesData, {style: style});
      map_overlay.addLayer(chloro);
      map.addLayer(map_overlay);
      chloro_state = true;
      document.getElementById("chl_button").value = ("Remove Chloropleth Map");
    } else { clear_overlay(); }
   } */ 


    /* Drawing polylines */ 
    function pull_routes(school_str) {
      clearMap();

      var decoded_path = new Array(data.length);
      var path_array = new Array(data.length);

      var school_lat, my_school_icon, school_col1, school_col2;

      my_school_icon = new school_icon({iconUrl: 'my_icons/' + school_str + '_icon.png'});

      // This is a stupid way to do this. Think of a better one.
      var p = 0;
      while(p < school_data.length) {
        if(school_data[p][3] == school_str) break;
        p++;
      }

      school_col1 = school_data[p][4];
      school_col2 = school_data[p][5];

      var marker = L.marker([school_data[p][1], school_data[p][0]], {icon: my_school_icon});
      markers.addLayer(marker);
      map.addLayer(markers);

      for(i = 0; i < data.length; i++) {
        if(data[i][5] == school_str) {
          decoded_path[i] = L.Polyline.fromEncoded(data[i][0]);

          if(decoded_path[i].getLatLngs().length > 1) {
             path_array[i] = new L.Polyline(decoded_path[i].getLatLngs(),
            {snakingSpeed: 800, snakingPause: 0, color: school_col1, opacity: 0.75, weight: 1.00});
           } 

           else {
            var latlng1, latlng2, lat_lng;
            latlng1 = [decoded_path[i].getLatLngs()[0].lat, decoded_path[i].getLatLngs()[0].lng];
            latlng2 = [parseFloat(school_data[p][1]) + 0.0002, parseFloat(school_data[p][0]) + 0.0002];
            lat_lng = [latlng1, latlng2];

            path_array[i] = new L.Polyline(lat_lng,
            {snakingSpeed: 800, snakingPause: 0, color: school_col1, opacity: 0.75, weight: 1.00});
           }

          path_array[i].addTo(map).snakeIn();
      }
    } 

     // Drawing 50 closest routes (in terms of duration);
      var decoded_path2 = new Array(50);
      var path_array2 = new Array(50);
      var count = 0;
      for(i = 0; count < 50; i++) {
        if(data[i][5] == school_str) {
          decoded_path2[i] = L.Polyline.fromEncoded(data[i][0]);

          if(decoded_path[i].getLatLngs().length > 1) {
             path_array2[i] = new L.Polyline(decoded_path2[i].getLatLngs(),
            {snakingSpeed: 200, snakingPause: 0, color: school_col2, opacity: 0.80, weight: 2.75});
           } 

           else {
            var latlng1, latlng2, lat_lng;
            latlng1 = [decoded_path2[i].getLatLngs()[0].lat, decoded_path2[i].getLatLngs()[0].lng];
            latlng2 = [parseFloat(school_data[p][1]) + 0.0002, parseFloat(school_data[p][0]) + 0.0002];
            lat_lng = [latlng1, latlng2];
            
            path_array2[i] = new L.Polyline(lat_lng,
            {snakingSpeed: 200, snakingPause: 0, color: school_col2, opacity: 0.80, weight: 2.75});
           }

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
        total_dist += parseInt(data[i][3]);
        total_dur += parseInt(data[i][4]);
        count++;
      }
    }


    // Calculate output variables for display on the overlay div.
    var avg_dist = total_dist / top_num * 0.00062137;
    var avg_dur = total_dur / top_num / 3600;

    document.getElementById("header").innerHTML = (school_str);
    document.getElementById("avg_travel_time").innerHTML = ("Average Travel Time: " + roundr(avg_dur, 2) + " Hours");
    document.getElementById("avg_dist").innerHTML = ("Average Distance: " + roundr(avg_dist, 2) + " Miles");

   }

   	
    function change_color() {
    	var my_elem = document.getElementById("heat_button");
    	if(heat_state) {
    		my_elem.style.background = "green";
    	} else {
    		my_elem.style.background = "red";
    	}
    	
    }

   $(document).ready(function() {
   	$(id = heat_button).mouseenter(function() {
   		$(id = heat_button).fadeTo('fast', 0.85);
   	});
   	$(id = heat_button).mouseleave(function() {
   		$(id = heat_button).fadeTo('slow', 0.50);
   	});
   });



