
function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

//d3.select("#five").append("p").text("Demo");

//Width and height
var daysOfTheWeek = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday","Monday", "Tuesday","Wednesday", "Thursday", "Friday", "Saturday", "Sunday","Monday",
"Tuesday","Wednesday", "Thursday", "Friday", "Saturday", "Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday","Monday", "Tuesday",
"Wednesday", "Thursday", "Friday", "Saturday"];
var w = 800;
var h = 550;
var tempData;
var p = 30;
var m = 30;
var padding = 50;
var margin = 100;
var hours = range(0,23);
var dates = range(1,31);
var dateData = [];
var dateDataLen = [];
var dataset;
var hourData = [];

var myDiv = document.getElementById("select");

//Create array of options to be added

//Create and append select list
var selectList = document.createElement("select");
selectList.id = "myNewSelect";
myDiv.appendChild(selectList);

//Create and append the options
for (var i = 0; i < dates.length; i++) {
    var option1 = document.createElement("option1");
    option1.value = dates[i];
    option.text = 'May '+dates[i]+ ' ' +daysOfTheWeek[dates[i]] ;
    selectList.appendChild(option1);
}
document.getElementById("myNewSelect").style.display = 'none';

parseUberDate=d3.timeParse("%m/%d/%Y %H:%M");

pickupsRowConverter = function(d) {
  return {
    Datetime: parseUberDate(d.datetime),
    PickupsCount: parseInt(d.pickups_count)
  };
}

d3.csv("data/taxi_may_pickups_count.csv",pickupsRowConverter, function(data) {

  dataset = data;
  mapOfPickupsByDay =
  dates.map(date=>{
    tempData = dataset.filter(function(d){
     dateDataLen.push(d.PickupsCount)
     return d.Datetime.day == date
    })
    dateData.push(tempData);

  })

 //  months = tempData.map(d => d.month);

  var xScale = d3.scaleBand()
  .domain(dates)
  .rangeRound([padding, w])
  .paddingInner(0.4);

  var yScale = d3.scaleLinear()
  .domain([0, Math.max(...dateDataLen)])
  .range([h-padding, padding]);

  //Define X axis
  var xAxis = d3.axisBottom()
  .scale(xScale);


  //Define Y axis
  var yAxis = d3.axisLeft()
  .scale(yScale)
  .ticks(10);

  //
  //Create SVG element
  var svg = d3.select("#five")
  .append("svg")
  .attr("width", w)
  .attr("height", h);
  //
  //Create bars
  svg.selectAll("rect")
  .data(dateDataLen)
  .enter()
  .append("rect")
  .attr("x", function(d, i) {
    return xScale(i+1);
  })
  .attr("y", function(d) {
    return yScale(d);

  })
  .attr("width", xScale.bandwidth())
  .attr("height", function(d) {
    return h -yScale(d) - padding ;
  })
  .attr("fill", "red");
 //Create X axis
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (h - padding) + ")")
  .call(xAxis);

  //Create Y axis
  svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + padding + ",0)")
  .call(yAxis);

  svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (padding/4) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Value");

  svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")  // centre below axis
            .text("Dates");

  //On click, update with new data  -------------------------
  d3.selectAll("li")
  .on("click", function() {

    document.getElementById("myNewSelect").style.display = 'none';

    //See which p was clicked
    var paragraphID = d3.select(this).attr("id");

    //Decide what to do next
    if (paragraphID == "f_yth") {

      xScale = d3.scaleBand()
      .domain(dates)
      .rangeRound([padding, w])
      .paddingInner(0.4);

      yScale = d3.scaleLinear()
      .domain([0, Math.max(...dateDataLen)])
      .range([h-padding, padding]);

      //Define X axis
      xAxis = d3.axisBottom()
      .scale(xScale);


      //Define Y axis
      yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(10);

      //Create bars
      svg.selectAll("rect").remove()

      svg.selectAll("rect")
      .data(dateDataLen)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xScale(i+1);
      })
      .attr("y", function(d) {
        return yScale(d);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) {
        return h -yScale(d) - padding ;
      })
      .attr("fill", "red");
     //Create X axis
      svg.selectAll("g.x.axis")
      .call(xAxis);

      //Create Y axis
      svg.selectAll("g.y.axis")
      .call(yAxis);

    }

    if (paragraphID == "f_yts") {

      document.getElementById("myNewSelect").style.display = 'block';

      hourData = [];
      hours.map(hour=>{
        tempData = dateData[0].filter(function(d){
         return d['datetime'].split(' ')[1].split(':')[0] == hour
        })
        hourData.push(tempData.length);
      })
     //  months = tempData.map(d => d.month);

      xScale = d3.scaleBand()
        .domain(hours)
        .rangeRound([padding, w])
        .paddingInner(0.4);

      yScale = d3.scaleLinear()
        .domain([0, Math.max(...hourData)])
        .range([h-padding, padding]);

        //Define X axis
      xAxis = d3.axisBottom()
        .scale(xScale);


        //Define Y axis
      yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

        //Create bars
      svg.selectAll("rect").remove()
      svg.selectAll("rect")
        .data(hourData)
        .enter()
        .append('rect')
        .attr("x", function(d, i) {
          return xScale(i);
        })
        .attr("y", function(d) {
          return yScale(d);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
          return h -yScale(d) - padding ;
        })
        .attr("fill", "blue");
       //Create X axis
      svg.selectAll("g.x.axis")
        .call(xAxis);

        //Create Y axis
      svg.selectAll("g.y.axis")
         .call(yAxis);
      }

  });
  d3.select("#myNewSelect")
  .on("change", function() {
     var id = d3.select("#myNewSelect").node().value;
     hourData = [];
      hours.map(hour=>{
        tempData = dateData[id].filter(function(d){
         return d['datetime'].split(' ')[1].split(':')[0] == hour
        })
        hourData.push(tempData.length);
      })
     //  months = tempData.map(d => d.month);

      yScale = d3.scaleLinear()
        .domain([0, Math.max(...hourData)])
        .range([h-padding, padding]);

        //Define Y axis
      yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

        //Create bars
      svg.selectAll("rect")
        .data(hourData)
        .transition()
        .delay(function(d, i) {
          return i / dataset.length * 1000;
        })
        .duration(500)
        .attr("x", function(d, i) {
          return xScale(i);
        })
        .attr("y", function(d) {
          return yScale(d);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
          return h -yScale(d) - padding ;
        })
        .attr("fill", "blue");
       //Create X axis
      svg.selectAll("g.x.axis")
        .call(xAxis);

        //Create Y axis
      svg.selectAll("g.y.axis")
         .call(yAxis);


  });

});
