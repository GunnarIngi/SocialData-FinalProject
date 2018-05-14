    //Data variables:
    var boroughsCoordinatesGEOJSON;
    var uber_and_taxi_pickups_13_05_2014;
    var uber_and_taxi_pickups_sample_13_05_2014
    var pickupsByTime;
    var mapOfPickupsByTime;
    var pickups;
    var selectedPickupsByTime;
    var selectedPickupsByTimeNew;


    //Timeline chart variables
    var svgTimeline;
    var path;
    var timelineMargin = {top: 0, right: 20, bottom: 40, left: 60}; //Mike Bostock’s margin convention
    var defaultTimelineWidth = 1200 - timelineMargin.right - timelineMargin.left;
    var defaultTimelineHeight = 220 - timelineMargin.top - timelineMargin.bottom;
    var sumCurve;

    //Map chart variables
    var svgMap;
    var projection;
    var margin = {top: 20, right: 20, bottom: 40, left: 60}; //Mike Bostock’s margin convention
    var defaultMapWidth = 600;
    var defaultMapHeight = 400;

    //Other variables
    var datasetCollection = [];
    var axisPadding=-10;
    var brush;
    var xScale;
    var circles;
    var brush_coords;

    //Manage value of color for each borough
    function Borocolor(BoroCode) {
        return ["#BA68C8", "#4DD0E1", "#64B5F6", "#4DB6AC", "#9575CD"][BoroCode - 1];
    }

    //Define map projection
  	projection = d3.geoMercator()
      								   .translate([defaultMapWidth/2.2, defaultMapHeight/2])
      								   .scale([40000])
                         .center([-73.95,40.70]);
    //Define path generator
    path = d3.geoPath()
             	  .projection(projection);

    //Create SVG element for timeline
    svgTimeline = d3.select("#three")
                      .append("svg")
                      .attr("width", defaultTimelineWidth + timelineMargin.right + timelineMargin.left)
                      .attr("height", defaultTimelineHeight + timelineMargin.top + timelineMargin.bottom);

    //Create SVG element for boroughs
    svgMap = d3.select("#three")
                      .append("svg")
                      .attr("id", "map")
                      .attr("width", defaultMapWidth)
                      .attr("height", defaultMapHeight)
                      d3.select("#map").append("text")
                      //.attr("text-anchor", "end")
                      .attr("y", 390)
                      .attr("x", 150)
                      .text("Map of New York City 5 boroughs");


    // Define function to draw circles on the borough map
    // Use just in callback function
    function drawCirclesOnTheBoroughMap(data) {
          svgMap.selectAll("circle")
      					.data(data)
      					.enter()
      					.append("circle")
      					.attr("cx", function(d) {
      							   return projection([d.Longitude, d.Latitude])[0];
      					})
      					.attr("cy", function(d) {
                       return projection([d.Longitude, d.Latitude])[1];
      					})
      					.attr("r", 3)
                .attr("class", function(d) {
                          if(d.Uber==1){console.log("non"); return "non_brushed";}else{console.log("bru");return "brushed";}
      					});
    }
    /*
                    var drawFilteredCircles = function (murders) {
                       svgMap.selectAll("circle")
                              .data(murders)
                              .enter()
                              .append("circle")
                              .attr("cx", function(d) {
                                  return projection([d.Longitude, d.Latitude])[0];
                              })
                              .attr("cy", function(d) {
                                  return projection([d.Longitude, d.Latitude])[1];
                              })
                              .attr("r", 3)
                              .attr('class', 'non_brushed')

                    }
    */
    //Define function to draw Boroughs' names
    //Use just in callback function
    function drawBoroughNamesOnTheMap(){
      svgMap.selectAll("text.borough-label")
            .data(boroughsCoordinatesGEOJSON.features)
            .enter()
            .append("svg:text")
            .attr('class','borough-label')
            .text(function(d){
                  return d.properties.BoroName;
            })
            .attr("x",function(d){
                 return path.centroid(d)[0];
            })
            .attr("y",function(d){
                 return path.centroid(d)[1];
            })
            .attr("text-anchor","middle")
            .attr('font-size', '12pt')
            .attr('font-weight', 'bold');

    }

      //Load in GeoJSON data
      d3.json("../../boroughs.geojson", function(boroughsDatasetError,geojson) {

            if (boroughsDatasetError) {                              //If error is not null, something went wrong.
                console.log(boroughsDatasetError);                   //Log the error.
            } else {                                                 //If no error, the file loaded correctly. Yay!
                boroughsCoordinatesGEOJSON = geojson;                //Log the data.
            }

            //Bind data and create one path per GeoJSON feature
            svgMap.selectAll("path")
            .data(boroughsCoordinatesGEOJSON.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d) {
               var value = d.properties.BoroCode;
               return Borocolor(value);
            });


            parseUberDate=d3.timeParse("%m/%d/%Y %H:%M");
//------------------------------------------------------------------------------------
//INDEX	datetime	Lat	Lon uber_13_05_2014
//INDEX	BORO_NM	RPT_DT	CMPLNT_FR_TM	Latitude	Longitude



            uberRowConverter = function(d) {
              return {
                index: parseInt(d.INDEX),
                Latitude: parseFloat(d.Lat),
                Longitude: parseFloat(d.Lon),
                Hour: parseInt(d.hour),
                Minute: parseInt(d.minute)
              };
            }

            pickupRowConverter = function(d) {
              return {
                Datetime: parseUberDate(d.datetime),
                Latitude: parseFloat(d.Lat),
                Longitude: parseFloat(d.Lon),
                Uber: parseInt(d.Uber)
              };
            }


                // Load in murder data
                d3.csv("data/uber_13_05_2014-seperated_hour_and_minute.csv", uberRowConverter, function(uberDatasetError, data) {

                    if (uberDatasetError) {                              //If error is not null, something went wrong.
                        console.log(uberDatasetError);                   //Log the error.
                    } else {                                               //If no error, the file loaded correctly. Yay!
                        //murdersSince2006To2016 = data;                    //Log the data.
                        uber_and_taxi_pickups_13_05_2014 = data;
                    }
                    d3.csv("data/taxi_&_uber_fraction_1percent_13_05_2014.csv", pickupRowConverter, function(uberDatasetError, data) {

                        if (uberDatasetError) {                              //If error is not null, something went wrong.
                            console.log(uberDatasetError);                   //Log the error.
                        } else {                                               //If no error, the file loaded correctly. Yay!
                            //murdersSince2006To2016 = data;                    //Log the data.
                            uber_and_taxi_pickups_sample_13_05_2014 = data;
                        }

                  //Pre-procession stage:

                  //Grouping data
                  pickupsByTime = d3.nest().key(function(d){ return (d.Hour*60)+d.Minute;}).entries(uber_and_taxi_pickups_13_05_2014);

                  //Sorting for proper displaying purpose
                  mapOfPickupsByTime = pickupsByTime.map(function (d) {
                    return {
                      key: d.key,
                      numberOfpickupsPerMinute: d.values.length,
                      pickups: d.values
                    };
                  })
                  .sort(function (a, b) {
                    if (parseInt(a.key)< parseInt(b.key))
                      return -1;
                      if (parseInt(a.key)>parseInt(b.key))
                        return 1;
                    return 0
                  });

                  // For building line purposes
                  sumCurve = [];

                  function getIndexOfElement(minute, list) {
                      var i;
                      for (i = 0; i < list.length; i++) {
                          if (parseInt(list[i].key) === minute) {
                              return i;
                          }
                      }
                      return -1;
                  }

                 //Supplementation of data - addition minutes without any pickup with value 0
                  var minutesInDay = 1440
                  var indexOfElement;
                  for (var currentMinute = 0; currentMinute < minutesInDay; currentMinute++) {
                        indexOfElement=getIndexOfElement(currentMinute, mapOfPickupsByTime);
                      if(indexOfElement != -1){
                          sumCurve.push([mapOfPickupsByTime[indexOfElement].key, mapOfPickupsByTime[indexOfElement].numberOfpickupsPerMinute]);
                      }else{
                          sumCurve.push([currentMinute, 0]);
                      }
                  }

                  // Creation of the timeline stage:
                  //d3.scaleTime()
                    //  .domain([new Date(2000, 0, 1), new Date(2000, 0, 2)])
                  //Create scales
                  xTimelineScale = d3.scaleTime()
                           .domain([new Date(2014, 4, 13), new Date(2014, 4, 14)])
                           .range([timelineMargin.left, defaultTimelineWidth]);

                  yTimelineScale = d3.scaleLinear()
                             .domain([
                                      d3.min(sumCurve, function(d) { return d[1];}),
                                      d3.max(sumCurve, function(d) { return d[1];})
                                       ])
                             .range([defaultTimelineHeight, 5]);

                  //Define axes
                  xTimelineAxis = d3.axisBottom()
                        .scale(xTimelineScale)
                        .ticks(24);

                  yTimelineAxis = d3.axisLeft()
                        .scale(yTimelineScale)
                        .ticks(10);
                      //  Date(2011, 0, 1, 2, 3, 4, 567);
                      //  alert( date ); // 1.01.2011, 02:03:04.567
                  //Define line generator
                  line = d3.line()
                             .x(function(d) { return xTimelineScale(new Date(2014, 4, 13, parseInt(d[0]/60), d[0]%60)); })
                             .y(function(d) { return yTimelineScale(d[1]); });

                  //Create line
                  svgTimeline.append("path")
                         .datum(sumCurve)
                         .attr("fill", "none")
                         .attr("stroke","steelblue")
                         .attr("stroke-linejoin","round")
                         .attr("stroke-linecap", "round")
                         .attr("stroke-width",1)
                         //.attr("class", "line")
                         .attr("d", line);

                  //Create axes
                  svgTimeline.append("g")
                         .attr("class", "x axis")
                         .attr("transform", "translate(0," + defaultTimelineHeight + ")")
                         .call(xTimelineAxis);

                  svgTimeline.append("g")
                             .attr("class", "y axis")
                             .attr("transform", "translate("+ timelineMargin.left +",0)")
                             .call(yTimelineAxis);

                  svgTimeline.append("text")
                             .attr("class", "y label")
                             .attr("text-anchor", "end")
                             .attr("y", 0)
                             .attr("x", 0)
                             .attr("dy", ".75em")
                             .attr("transform", "rotate(-90) translate(-20, 17)")
                             .text("Pick-ups per minute");

                  svgTimeline.append("text")
                             .attr("class", "x label")
                             .attr("text-anchor", "end")
                             .attr("x", defaultTimelineWidth / 2 + 140)
                             .attr("y", defaultTimelineHeight +37)
                             .text("Exemplary weekday divided by time");
/*
                // Filter if there are some unpropriate coordinates in the data
                // did not add it in the pre-processing stage because date of the murder may be correct
                murdersSince2006To2016 =  murdersSince2006To2016.filter(function (d) {
                      return !isNaN(d.Longitude) && !isNaN(d.Latitude);
                });
*/

                drawCirclesOnTheBoroughMap(uber_and_taxi_pickups_sample_13_05_2014);


                drawBoroughNamesOnTheMap();

                svgMap.append("text")
                      .attr("y", 390)
                      .attr("x", 150)
                      .text("Map of New York City 5 boroughs");
/*
                var drawFilteredCircles = function (murders) {
                   svgMap.selectAll("circle")
                          .data(murders)
                          .enter()
                          .append("circle")
                          .attr("cx", function(d) {
                              return projection([d.Longitude, d.Latitude])[0];
                          })
                          .attr("cy", function(d) {
                              return projection([d.Longitude, d.Latitude])[1];
                          })
                          .attr("r", 3)
                          .attr('class', 'non_brushed')

                   //redraw Boroughs' names
                   svgMap.selectAll("text.borough-label").remove();
                   drawBoroughNamesOnTheMap();
                }
*/

                var filterPickupsAccordiglyToRangeOfTime = function () {
                      svgMap.selectAll("circle")
                            .remove();

                      if (d3.event.selection != null) {

                        //Get the x points of selection and convert back to dates
                        var startDate = xTimelineScale.invert(d3.brushSelection(this)[0]);
                        var endDate = xTimelineScale.invert(d3.brushSelection(this)[1]);

                        var startMinuteOfTheDay = startDate.getHours()*60+startDate.getMinutes();
                        var endMinuteOfTheDay = endDate.getHours()*60+endDate.getMinutes();

                        //Get pickups between required dates
                        selectedPickupsByTime = mapOfPickupsByTime.filter(function(d) {

                                return d.key>startMinuteOfTheDay && d.key<=endMinuteOfTheDay;
                        });

                        selectedPickupsByTimeNew = uber_and_taxi_pickups_sample_13_05_2014.filter(function(d) {

                                return d.Datetime>startDate && d.Datetime<=endDate;
                        });

                        // Group murders by date
                        pickups =selectedPickupsByTime.reduce(function(newCollection, elem) {
                          return newCollection.concat(elem.pickups);
                        }, []);

                        // draw the murders on the map
                        //drawCirclesOnTheBoroughMap(pickups);
                        drawCirclesOnTheBoroughMap(selectedPickupsByTimeNew);
                        //redraw Boroughs' names
                        svgMap.selectAll("text.borough-label").remove();
                        drawBoroughNamesOnTheMap();

                      }
                }

/*
          // to manage brush on the map chart
          function highlightBrushedCircles() {

              circles = svgMap.selectAll("circle");

              if (d3.event.selection != null) {

                  // revert circles to initial style
                  circles.attr("class", "non_brushed");

                  brush_coords = d3.brushSelection(this);

                  // style brushed circles
                  circles.filter(function (){

                      var cx = d3.select(this).attr("cx");
                      var cy = d3.select(this).attr("cy");
                      return isBrushed(brush_coords, cx, cy);
                  })
                  .attr("class", "brushed");

              }
        }
*/
/*
        // to update bruched circles on the map after timline brush change
        function highlightCirclesInBrushExtend() {

            circles = svgMap.selectAll("circle");

            if (d3.event.selection != null) {

                // revert circles to initial style
                circles.attr("class", "non_brushed");

                // paint brushed circles
                circles.filter(function (){

                    var cx = d3.select(this).attr("cx");
                    var cy = d3.select(this).attr("cy");
                    if(brush_coords!=null){
                          return isBrushed(brush_coords, cx, cy);
                    } else {
                          return true;
                    }
                })
                .attr("class", "brushed");

                // change behavious of the hChart
                // it will not highlight all the data after timeline brush selection
                // if(brush_coords!=null){
                //   // paint brushed circles
                //   circles.filter(function (){
                //     var cx = d3.select(this).attr("cx");
                //     var cy = d3.select(this).attr("cy");
                //     return isBrushed(brush_coords, cx, cy);
                //   })
                //   .attr("class", "brushed");
                // }


                updateBarchart();
            }
        }
*/
        //Define brush for timeline chart
        var timelineBrush = d3.brushX()
                              .extent([[59, 0], [defaultTimelineWidth, defaultTimelineHeight+1]])
                              .on("brush", filterPickupsAccordiglyToRangeOfTime);
                              //.on("end", highlightCirclesInBrushExtend);

        svgTimeline.append("g")
                .call(timelineBrush);
/*
        //Define brush for borough map chart
        brush = d3.brush()
                .on("brush", highlightBrushedCircles);
                //.on("end", updateBarchart);

        svgMap.append("g")
              .call(brush);
*/      });
      });
/*
      function isBrushed(brush_coords, cx, cy) {

           var x0 = brush_coords[0][0],
               x1 = brush_coords[1][0],
               y0 = brush_coords[0][1],
               y1 = brush_coords[1][1];

          return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
      }

      function onBrushEnd() {

            if (!d3.event.selection) return;
            d3.select(this).call(brush.move, null);
            updateBarchart()
      }

      function updateBarchart() {

        var murdersByHours = [];
        var highlightedCircles = svgMap.selectAll(".brushed").data();

        //Initialize datasetCollection for svgBarchart
        for(hour of d3.range(0, 24)) {
            murdersByHours[hour] = 0;
        }

        // Count data for barchart
        for(datum of highlightedCircles) {
            if(Number(datum.Hour) in murdersByHours) {
                  murdersByHours[Number(datum.Hour)]++;
            }
        }

        // Updating scales and axises

        // Y
        yScale = d3.scaleLinear()
                  .domain([0,
                    d3.max(murdersByHours, function(d) {
                          return d;
                          })
                    ])
                  .range([defaultBarChartHeight, 0]);

        yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(countOptimalTicksNumber(d3.max(murdersByHours)));

        var yAxisComponent = svgBarchart.selectAll(".y.axis");

				if(yAxisComponent.empty()) {
                  svgBarchart.append("g")
                  .attr("class", "y axis")
                  .attr("transform", "translate(" + axisPadding + ",0)")
                  .call(yAxis);
        } else {
                  yAxisComponent.transition("yaxis")
                  .duration(1000)
                  .call(yAxis)
			  }

          //X not necessary as it is constant

          // bars

        var bars = svgBarchart.selectAll("rect");

          if(bars.empty()) {
            return;
          } else {//if(JSON.stringify(bars.data()) != JSON.stringify(dataset))
            bars = bars.data(murdersByHours)
           					   .transition("bars")
                       .duration(1000)
          }

          bars.attr("x", function(d, i) { return xScale(i); })
              .attr("y", function(d) { return yScale(d) ; })
              .attr("width", xScale.bandwidth())
              .attr("height", function(d) {
                  return defaultBarChartHeight- yScale(d);
              })
              .attr("fill", function(d) {
                return "rgb(0, "+ Math.round(barchartGreenColorScale(d)) +", " + Math.round(barchartBlueColorScale(d)) + ")";
              });

      }

      function countOptimalTicksNumber(max){
        if(max>16){
            return 16;
        } else {
            return max;
        }
      }
*/
    });
