function drawRadialChart(svgClass, data) {
  let svg = d3.select(svgClass);
  let tooltip = addTooltipToVis(svgClass);

  let svgWidth = 700;
  let svgHeight = 700;
  let arcMin = 50;
  let arcWidth = 4;
  let centerWidth = svgWidth*0.5;
  let centerHeight = svgHeight*0.5;

  let ringCounter = 0;
  let currentDate = 0;
  let dateToRingArr = [31, 28, 31, 30, 31, 30, 31, 25];
  let totalDays = dateToRingArr[data[0].Month-1];
  console.log(totalDays)
  // let totalDays = 31 + 28 + 31 + 10;

  let textColor = "#696969";
  let blueArcColor = "#7389AE";
  let allNighterColor = "#F4B266";
  let backgroundColor = "#e8e8e8";
  let darkGreyColor = "#282828";

  var arc = d3.arc()
    .startAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[0])/24 * 360 * PI / 180);
    })
    .endAngle(function(d) {
      var str = d["Hours"].split("-");
      return (convertTimeStrToFrac(str[1])/24 * 360 * PI / 180);
    })
    .innerRadius(function(d) {
      if (d["Date"] != currentDate) {
        ringCounter = ringCounter + 1;
        currentDate = d["Date"];
      }
      return arcMin + ringCounter*arcWidth;
    })
    .outerRadius(function(d) {
      return arcMin + (ringCounter+1)*arcWidth;
    });

  let allNighterArc = d3.arc()
    .startAngle(0)
    .endAngle((360 * PI / 180))
    .innerRadius(function(d) {
      var counter = (dateToRingArr.slice(0, Number(d["Month"])-1)).reduce((a, b) => a + b, 0) + Number(d["Day"]);
      return arcMin + counter*arcWidth;
    })
    .outerRadius(function(d) {
      var counter = (dateToRingArr.slice(0, Number(d["Month"])-1)).reduce((a, b) => a + b, 0) + Number(d["Day"]);
      return arcMin + (counter+1)*arcWidth;
    });

  // draw background pie
  svg.append('path')
    .attr('d', d3.arc()
      .innerRadius(arcMin)
      .outerRadius(arcMin + (totalDays)*arcWidth)
      .startAngle(0)
      .endAngle(360 * PI / 180)
    )
    .attr('fill', backgroundColor)
    .attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")")
    .style('opacity', 0.75);

  // draw sleep arcs
  svg.selectAll('.allSleepArcs')
    .data(data)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")") 
    .attr('fill', blueArcColor)
    .on("mouseover", function(d) {
      let tooltipText = "<b>DAY: </b>" + d["Month"] + "/" + d["Date"] +
        "<br/><b> HOURS SLEPT: </b>" + d["Hours"];
      updateToolTipText(tooltip, tooltipText, 70, 150);
    })
    .on("mouseout", function() {
      hideTooltip(tooltip);
    });

  // draw x-axis
  var axisScale = d3.scaleLinear()
    .domain([0, 24])
    .range([0, 2*Math.PI]);

  // svg.append("text")
  //   .attr("x", centerWidth)
  //   .attr("y", 85)
  //   .text("24 hr time →")
  //   .style("font-family", "Rubik")
  //   .style("font-size", "12");

  svg.append('g')
    .call(d3.axisRadialOuter(
      axisScale, 
      arcMin + (ringCounter+5)*arcWidth)
    .tickFormat(function(d) {
      if (d == "24") return "";
      return d + ":00";
    })
    ).attr('transform', "translate(" + centerWidth + ", " + centerHeight + ")") 
    .style("opacity", 0.6)
    .selectAll("text")
      .style("font-family", "Rubik")
      .style("font-size", "12")
      .attr("text-anchor", function(d) {
        if (axisScale(d) < Math.PI) return "start";
        else return "end";
      });
}