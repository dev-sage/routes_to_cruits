  var school_icon = L.Icon.extend({
    options: {
        iconSize:     [45, 45],
        iconAnchor:   [15, 15],
        popupAnchor:  [0, 0]
    }
  });

  var ou_icon = new school_icon({iconUrl: 'my_icons/ou_icon.png'});
  var tx_icon = new school_icon({iconSize: [78, 40], iconAnchor: [35, 30], iconUrl: 'my_icons/texas_icon.png'});

  /* Creating Map */ 
    var map = L.map("map", {zoomControl: false}).setView([39.00, -100.50], 5);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: "",
      maxZoom: 9,
      id: 'elsage.ni57hacg',
      accessToken: ki_leaflet
      }).addTo(map);
  /*             */ 

    L.marker([35.22, -97.44], {icon: ou_icon}).addTo(map);
    //L.marker([30.25, -97.75], {icon: tx_icon}).addTo(map);

  /* LOADING DATA */ 
    $.ajax({
    url: "my_data/path_data.csv",
    async: false,
    success: function (csvd) {
        data = $.csv2Array(csvd);
    },
    dataType: "text",
    complete: function () {
        console.log("YOU DID IT!");
    }
    });

  /* Defining variables */
  var decoded_path = new Array(data.length);
  var path_array = new Array(data.length);
  /*              */ 


  /* This is used to clear the map before polylines are drawn */ 
    function clearMap() {
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

    var dc_path;

    /* Drawing polylines */ 
    function pull_routes(school_str) {
      clearMap();
      //var school_icon = new school_icon({iconUrl: 'my_icons/ou_icon.png'});
      school_col = "crimson";

      for(i = 0; i < data.length; i++) {
        if(data[i][2] == school_str) {
          decoded_path[i] = L.Polyline.fromEncoded(data[i][0]);
          path_array[i] = new L.Polyline(decoded_path[i].getLatLngs(),
          {snakingSpeed: 800, snakingPause: 0, color: school_col, opacity: 0.75, weight: 1.00});
          path_array[i].addTo(map).snakeIn();
          //sleep(100);
      };

     }

   }

