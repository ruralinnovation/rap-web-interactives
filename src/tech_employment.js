import * as d3 from "d3";
window.d3 = d3;


import "./css/cori_styles.css";
import * as data from "./data/rural_cty_tech_employment.csv";
import * as median_data from "./data/rural_median_cty_tech_employment.csv";

import * as addAnnotation from "@camdenblatchly/easy-d3-annotate";

let width = 500;
let height = 180;

let margin = { top: 32.5, right: 30, bottom: 30, left: 180 };

let y = d3.scalePoint().rangeRound([margin.top, height - margin.bottom]);

let x = d3.scaleLinear().range([0, width]);

let percent_format = d3.format(".1%");
let number_format = d3.format(",");

median_data.sort((a, b) => d3.descending(a.share_tech, b.share_tech));

let chart_div = d3
	.select("#chart")
	.append("div")
	.attr("class", "svg-container");

// Create SVG element
let svg = chart_div
	.append("svg")
	.attr("class", "svg-content")
	.attr("viewBox", [
		0,
		0,
		width + margin.left + margin.right,
		height + margin.bottom + margin.top,
	])
	.attr("preserveAspectRatio", "xMidYMid meet")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let chart_text = svg.append("g");

chart_text
	.append("text")
	.attr("class", "chart-title")
	.attr("x", 0 - margin.left)
	.attr("y", 0 - margin.top / 2)
	.text("Rural county tech employment");

chart_text
	.append("text")
	.attr("x", 0 - margin.left)
	.attr("y", 0 - margin.top / 2 + 20)
	.attr("class", "chart-subtitle")
	.text("By racial and ethnic community type");

// create a tooltip
var tooltip = d3
	.select("#chart")
	.append("div")
	.attr("class", "tooltip")
	.style("position", "absolute")
	.style("display", "none");

x.domain([0, d3.max(data, (d) => +d["share_tech"])]);
y.domain(d3.map(median_data, (d) => d.name));

svg.selectAll(".dot")
	.data(data)
	.enter()
	.append("circle")
	.attr("r", 5)
	.attr("cx", function (d) {
		return x(+d["share_tech"]);
	})
	.attr("cy", function (d) {
		return y(d.name);
	})
	.attr("stroke", "#755BA3")
	.attr("fill", "#755BA3")
	.attr("stroke-opacity", 1)
	.attr("stroke-width", 0.3)
	.attr("fill-opacity", 0.05)
	.on("mouseover", function (e, d) {
		d3.select(this)
			.attr("stroke-width", 1)
			.attr("stroke", "orange")
			.attr("fill", "orange")
			.attr("fill-opacity", 0.25);

		tooltip
			.style("top", event.pageY - 75 + "px")
			.style("left", event.pageX - 260 + "px")
			.html(
				"<p><b> " +
					d["name_co"] +
					"</b></p>" +
					"<p>" +
					number_format(+d.tech_employment_all_estimate) +
					" tech jobs</p>" +
					"<p>Tech jobs make up <b>" +
					percent_format(+d.share_tech) +
					"</b> of employment</p>",
			);
		return tooltip.style("display", "block");
	})

	.on("mouseout", function (d) {
		d3.select(this)
			.attr("stroke-width", 0.3)
			.attr("stroke", "#755BA3")
			.attr("fill", "#755BA3")
			.attr("fill-opacity", 0.05);

		return tooltip.style("display", "none");
	});

let median_bar_width = 1;
let median_bar_height = 15;

svg.selectAll(".median-bar")
	.data(median_data)
	.enter()
	.append("rect")
	.attr("r", 3)
	.attr("x", function (d) {
		return x(+d["share_tech"]);
	})
	.attr("y", function (d) {
		return y(d.name) - median_bar_height / 2;
	})
	.attr("height", median_bar_height)
	.attr("width", median_bar_width)
	.attr("stroke", "black")
	.attr("fill", "black");

// add the x Axis
let x_axis_buffer = 15;
svg.append("g")
	.attr(
		"transform",
		"translate(0," + (height - margin.bottom + x_axis_buffer) + ")",
	)
	.call(d3.axisBottom(x).ticks(6, ",.1%").tickSizeInner(4).tickSizeOuter(0))
	.call((g) => g.select(".domain").remove());

// add the y Axis
svg.append("g")
	.call(d3.axisLeft(y))
	.call((g) => g.select(".domain").remove())
	.call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.0))
	.call((g) => g.selectAll(".tick text").attr("x", "-10"));

svg.append("text")
	.attr("class", "caption")
	.attr("x", 0 - margin.left)
	.attr("y", height + margin.bottom -5)
	.text("Source: 2021 ACS 5-year estimates");


let max_val = d3.max(median_data, d => +d.share_tech);
let max_median = d3.filter(median_data, d => +d.share_tech === max_val);
console.log("max_median", max_median);
let annotation = {
	note: "Median tech employment",
	id: "median-anno",
	data: [
		{x: x(max_median[0].share_tech), y: 20},
		{x: x(0.0105), y: -5},
		{x: x(0.02), y: 0}
	],
	width: 75,
	height: 28,
	line_start: "left"
}

svg.call(addAnnotation, annotation);

