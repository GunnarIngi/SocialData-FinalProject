
function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}


//Width and height
var w = 540;
var h = 360;
var tempData;
var p = 30;
var m = 30;
var padding = 50;
var margin = 100;
var hours = range(0,23);
var dates = range(1,31);
var taxiPickupCountPerDay = [];
var uberPickupCountPerDay = [];
var dataset;
var hourData = [];

var myDiv = document.getElementById("select");

//Create and append select list
var selectList = document.createElement("select");
selectList.id = "myNewSelect";
myDiv.appendChild(selectList);

//Create and append the options
for (var i = 0; i < dates.length; i++) {
    var option = document.createElement("option");
    option.value = dates[i];
    option.text = 'May '+dates[i];        //todo thrusday, Wednesday and so on
    selectList.appendChild(option);
}
document.getElementById("myNewSelect").style.display = 'none';

parseUberDate=d3.timeParse("%m/%d/%Y %H:%M");

pickupsRowConverter = function(d) {
  return {
    Datetime: parseUberDate(d.datetime),
    TaxiPickupCounts: parseInt(d.taxi_pickups_count),
    UberPickupCounts: parseInt(d.uber_pickups_count)
  };
}

// create uber svg

var svgUber = d3.select("#five")
.append("svg")
.attr("width", w)
.attr("height", h);

// create taxi svg
var svgTaxi = d3.select("#fives")
.append("svg")
.attr("width", w)
.attr("height", h);


