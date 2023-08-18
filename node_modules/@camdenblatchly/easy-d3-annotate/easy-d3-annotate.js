function getLineData(annotation) {
  let line_data = [...annotation.data];

  let x = annotation.data[annotation.data.length - 1].x;
  let y = annotation.data[annotation.data.length - 1].y - annotation.height / 2;

  if ("line_start" in annotation) {
    if (annotation.line_start === "right") {
      x = annotation.data[annotation.data.length - 1].x + annotation.width / 2;
      y = annotation.data[annotation.data.length - 1].y;
    } else if (annotation.line_start === "left") {
      x = annotation.data[annotation.data.length - 1].x - annotation.width / 2;
      y = annotation.data[annotation.data.length - 1].y;
    } else if (annotation.line_start === "bottom") {
      y = annotation.data[annotation.data.length - 1].y + annotation.height / 2;
    }
  }

  line_data[line_data.length - 1] = { x: x, y: y };
  return line_data;
}

function addAnnotation(selection, annotation) {
  let markerSize = 5;
  let refX = markerSize / 2;
  let arrowPoints = [
    [0, 0],
    [0, markerSize],
    [markerSize, markerSize / 2],
  ];

  if ("arrow_offset" in annotation) {
    annotation.data[0] = {
      x: annotation.data[0].x + annotation.arrow_offset.x,
      y: annotation.data[0].y + annotation.arrow_offset.y,
    };
  }

  let curve_type = "natural";
  if ("curve_type" in annotation) {
    if (annotation.curve_type === "linear") {
      curve_type = "linear";
    }
  }

  let curveFunc = d3
    .line()
    // try curveStep
    .curve(curve_type === "linear" ? d3.curveLinear : d3.curveNatural)
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    });

  let anno_g = selection
    .append("g")
    .attr("id", "id" in annotation ? annotation.id : "")
    .attr("class", "class" in annotation ? annotation.class : "");

  let arrow_id = "arrow-" + new Date().valueOf();

  anno_g
    .append("marker")
    .attr("id", arrow_id)
    .attr("viewBox", "-10 -10 20 20")
    .attr("markerWidth", 15)
    .attr("markerHeight", 15)
    .attr("refX", -1 * refX)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M-6.75, -6.75 L 0, 0 L -6.75, 6.75");

  anno_g
    .append("path")
    .attr("d", curveFunc(getLineData(annotation)))
    .attr("stroke", "black")
    .attr("marker-start", "url(#" + arrow_id + ")")
    .attr("fill", "none");

  anno_g
    .append("foreignObject")
    .attr("x", function () {
      return (
        annotation.data[annotation.data.length - 1].x - annotation.width / 2
      );
    })
    .attr("y", function () {
      return (
        annotation.data[annotation.data.length - 1].y - annotation.height / 2
      );
    })
    .attr("width", annotation.width)
    .attr("height", annotation.height)
    .append("xhtml:div")
    .html(annotation.note);
}

function addAnnotations(selection, annotations) {
  for (let i = 0, l = annotations.length; i < l; i++) {
    let annotation = annotations[i];
    addAnnotation(selection, annotation);
  }
}
