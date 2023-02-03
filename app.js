//-----------------Data request----------------

let req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
req.send();
req.onload = () => {
  let dataset = JSON.parse(req.responseText);

  //-----------------Creating main svg element ------------------

  width = 1500;
  height = 600;
  padding = 120;
  cellHeight = (height - padding * 2) / 12;
  const uniqueYears = Array.from(new Set(dataset.monthlyVariance.map((x) => x.year)));
  cellWidth = (width - padding * 2) / uniqueYears.length;
  let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].reverse();

  const svg = d3.select("body").append("div").attr("id", "svg-container").append("svg").attr("width", width).attr("height", height);

  //-----------------Header---------------------

  svg
    .append("text")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature")
    .attr("x", width / 2)
    .attr("y", 50)
    .style("text-anchor", "middle");

  svg
    .append("text")
    .attr("id", "description")
    .text("1753 - 2015: base temperature 8.66℃")
    .attr("x", width / 2)
    .attr("y", 85)
    .style("text-anchor", "middle");

  //----------------Scaling-----------------

  const xScale = d3
    .scaleLinear()
    .domain([parseInt(dataset.monthlyVariance[0].year), parseInt(dataset.monthlyVariance[dataset.monthlyVariance.length - 1].year)])
    .range([padding, width - padding]);

  const yScale = d3.scaleBand();
  yScale.domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).range([height - padding, padding]);

  let minTemp = dataset.baseTemperature + d3.min(dataset.monthlyVariance, (d) => d.variance);
  let maxTemp = dataset.baseTemperature + d3.max(dataset.monthlyVariance, (d) => d.variance);
  const colorScale = d3.scaleLinear().domain([minTemp, maxTemp]).range([1, 0]);

  // ------------------Bar Chart-----------------

  let tooltip = d3.select("body").append("div").attr("id", "tooltip");

  svg
    .selectAll("rect")
    .data(dataset.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-month", (d) => d.month - 1)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => dataset.baseTemperature + d.variance)
    .on("mouseover", (e, d) => {
      const tooltipText = month.reverse()[d.month - 1] + " " + d.year + ":\nt°   " + Math.round((dataset.baseTemperature + d.variance) * 10) / 10 + "℃\nΔ   " + Math.round(d.variance * 10) / 10 + "℃";
      tooltip
        .text(tooltipText)
        .style("opacity", "100%")
        .style("left", e.clientX + 9 + "px")
        .style("top", e.clientY - 15 + "px")
        .attr("data-year", d.year);
    })
    .on("mouseout", (event, d) => {
      tooltip
        .style("opacity", "0%")
        .style("left", -2000 + "px")
        .style("top", -2000 + "px");
    })
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("x", (d) => xScale(parseInt(d.year)))
    .attr("y", (d) => height - cellHeight - yScale(d.month))
    .style("fill", (d) => d3.interpolateRdYlBu(colorScale(dataset.baseTemperature + d.variance)));

  // ----------------------axis--------------------

  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((d) => parseInt(d))
    .ticks(20);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis);

  svg
    .append("text")
    .text("Years")
    .attr("y", height - padding + 40)
    .attr("x", width / 2)
    .style("text-anchor", "middle")
    .style("font-weight", 800);

  const yAxis = d3.axisLeft(yScale).tickFormat((d) => month[d - 1]);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis)
    .selectAll(".tick text")
    .style("text-anchor", "end")
    .attr("y", 0);

  svg
    .append("text")
    .text("Months")
    .attr("y", 55)
    .attr("x", 0 - height / 2)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .style("font-weight", 800);

  //-----------Legend--------------

  const legend = svg.append("g").attr("id", "legend");

  //   legend
  //     .append("text")
  //     .text("Legend")
  //     .attr("x", padding)
  //     .attr("y", height - padding / 2)
  //     .style("text-anchor", "start");

  //   legend
  //     .append("rect")
  //     .style("fill", "red")
  //     .attr("width", "20px")
  //     .attr("height", "20px")
  //     .attr("x", padding)
  //     .attr("y", height - padding / 2);

  //------------Footer--------------

  d3.select("body").append("footer").text("This Bar Chart was created using: HTML, CSS, JavaScript and D3 svg-based visualization library");
};
