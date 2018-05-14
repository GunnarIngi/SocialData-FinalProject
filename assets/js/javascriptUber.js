
//d3.select("#two").append("p").text("Demo");

//Width and height
var w = 700;
var h = 550;
var tempData;
var p = 30;
var m = 30;
var padding = 50;
var margin = 100;
var months = [];

d3.csv("data/fruits.csv", function(data) {

  dataset = data;
  tempData = dataset.filter(function(d){
    return d.index == 0;
  })
  months = tempData.map(d => d.month);

  var xScale = d3.scaleBand()
  .domain(months)
  .rangeRound([padding, w])
  .paddingInner(0.4);

  var yScale = d3.scaleLinear()
  .domain([0, d3.max(tempData, function(d) {return d.count;})])
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
  var svg = d3.select("#two")
  .append("svg")
  .attr("width", w)
  .attr("height", h);
  //
  //Create bars
  svg.selectAll("rect")
  .data(tempData)
  .enter()
  .append("rect")
  .attr("x", function(d, i) {
    return xScale(d.month);
  })
  .attr("y", function(d) {
    return yScale(d.count);

  })
  .attr("width", xScale.bandwidth())
  .attr("height", function(d) {
    return h -yScale(d.count) - padding ;
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
            .attr("transform", "translate("+ (padding/2) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Value");

  svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")  // centre below axis
            .text("Months");

  //On click, update with new data  -------------------------
  d3.selectAll("li")
  .on("click", function() {

    //See which p was clicked
    var paragraphID = d3.select(this).attr("id");

    //Decide what to do next
    if (paragraphID == "f_h") {
      tempData = dataset.filter(function(d){
        return d.index == 0;
      })
    }

    if (paragraphID == "f_s") {
      tempData = dataset.filter(function(d){
        return d.index == 1;
      })
    }

    if (paragraphID == "v_h") {
      tempData = dataset.filter(function(d){
        return d.index == 2;
      })
    }

    if (paragraphID == "v_s") {
      tempData = dataset.filter(function(d){
        return d.index == 3;
      });
    }

    //Update scale domains
    yScale.domain([0, d3.max(tempData, function(d) {return d.count;})])
    .range([h-padding, padding]);

    //var yAxis = d3.axisLeft()
    // yAxis.scale(yScale)
    // .ticks(5);

    //Update all rects
    svg.selectAll("rect")
    .data(tempData)
    .transition()
    .delay(function(d, i) {
      return i / dataset.length * 1000;
    })
    .duration(500)
    .attr("y", function(d) {
      return yScale(d.count);
    })
    .attr("height", function(d) {
      return h -yScale(d.count) - padding ;
    })
    .attr("fill", function(d)
        {if (d.index==0) {return "red"};
        if (d.index==1){return "blue"};
        if (d.index==2) {return "green"};
        if (d.index==3) {return "rgb(220,220,0)"};
    });

    //Update Y axis
    svg.select(".y.axis")
        .transition()
        .duration(1000)
      .call(yAxis);

  });

});
