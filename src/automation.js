import * as d3 from "d3";
window.d3 = d3;

function dodge(data, radius, padding, scale) {
  const circles = data.map(d => ({
    x: scale(d.pct_at_risk), 
    pct_at_risk: d.pct_at_risk,
    rurality: d.rurality,
    emp_at_risk: d.emp_at_risk,
    AREA_TITLE: d.AREA_TITLE
  })).sort((a, b) => a.x - b.x);

  const epsilon = 0.001;
  let head = null, tail = null;
    
  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if ((radius * 2 + padding - epsilon) ** 2 > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }
  
  // Place each circle sequentially.
  for (const b of circles) {
    
    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - (radius * 2 + padding)) head = head.next;
    
    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y1 = a.y + Math.sqrt((radius * 2 + padding) ** 2 - (a.x - b.x) ** 2);
        let y2 = a.y - Math.sqrt((radius * 2 + padding) ** 2 - (a.x - b.x) ** 2);
        if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
        if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
        a = a.next;
      } while (a);
    }
    
    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }
  
  return circles;
}

import "./css/cori_styles.css";
import * as data from "./data/bls_automation_by_area.csv";
import * as median_data from "./data/automation_median_dta.csv";
import * as addAnnotation from "@camdenblatchly/easy-d3-annotate";

let width = 500;
let height = 320; // 280;

let margin = { top: 32.5, right: 30, bottom: 30, left: 100 };

let y = d3.scalePoint().rangeRound([margin.top, height - margin.bottom]);

let x = d3.scaleLinear().range([0, width]);

let radius = d3.scaleLog().range([1.5, 6]);

let percent_format = d3.format(".1%");
let number_format = d3.format(",.0f");

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
	.text("Share of employment at risk of automation");

chart_text
	.append("text")
	.attr("x", 0 - margin.left)
	.attr("y", 0 - margin.top / 2 + 20)
	.attr("class", "chart-subtitle")
	.text("For BLS metro and nonmetro areas");

// create a tooltip
var tooltip = d3
	.select("#chart")
	.append("div")
	.attr("class", "tooltip")
	.style("position", "absolute")
	.style("display", "none");

x.domain([
	d3.min(data, (d) => +d["pct_at_risk"]),
	d3.max(data, (d) => +d["pct_at_risk"]),
]);
y.domain(d3.map(data, (d) => d.rurality));
radius.domain([
	d3.min(data, (d) => +d["emp_at_risk"]),
	d3.max(data, (d) => +d["emp_at_risk"]),
]);

let circle_radius = 3;
let rural_dots = dodge(
	data.filter((d) => d.rurality == "Rural"),
	circle_radius,
	0.25,
	x,
);
let nonrural_dots = dodge(
	data.filter((d) => d.rurality == "Nonrural"),
	circle_radius,
	0.25,
	x,
);

let max_rural_y = d3.max(rural_dots, (d) => d.y);
let min_rural_y = d3.min(rural_dots, (d) => d.y);

let rural_range = Math.abs(max_rural_y) + Math.abs(min_rural_y);

let max_nonrural_y = d3.max(nonrural_dots, (d) => d.y);
let min_nonrural_y = d3.min(nonrural_dots, (d) => d.y);

let nonrural_range = Math.abs(max_nonrural_y) + Math.abs(min_nonrural_y);

let tooltip_x_offset = 175;
let tooltip_y_offset = 25;

svg.append("g")
	.attr("transform", `translate(0, ${margin.top + rural_range / 2})`)
	.selectAll(".circle")
	.data(rural_dots)
	.enter()
	.append("circle")
	.attr("cx", (d) => d.x)
	.attr("cy", (d) => d.y)
	.attr("r", (d) => radius(d.emp_at_risk))
	.attr("fill", "#DF7B22")
	.attr("fill-opacity", 0.5)
	.on("mouseover", function (e, d) {
		d3.select(this).attr("fill", "black");

		tooltip
			.style("top", event.pageY + tooltip_y_offset + "px")
			.style("left", event.pageX - tooltip_x_offset + "px")
			.html(
				"<p><b> " +
					d["AREA_TITLE"] +
					"</b></p>" +
					"<p>" +
					number_format(+d.emp_at_risk) +
					" jobs at risk</p>" +
					"<p>" +
					percent_format(+d.pct_at_risk) +
					" of employment at risk</p>",
			);
		return tooltip.style("display", "block");
	})

	.on("mouseout", function (d) {
		d3.select(this).attr("fill", "#DF7B22");
		return tooltip.style("display", "none");
	});