d3.csv("data/taxi&uber_may_pickup_counts_by_hour.csv",pickupsRowConverter, function(data) {

    // load may data for taxi and uber
    dataset = data;
    taxiPickupCountPerDay = [];
    uberPickupCountPerDay = [];
    dates.forEach(function(day) {
        taxiSum = 0;
        uberSum = 0;
        AllHoursOfTheDay = dataset.filter(function(d){
                  return d.Datetime.getDate() == day;
        });
        AllHoursOfTheDay.forEach(function(d){
                taxiSum = taxiSum + d.TaxiPickupCounts;
                uberSum = uberSum + d.UberPickupCounts;
        });
        taxiPickupCountPerDay.push(taxiSum);
        uberPickupCountPerDay.push(uberSum);
    });
// uber scales and axes
    var xUberScale = d3.scaleBand()
    .domain(dates)
    .rangeRound([padding, w])
    .paddingInner(0.4);

    var yUberScale = d3.scaleLinear()
    .domain([0, Math.max(...uberPickupCountPerDay)])
    .range([h-padding, padding]);

    //Define X axis
    var xUberAxis = d3.axisBottom()
    .scale(xUberScale);

    //Define Y axis
    var yUberAxis = d3.axisLeft()
    .scale(yUberScale)
    .ticks(10);

// taxi scales and axes
  var xTaxiScale = d3.scaleBand()
  .domain(dates)
  .rangeRound([padding, w])
  .paddingInner(0.4);

  var yTaxiScale = d3.scaleLinear()
  .domain([0, Math.max(...taxiPickupCountPerDay)])
  .range([h-padding, padding]);

  //Define X axis
  var xTaxiAxis = d3.axisBottom()
  .scale(xTaxiScale);

  //Define Y axis
  var yTaxiAxis = d3.axisLeft()
  .scale(yTaxiScale)
  .ticks(10);

  //Create uber  bars

  svgUber.selectAll("rect")
  .data(uberPickupCountPerDay)
  .enter()
  .append("rect")
  .attr("x", function(d, i) {
    return xUberScale(i+1);
  })
  .attr("y", function(d) {
    return yUberScale(d);

  })
  .attr("width", xUberScale.bandwidth())
  .attr("height", function(d) {
    return h -yUberScale(d) - padding ;
  })
  .attr("fill", "#1f77b4 ");

  //Create taxi  bars
  svgTaxi.selectAll("rect")
  .data(taxiPickupCountPerDay)
  .enter()
  .append("rect")
  .attr("x", function(d, i) {
    return xTaxiScale(i+1);
  })
  .attr("y", function(d) {
    return yTaxiScale(d);

  })
  .attr("width", xTaxiScale.bandwidth())
  .attr("height", function(d) {
    return h -yTaxiScale(d) - padding ;
  })
  .attr("fill", "#FF7F0E");

  //Append axises to svgUber
   svgUber.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (h - padding) + ")")
          .call(xUberAxis);

   svgUber.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ",0)")
          .call(yUberAxis);

   svgUber.append("text")
             .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
             .attr("transform", "translate("+ (padding/4) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
             .text("Number of Uber pickups");

   svgUber.append("text")
             .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
             .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")  // centre below axis
             .text("Time interval");

 //Append axises to svgTaxi
  svgTaxi.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (h - padding) + ")")
          .call(xTaxiAxis);

  svgTaxi.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ",0)")
          .call(yTaxiAxis);

  svgTaxi.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (padding/16) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Number of Yellow Taxi pickups");

  svgTaxi.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")  // centre below axis
            .text("Time interval");

  //On click, update with new data  -------------------------
  d3.selectAll("li")
  .on("click", function() {

    document.getElementById("myNewSelect").style.display = 'none';
    //See which p was clicked
    var paragraphID = d3.select(this).attr("id");

    //Decide what to do next
    if (paragraphID == "f_yth") {


      //Uber

      xUberScale = d3.scaleBand()
      .domain(dates)
      .rangeRound([padding, w])
      .paddingInner(0.4);

      yUberScale = d3.scaleLinear()
      .domain([0, Math.max(...uberPickupCountPerDay)])
      .range([h-padding, padding]);

      //Define TaxiX axis
      xUberAxis = d3.axisBottom()
      .scale(xUberScale);

      //Define Y axis
      yUberAxis = d3.axisLeft()
      .scale(yUberScale)
      .ticks(10);

      //Taxi

      xTaxiScale = d3.scaleBand()
      .domain(dates)
      .rangeRound([padding, w])
      .paddingInner(0.4);

      yTaxiScale = d3.scaleLinear()
      .domain([0, Math.max(...taxiPickupCountPerDay)])
      .range([h-padding, padding]);

      //Define TaxiX axis
      xTaxiAxis = d3.axisBottom()
      .scale(xTaxiScale);

      //Define Y axis
      yTaxiAxis = d3.axisLeft()
      .scale(yTaxiScale)
      .ticks(10);

      //Create bars Uber
      svgUber.selectAll("rect").remove()

      svgUber.selectAll("rect")
      .data(uberPickupCountPerDay)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xUberScale(i+1);
      })
      .attr("y", function(d) {
        return yUberScale(d);
      })
      .attr("width", xUberScale.bandwidth())
      .attr("height", function(d) {
        return h -yUberScale(d) - padding ;
      })
      .attr("fill", "#1f77b4 ");
      //Create X axis
      svgUber.selectAll("g.x.axis")
      .call(xUberAxis);

      //Create Y axis
      svgUber.selectAll("g.y.axis")
      .call(yUberAxis);

      //Create bars Taxi
      svgTaxi.selectAll("rect").remove()

      svgTaxi.selectAll("rect")
      .data(taxiPickupCountPerDay)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xTaxiScale(i+1);
      })
      .attr("y", function(d) {
        return yTaxiScale(d);
      })
      .attr("width", xTaxiScale.bandwidth())
      .attr("height", function(d) {
        return h -yTaxiScale(d) - padding ;
      })
      .attr("fill", "r#FF7F0E");
     //Create X axis
      svgTaxi.selectAll("g.x.axis")
      .call(xTaxiAxis);

      //Create Y axis
      svgTaxi.selectAll("g.y.axis")
      .call(yTaxiAxis);

    }

    if (paragraphID == "f_yts") {

      document.getElementById("myNewSelect").style.display = 'block';

      currentDayByHours =  dataset.filter(function(d){
       return d.Datetime.getDate() == 1;
      });

      //Uber update
      xUberScale = d3.scaleBand()
        .domain(hours)
        .rangeRound([padding, w])
        .paddingInner(0.4);

      yUberScale = d3.scaleLinear()
        .domain([0, d3.max(currentDayByHours, function(d) { return d.UberPickupCounts;})])
        .range([h-padding, padding]);

        //Define X axis
      xUberAxis = d3.axisBottom()
        .scale(xUberScale);


        //Define Y axis
      yUberAxis = d3.axisLeft()
        .scale(yUberScale)
        .ticks(10);

        //Create bars
      svgUber.selectAll("rect").remove()
      svgUber.selectAll("rect")
        .data(currentDayByHours)
        .enter()
        .append('rect')
        .attr("x", function(d, i) {
          return xUberScale(i);
        })
        .attr("y", function(d) {
          return yUberScale(d.UberPickupCounts);
        })
        .attr("width", xUberScale.bandwidth())
        .attr("height", function(d) {
          return h -yUberScale(d.UberPickupCounts) - padding ;
        })
        .attr("fill", "#1f77b4 ");
       //Create X axis
      svgUber.selectAll("g.x.axis")
        .call(xUberAxis);

        //Create Y axis
      svgUber.selectAll("g.y.axis")
         .call(yUberAxis);

      // Uber end

      //Taxi update
      xTaxiScale = d3.scaleBand()
        .domain(hours)
        .rangeRound([padding, w])
        .paddingInner(0.4);

      yTaxiScale = d3.scaleLinear()
        .domain([0, d3.max(currentDayByHours, function(d) { return d.TaxiPickupCounts;})])
        .range([h-padding, padding]);

        //Define X axis
      xTaxiAxis = d3.axisBottom()
        .scale(xTaxiScale);


        //Define Y axis
      yTaxiAxis = d3.axisLeft()
        .scale(yTaxiScale)
        .ticks(10);

        //Create bars
      svgTaxi.selectAll("rect").remove()
      svgTaxi.selectAll("rect")
        .data(currentDayByHours)
        .enter()
        .append('rect')
        .attr("x", function(d, i) {
          return xTaxiScale(i);
        })
        .attr("y", function(d) {
          return yTaxiScale(d.TaxiPickupCounts);
        })
        .attr("width", xTaxiScale.bandwidth())
        .attr("height", function(d) {
          return h -yTaxiScale(d.TaxiPickupCounts) - padding ;
        })
        .attr("fill", "#FF7F0E");
       //Create X axis
      svgTaxi.selectAll("g.x.axis")
        .call(xTaxiAxis);

        //Create Y axis
      svgTaxi.selectAll("g.y.axis")
         .call(yTaxiAxis);
          // Taxi end
      }

  });

  d3.select("#myNewSelect")
  .on("change", function() {
     var id = d3.select("#myNewSelect").node().value;

    currentDayByHours =  dataset.filter(function(d){
     return d.Datetime.getDate() == id;
    });

    //Uber part

    yUberScale = d3.scaleLinear()
      .domain([0, d3.max(currentDayByHours, function(d) { return d.UberPickupCounts;})])
      .range([h-padding, padding]);

      //Define Y axis
    yUberAxis = d3.axisLeft()
      .scale(yUberScale)
      .ticks(10);

      //Create bars
    svgUber.selectAll("rect")
      .data(currentDayByHours)
      .transition()
      .delay(function(d, i) {
        return i / currentDayByHours.length * 1000;
      })
      .duration(500)
      .attr("x", function(d, i) {
        return xUberScale(i);
      })
      .attr("y", function(d) {
        return yUberScale(d.UberPickupCounts);
      })
      .attr("width", xUberScale.bandwidth())
      .attr("height", function(d) {
        return h -yUberScale(d.UberPickupCounts) - padding ;
      })
      .attr("fill", "#1f77b4");
     //Create X axis
    svgUber.selectAll("g.x.axis")
      .call(xUberAxis);

      //Create Y axis
    svgUber.selectAll("g.y.axis")
       .call(yUberAxis);


      //Taxi part

      yTaxiScale = d3.scaleLinear()
        .domain([0, d3.max(currentDayByHours, function(d) { return d.TaxiPickupCounts;})])
        .range([h-padding, padding]);

        //Define Y axis
      yTaxiAxis = d3.axisLeft()
        .scale(yTaxiScale)
        .ticks(10);

        //Create bars
      svgTaxi.selectAll("rect")
        .data(currentDayByHours)
        .transition()
        .delay(function(d, i) {
          return i / currentDayByHours.length * 1000;
        })
        .duration(500)
        .attr("x", function(d, i) {
          return xTaxiScale(i);
        })
        .attr("y", function(d) {
          return yTaxiScale(d.TaxiPickupCounts);
        })
        .attr("width", xTaxiScale.bandwidth())
        .attr("height", function(d) {
          return h -yTaxiScale(d.TaxiPickupCounts) - padding ;
        })
        .attr("fill", "#FF7F0E");
       //Create X axis
      svgTaxi.selectAll("g.x.axis")
        .call(xTaxiAxis);

        //Create Y axis
      svgTaxi.selectAll("g.y.axis")
         .call(yTaxiAxis);


  });

});
