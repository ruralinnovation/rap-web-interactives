"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var d3 = _interopRequireWildcard(require("d3"));
require("./css/cori_styles.css");
require("./style.css");
var data = _interopRequireWildcard(require("./data/rural_cty_tech_employment.csv"));
var median_data = _interopRequireWildcard(require("./data/rural_median_cty_tech_employment.csv"));
var addAnnotation = _interopRequireWildcard(require("@camdenblatchly/easy-d3-annotate"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
window.d3 = d3;
var width = 500;
var height = 180;
var margin = {
  top: 32.5,
  right: 30,
  bottom: 30,
  left: 170
};

// let y = d3.scaleBand()
//     .range([0, height]);

var y = d3.scalePoint().rangeRound([margin.top, height - margin.bottom]);
var x = d3.scaleLinear().range([0, width]);
var percent_format = d3.format(".1%");
var number_format = d3.format(",");
median_data.sort(function (a, b) {
  return d3.descending(a.share_tech, b.share_tech);
});
var chart_div = d3.select("#chart").append("div").attr("class", "svg-container");

// Create SVG element
var svg = chart_div.append("svg").attr("class", "svg-content").attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.bottom + margin.top]).attr("preserveAspectRatio", "xMidYMid meet").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var chart_text = svg.append("g");
chart_text.append("text").attr("class", "chart-title").attr("x", 0 - margin.left).attr("y", 0 - margin.top / 2).text("Rural county tech employment");
chart_text.append("text").attr("x", 0 - margin.left).attr("y", 0 - margin.top / 2 + 20).attr("class", "chart-subtitle").text("By racial and ethnic community type");

// // Add caption
// chart_div
//     .append("p")
//     .attr("class", "caption")
//     .style("width", "95%")
//     .html("Source: 2021 ACS 5-year estimates");

// create a tooltip
var tooltip = d3.select("#chart").append("div").attr("class", "tooltip").style("position", "absolute").style("display", "none");
x.domain([0, d3.max(data, function (d) {
  return +d["share_tech"];
})]);
y.domain(d3.map(median_data, function (d) {
  return d.name;
}));
svg.selectAll(".dot").data(data).enter().append("circle").attr("r", 5).attr("cx", function (d) {
  return x(+d["share_tech"]);
}).attr("cy", function (d) {
  return y(d.name);
}).attr("stroke", "#755BA3").attr("fill", "#755BA3").attr("stroke-opacity", 1).attr("stroke-width", 0.3).attr("fill-opacity", 0.05).on("mouseover", function (e, d) {
  d3.select(this).attr("stroke-width", 1).attr("stroke", "orange").attr("fill", "orange").attr("fill-opacity", 0.25);
  tooltip.style("top", event.pageY - 65 + "px").style("left", event.pageX - 200 + "px").html("<p><b> " + d["name_co"] + "</b></p>" + "<p>" + number_format(+d.tech_employment_all_estimate) + " tech jobs</p>" + "<p>Tech jobs make up " + percent_format(+d.share_tech) + " of employment</p>");
  return tooltip.style("display", "block");
}).on("mouseout", function (d) {
  d3.select(this).attr("stroke-width", 0.3).attr("stroke", "#755BA3").attr("fill", "#755BA3").attr("fill-opacity", 0.05);
  return tooltip.style("display", "none");
});
var median_bar_width = 1;
var median_bar_height = 15;
svg.selectAll(".median-bar").data(median_data).enter().append("rect").attr("r", 3).attr("x", function (d) {
  return x(+d["share_tech"]);
}).attr("y", function (d) {
  return y(d.name) - median_bar_height / 2;
}).attr("height", median_bar_height).attr("width", median_bar_width).attr("stroke", "black").attr("fill", "black");

// add the x Axis
var x_axis_buffer = 15;
svg.append("g").attr("transform", "translate(0," + (height - margin.bottom + x_axis_buffer) + ")").call(d3.axisBottom(x).ticks(6, ",.1%").tickSizeInner(4).tickSizeOuter(0)).call(function (g) {
  return g.select(".domain").remove();
});

// add the y Axis
svg.append("g").call(d3.axisLeft(y)).call(function (g) {
  return g.select(".domain").remove();
}).call(function (g) {
  return g.selectAll(".tick line").attr("stroke-opacity", 0.0);
}).call(function (g) {
  return g.selectAll(".tick text").attr("x", "-10");
});
svg.append("text").attr("class", "caption").attr("x", 0 - margin.left).attr("y", height + margin.bottom - 10).text("Source: 2021 ACS 5-year estimates");
var max_val = d3.max(median_data, function (d) {
  return +d.share_tech;
});
var max_median = d3.filter(median_data, function (d) {
  return +d.share_tech === max_val;
});
console.log("max_median", max_median);
var annotation = {
  note: "Median tech employment",
  id: "median-anno",
  data: [{
    x: x(max_median[0].share_tech),
    y: 20
  }, {
    x: x(0.0105),
    y: -5
  }, {
    x: x(0.02),
    y: 0
  }],
  width: 90,
  height: 34,
  line_start: "left"
};
svg.call(addAnnotation, annotation);