let swarm_padding = 20;
svg.append("g")
	.attr(
		"transform",
		`translate(0, ${
			margin.top + rural_range + nonrural_range / 2 + swarm_padding
		})`,
	)
	.selectAll(".circle")
	.data(nonrural_dots)
	.enter()
	.append("circle")
	.attr("cx", (d) => d.x)
	.attr("cy", (d) => d.y)
	.attr("r", (d) => radius(d.emp_at_risk))
	.attr("fill", "#3A9EBD")
	.attr("fill-opacity", 0.7)
	.on("mouseover", function (e, d) {
		d3.select(this).attr("fill", "black");

		tooltip
			.style("top", event.pageY + tooltip_y_offset + "px")
			.style("left", event.pageX - tooltip_x_offset + 50 + "px")
			.html(
				"<p><b> " +
					d["AREA_TITLE"] +
					"</b></p>" +
					"<p>" +
					number_format(+d.emp_at_risk) +
					" jobs at risk</p>" +
					"<p>" +
					percent_format(+d.pct_at_risk) +
					" of employment at risk</p>",
			);
		return tooltip.style("display", "block");
	})

	.on("mouseout", function (d) {
		d3.select(this).attr("fill", "#3A9EBD");
		return tooltip.style("display", "none");
	});

let median_bar_width = 0.5;
let median_bar_height = 110;
let median_bar_color = "black";

svg.selectAll(".median-bar")
	.data(d3.filter(median_data, (d) => d.rurality == "Rural"))
	.enter()
	.append("rect")
	.attr("x", function (d) {
		return x(+d["pct_at_risk"]);
	})
	.attr("y", margin.top + rural_range / 2 - median_bar_height / 2)
	.attr("height", median_bar_height)
	.attr("width", median_bar_width)
	.attr("stroke", median_bar_color)
	.attr("fill", median_bar_color);

svg.selectAll(".median-bar")
	.data(d3.filter(median_data, (d) => d.rurality == "Nonrural"))
	.enter()
	.append("rect")
	.attr("x", function (d) {
		return x(+d["pct_at_risk"]);
	})
	.attr(
		"y",
		margin.top +
			rural_range +
			swarm_padding +
			nonrural_range / 2 -
			median_bar_height / 2,
	)
	.attr("height", median_bar_height)
	.attr("width", median_bar_width)
	.attr("stroke", median_bar_color)
	.attr("fill", median_bar_color);

// add the x Axis
let x_axis_buffer = 10;
svg.append("g")
	.attr(
		"transform",
		"translate(0," + (height - margin.bottom + x_axis_buffer) + ")",
	)
	.call(d3.axisBottom(x).ticks(6, ",.0%").tickSizeInner(4).tickSizeOuter(0))
	.call((g) => g.select(".domain").remove());

// Add rural and nonrural labels
let label_height = 8;
let x_offset = 20;
svg.append("text")
	.attr("x", 0 - margin.left + x_offset)
	.attr("y", margin.top + rural_range / 2 + label_height / 2)
	.text("Rural");
svg.append("text")
	.attr("x", 0 - margin.left + x_offset)
	.attr(
		"y",
		margin.top +
			rural_range +
			swarm_padding +
			nonrural_range / 2 +
			label_height / 2,
	)
	.text("Nonrural");

svg.append("text")
	.attr("class", "caption")
	.attr("x", 0 - margin.left)
	.attr("y", height + margin.bottom - 2)
	.text(
		"Source: CORI Analysis of Frey and Osborne (2017), 2022 BLS estimates",
	);

let max_val = d3.max(median_data, d => +d.pct_at_risk);
let max_median = d3.filter(median_data, d => +d.pct_at_risk === max_val);
let annotation = {
	note: "Median automation risk",
	id: "median-anno",
	data: [
		{x: x(max_median[0].pct_at_risk), y: 20},
		{x: x(.603), y: -5},
		{x: x(0.68), y: 0}
	],
	width: 75,
	height: 38,
	line_start: "left"
}

svg.call(addAnnotation, annotation);

