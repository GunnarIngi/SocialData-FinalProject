
    //Timeline chart variables
    var comparisonTimeline;
    var comparisonTimelineMargin = {top: 0, right: 20, bottom: 40, left: 60}; //Mike Bostock’s margin convention
    var defaultCompTimelineWidth = 800 - comparisonTimelineMargin.right - comparisonTimelineMargin.left;
    var defaultCompTimelineHeight = 320 - comparisonTimelineMargin.top - comparisonTimelineMargin.bottom;
    var uberMonthCountCurve;
    var taxiMonthCountCurve;
    var stat_uber_and_taxi_pickups;
    var mappedPickupsByMonth;
    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    var tooltip = d3.select("#vis-container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var no_of_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30];

    //Create SVG element for timeline
    comparisonTimeline = d3.select("#nine")
                    .append("svg")
                    .attr("width", defaultCompTimelineWidth + comparisonTimelineMargin.right + comparisonTimelineMargin.left)
                    .attr("height", defaultCompTimelineHeight + comparisonTimelineMargin.top + comparisonTimelineMargin.bottom);

    parseUberDate=d3.timeParse("%m/%d/%Y %H:%M");

            statRowConverter = function(d) {
              return {
                Datetime: parseUberDate(d.datetime),
                UberPickupsPerMonth: parseInt(d.UberPickupsPerMonth),
                TaxiPickupsPerMonth: parseInt(d.TaxiPickupsPerMonth)
              };
            }


            d3.csv("data/uber_vs_taxi_over_long_time.csv", statRowConverter, function(uberDatasetError, data) {

                        if (uberDatasetError) {                              //If error is not null, something went wrong.
                            console.log(uberDatasetError);                   //Log the error.
                        } else {                                               //If no error, the file loaded correctly. Yay!
                                                                                //Log the data.
                            stat_uber_and_taxi_pickups = data;
                        }

                        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
                                          width  = 960 - margin.left - margin.right,
                                          height = 500 - margin.top - margin.bottom;

                                      // Add the visualization svg canvas to the vis-container <div>
                                      var canvas = d3.select("#vis-container").append("svg")
                                          .attr("width",  width  + margin.left + margin.right)
                                          .attr("height", height + margin.top  + margin.bottom)
                                        .append("g")
                                          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                  //Pre-procession stage:

                  stat_uber_and_taxi_pickups.sort(function (a, b) {
                    if (Date.parse(a.Datetime)< Date.parse(b.Datetime))
                      return -1;
                      if (Date.parse(a.Datetime)> Date.parse(b.Datetime))
                        return 1;
                    return 0
                  });

                  mappedPickupsByMonth  = stat_uber_and_taxi_pickups.columns.slice(1).map(function(id) {
                    return {
                      id: id,
                      values: stat_uber_and_taxi_pickups.map(function(d) {
                        return {datetime: d.Datetime, monthlyPickupCounts: d[id]};
                      })
                    };
                  });


                  // For building line purposes
                  uberMonthCountCurve = [];
                  taxiMonthCountCurve = [];

                  stat_uber_and_taxi_pickups.forEach(function(d) {
                      uberMonthCountCurve.push([d.Datetime, d.UberPickupsPerMonth]);
                      taxiMonthCountCurve.push([d.Datetime, d.TaxiPickupsPerMonth]);
                  });

                  //Create scales
                  xCompTimelineScale = d3.scaleTime()
                           .domain(d3.extent(taxiMonthCountCurve, function(d) { return d[0]; })).nice()
                           .range([comparisonTimelineMargin.left, defaultCompTimelineWidth]);

              /*    yCompTimelineScaleOld = d3.scaleLinear()
                             .domain([
                                      d3.min(uberMonthCountCurve, function(d) { return d[1];}),
                                      d3.max(uberMonthCountCurve, function(d) { return d[1];})
                                       ])
                              .range([defaultCompTimelineHeight, 5]);*/

                  yCompTimelineScale = d3.scaleLinear()
                    .domain([
                        d3.min(mappedPickupsByMonth, function(d) { return d3.min(d.values, function(d) { return d.monthlyPickupCounts; }); }),
                        d3.max(mappedPickupsByMonth, function(d) { return d3.max(d.values, function(d) { return d.monthlyPickupCounts; }); })
                    ])
                    .range([defaultCompTimelineHeight, 5]);

                  zCompTimelineScale = d3.scaleOrdinal(d3.schemeCategory10);
                  zCompTimelineScale.domain(mappedPickupsByMonth.map(function(c) { return c.id; }));
                  //Define axes
                  xCompTimelineAxis = d3.axisBottom()
                        .scale(xCompTimelineScale)
                        .ticks(20);

                  yTimelineAxis = d3.axisLeft()
                        .scale(yCompTimelineScale)
                        .ticks(5);
                      //  Date(2011, 0, 1, 2, 3, 4, 567);
                      //  alert( date ); // 1.01.2011, 02:03:04.567

                  //Define line generator
                  multiLine = d3.line()
                            .curve(d3.curveCardinal)
                            .x(function(d) { return xCompTimelineScale(d.datetime); })
                            .y(function(d) { return yCompTimelineScale(d.monthlyPickupCounts); });

                comparisonTimeline.selectAll(".stat")
                  .data(mappedPickupsByMonth)
                  .enter().append("g")
                  .attr("class", "stat");

                comparisonTimeline.selectAll(".stat").append("g").append("path")
                        .attr("class", "line")
                        .attr("d", function(d) {
                        return multiLine(d.values); })
                        .style("stroke", function(d) { return zCompTimelineScale(d.id); })
                        .style("stroke-width", '2px');

                        // tooltip mouseover event handler
                                      var tipMouseover = function(d) {
                                          var html = months[d.datetime.getMonth()] + ' ' + d.datetime.getFullYear() +  "<br/>" +
                              "<span style='color:black;'>Total number of pick-ups: </span>" +
                              "<b>" + d.monthlyPickupCounts + "<br/></b> Average per day: <b/>" + parseInt(d.monthlyPickupCounts/no_of_days_in_month[d.datetime.getMonth()]) + "</b>";

      //"<span style='color:;'>" + d.monthlyPickupCounts + "</span><br/>";no_of_days_in_month
                                        d3.select("#vis-container")
                                          .style("display", "inline");

                                          //alert("wrks")
                                          tooltip.html(html)
                                              .style("left", (d3.event.pageX + 15) + "px")
                                              .style("top", (d3.event.pageY - 28) + "px")
                                            .transition()
                                              .duration(200) // ms
                                              .style("opacity", .9) // started as 0!

                                      };
                                      // tooltip mouseout event handler
                                      var tipMouseout = function(d) {
                                          tooltip.transition()
                                              .duration(300) // ms
                                              .style("opacity", 0); // don't care about position!
                                              d3.select("#vis-container")
                                                .style("display", "none");
                                      };

                        // Add the scatterplot
                comparisonTimeline.selectAll(".uberDot")
                                    .data(mappedPickupsByMonth[0].values)
                                    .enter().append("g")
                                    .attr("class", "uberDot");

                comparisonTimeline.selectAll(".taxiDot")
                            .data(mappedPickupsByMonth[1].values)
                            .enter().append("g")
                            .attr("class", "taxiDot");

                comparisonTimeline.selectAll(".taxiDot")
                            .append("circle")
                            .attr("r", 3.5)
                            .attr("cx", function(d) { return xCompTimelineScale(d.datetime); })
                            .attr("cy", function(d) { return yCompTimelineScale(d.monthlyPickupCounts); })
                            .on("mouseover", tipMouseover)
                            .on("mouseout", tipMouseout);

                comparisonTimeline.selectAll(".uberDot")
                              .append("circle")
                              .attr("r", 3.5)
                              .attr("cx", function(d) { return xCompTimelineScale(d.datetime); })
                              .attr("cy", function(d) { return yCompTimelineScale(d.monthlyPickupCounts); })
                              .on("mouseover", tipMouseover)
                              .on("mouseout", tipMouseout);




                  //Create axes
                  comparisonTimeline.append("g")
                         .attr("class", "x axis")
                         .attr("transform", "translate(0," + defaultCompTimelineHeight + ")")
                         .call(xCompTimelineAxis);

                  comparisonTimeline.append("g")
                             .attr("class", "y axis")
                             .attr("transform", "translate("+ comparisonTimelineMargin.left +",0)")
                             .call(yTimelineAxis);

                  comparisonTimeline.append("text")
                             .attr("class", "y label")
                             .attr("text-anchor", "end")
                             .attr("y", 0)
                             .attr("x", 0)
                             .attr("dy", ".75em")
                             .attr("transform", "rotate(-90) translate(-45, -15)")
                             .text("Number of pick-ups per month");

                  comparisonTimeline.append("text")
                             .attr("class", "x label")
                             .attr("text-anchor", "end")
                             .attr("x", defaultCompTimelineWidth / 2 + 140)
                             .attr("y", defaultCompTimelineHeight +37)
                             .text("Monthly Uber and Taxi pick-ups over time");
              });
