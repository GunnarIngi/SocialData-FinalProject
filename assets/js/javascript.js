
function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

//d3.select("#three").append("p").text("Demo");

//Width and height
var w = 700;
var h = 550;
var tempData;
var p = 30;
var m = 30;
var padding = 100;
var margin = 100;
var hours = range(0,23);
var dates = range(1,31);
var dateData = [];
var dateDataLen = [];

var hourData = [];

var myDiv = document.getElementById("select");

//Create array of options to be added

//Create and append select list
var selectList = document.createElement("select");
selectList.id = "mySelect";
myDiv.appendChild(selectList);

//Create and append the options
for (var i = 0; i < dates.length; i++) {
    var option = document.createElement("option");
    option.value = dates[i];
    option.text = 'May '+dates[i];
    selectList.appendChild(option);
}
document.getElementById("mySelect").style.display = 'none';

d3.csv("data/may.csv", function(data) {

  dataset = data;
  dates.map(date=>{
    tempData = dataset.filter(function(d){
     return d['Date/Time'].split('/')[1] == date
    })
    dateData.push(tempData);
    dateDataLen.push(tempData.length)
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
  var svg = d3.select("#four")
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
            .attr("transform", "translate("+ (padding/10) +","+(h/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Number of pickups");

  svg.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (w/2) +","+(h-(padding/3))+")")  // centre below axis
            .text("Dates");

  //On click, update with new data  -------------------------
  d3.selectAll("li")
  .on("click", function() {
    
    document.getElementById("mySelect").style.display = 'none';

    //See which p was clicked
    var paragraphID = d3.select(this).attr("id");

    //Decide what to do next
    if (paragraphID == "f_h") {

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

    if (paragraphID == "f_s") {

      document.getElementById("mySelect").style.display = 'block';

      hourData = [];
      hours.map(hour=>{
        tempData = dateData[0].filter(function(d){
         return d['Date/Time'].split(' ')[1].split(':')[0] == hour
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
  d3.select("#mySelect")
  .on("change", function() {
     var id = d3.select("#mySelect").node().value; 
     hourData = [];
      hours.map(hour=>{
        tempData = dateData[id].filter(function(d){
         return d['Date/Time'].split(' ')[1].split(':')[0] == hour
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
