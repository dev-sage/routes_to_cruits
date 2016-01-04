
	// Import the dataset, then build to the data.
		d3.csv("my_data/all_recruits.csv", function(dataset) {
			dataset.forEach(function(row) {
				row.wt = +row.Wt,


			});

			var moused = false;

			var w = 1000, 
				h = 500,
				side_pad = 50,
				top_pad = 50,
				select_cx, select_cy, select_r;

			// Mouse Position
			var mouse_coords = [,];

			/*var tool_tip = d3.select("body")
							 .append("div")
							 .attr("class", "tooltip_1")
							 .style("opacity", 0); */ 

			xScale = d3.scale.linear()
							 .domain([d3.min(dataset, function(row) {
							 			return row.salary; }), 
							 		  d3.max(dataset, function(row) {
							 			return (row.salary * 1.1); })])
							 .range([side_pad, w - side_pad * 2]);

			yScale = d3.scale.linear()
							 .domain([0, d3.max(dataset, function(row) {
							 	return (row.avgpts * 1.1); })])
							 .range([h - top_pad, top_pad]);

			rScale = d3.scale.linear()
							 .domain([d3.min(dataset, function(row) {
							 			return row.avgpts; }), 
							 		  d3.max(dataset, function(row) {
							 			return row.avgpts; })])
							 .range([1, 10]);

			xAxis = d3.svg.axis()
						  .scale(xScale)
						  .orient("bottom");

			yAxis = d3.svg.axis()
						  .scale(yScale)
						  .orient("left")
						  .ticks(5);

			var svg = d3.selectAll("div")
						.append("svg")
						.attr("width", w)
						.attr("height", h);

			// Use div w/text.
			/*var rect_tip = svg.append("rect")
						  .attr("class", "rect")
						  .attr("x", 0)
						  .attr("y", 0)
						  .attr("rx", 20)
						  .attr("ry", 20)
						  .attr("width", 100)
						  .attr("height", 100)
						  .attr("opacity", 0);*/ 

			var div_tip = d3.select("body")
							.append("div")
							.style("opacity", 0)
							.attr("class", "tooltip");

			var quad1 = svg.append("rect")
						   .attr("opacity", 0.25);

			var quad2 = svg.append("rect")
						   .attr("opacity", 0.25)
						   .attr("fill", "green");

			var quad3 = svg.append("rect")
						   .attr("opacity", 0.25)
						   .attr("fill", "green");

			var quad4 = svg.append("rect")
						   .attr("opacity", 0.25)
						   .attr("fill", "green");


			var xadjust = 5,
				yadjust = 5;
			//Drawing the quadrants

			//Math Vars
			var min_x_val = d3.min(dataset, function(row) { return xScale(row.salary); });
			var max_x_val = d3.max(dataset, function(row) { return xScale(row.salary); });
			var min_y_val = d3.min(dataset, function(row) { return yScale(row.avgpts); });
			var max_y_val = d3.max(dataset, function(row) { return yScale(row.avgpts); });


			pointr = svg.append("circle")
						.attr("fill", "black")
						.attr("opacity", 0)
						.attr("r", 1);

			svg.selectAll("circle")
				.data(dataset)
				.enter()
				.append("circle")
				.attr("cx", function(row) {
					return xScale(row.salary);
				})
				.attr("cy", function(row) {
					return yScale(row.avgpts);
				})
				.attr("r", function(row) {
					return rScale(row.avgpts);
				})
				.attr("fill", function(row) {
					if(row.Position == "QB") { return d3.rgb(179, 70, 12) }
					else if(row.Position == "RB") { return d3.rgb(81, 160, 10) }
					else if(row.Position == "WR") { return d3.rgb(97, 11, 118) };
				})
				.attr("opacity", 0.75)
				.on("click", function(row) {

					moused = true;

					d3.select(this)
					  .attr("opacity", 1);


					  select_cx = d3.select(this).attr("cx");
					  select_cy = d3.select(this).attr("cy")
					  select_r = d3.select(this).attr("r");

					  /*rect_tip.attr("x", d3.event.pageX)
					  	  	  .attr("y", d3.event.pageY- 175)
					  	  	  .attr("opacity", 0);

					  rect_tip.transition()
					  		  .duration(225)
					  		  .ease("cubic")
					  		  .attr("opacity", 0.85); */ 


					  pointr.attr("cx", select_cx)
					  		.attr("cy", select_cy)
					  		.attr("r", 0)
					  		.attr("opacity", 0.5);

					  pointr.transition()
					  		.duration(350)
					  		.attr("r", select_r * 1.50)

					  div_tip.transition()
					  		 .duration(350)
					  		 .style("opacity", 0.95)
					  		 .style("left", (d3.event.pageX) + "px")
					  		 .style("top", (d3.event.pageY) + "px");

					  div_tip.html("<span style = 'color:white'>" + row.Name + "</span> <br>" + 
					  		 	   "<span style = 'color:white'>" + row.Position + "</span> <br>" + 
					  		 	   "Average PPG: " + "<span style = 'color:white'>" + row.avgpts + "</span>");
				})
				.on("mouseout", function() {
					d3.select(this)
					  .attr("opacity", 0.85)
					  .attr("stroke-width", 0);
					  if(moused) {
					  	div_tip.style("opacity", 0.75);
					  }
					  /*rect_tip.attr("opacity", 0);*/ 
				});

			}); 

			svg.append("g")
				.attr("class", "axis")
			   	.attr("transform", "translate(0," + (h-top_pad+10) + ")")
			   	.call(xAxis);


			svg.append("g")
			   .attr("class", "axis")
			   .attr("transform", "translate(" + (side_pad - 10) + "," + 0 + ")")
			   .call(yAxis)
			   .append("text");

			//*******// NEED TO FIX AXES //*******// 

			// X-Axis
			svg.append("text")
				.attr("text-anchor", "end")
				.attr("x", w * 0.90)
				.attr("y", h * 0.90)
				.text("Salary");

			// Y-Axis
			svg.append("text")
				//.attr("text-anchor", "middle")
				.attr("transform", "rotate(-90)")
				.attr("x", h / 100 - 150)
				.attr("y", w * 0.06)
				.text("Average PPG");

		});