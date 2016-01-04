function add_to_geo() {
	console.log("Starting data manip");
	for(i = 0; i < statesData["features"].length; i++) {
		for(j = 0; j < recruit_data2.length; j++) {
			if(recruit_data2[j][11].toUpperCase() == statesData.features[i].properties.NAME.toUpperCase() && 
				recruit_data2[j][14] == statesData.features[i].properties.STATE) {
				console.log("MATCHED!");
				if(typeof(statesData.features[i].properties.count) == "undefined") {
					statesData.features[i].properties.count = 1;
				} else {
					statesData.features[i].properties.count += 1;
				}
			} else if(typeof(statesData.features[i].properties.count) == "undefined") {
				statesData.features[i].properties.count = 0;
			}
		}
	}
	console.log("DONE!");
}