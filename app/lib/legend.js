import * as d3 from "d3";

// Port of Observable's "@d3/color-legend" (Legend + swatches), trimmed to the
// scale types this project uses: sequential colour ramps and ordinal swatches.
// Both return a DOM node, matching the original API.

export function Legend(
  color,
  {
    title,
    tickSize = 6,
    width = 320,
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues,
  } = {}
) {
  function ramp(colorFn, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = colorFn(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible")
    .style("display", "block");

  let tickAdjust = (g) =>
    g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Sequential / diverging scale with an interpolator.
  const n = Math.min(color.domain().length, color.range().length);
  x = color.copy().rangeRound(
    d3.quantize(d3.interpolate(marginLeft, width - marginRight), n)
  );

  svg
    .append("image")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("preserveAspectRatio", "none")
    .attr(
      "xlink:href",
      ramp(
        color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))
      ).toDataURL()
    );

  // Continuous linear axis over the colour scale's domain.
  const linear = d3
    .scaleLinear()
    .domain(color.domain())
    .range([marginLeft, width - marginRight]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3
        .axisBottom(linear)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues)
    )
    .call(tickAdjust)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "legend-title")
        .text(title)
    );

  return svg.node();
}

export function swatches(
  color,
  {
    columns = null,
    format = (x) => x,
    swatchSize = 15,
    swatchWidth = swatchSize,
    swatchHeight = swatchSize,
    marginLeft = 0,
  } = {}
) {
  const id = `swatches-${Math.floor(performance.now())}`;
  const domain = color.domain();

  if (columns !== null) {
    const div = document.createElement("div");
    div.style.cssText = `display:flex;align-items:center;margin-left:${+marginLeft}px;min-height:33px;font:10px sans-serif`;
    div.innerHTML = `<div style="width:100%;columns:${columns};">${domain
      .map((value) => {
        const label = `${format(value)}`;
        return `<div style="break-inside:avoid;display:flex;align-items:center;padding-bottom:1px;">
          <div style="width:${+swatchWidth}px;height:${+swatchHeight}px;margin:0 0.5em 0 0;background:${color(value)};border-radius:2px;"></div>
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</div>
        </div>`;
      })
      .join("")}</div>`;
    return div;
  }

  const span = document.createElement("span");
  span.style.cssText = `display:inline-flex;align-items:center;margin-left:${+marginLeft}px;font:10px sans-serif`;
  span.innerHTML = domain
    .map(
      (value) =>
        `<span class="${id}" style="display:inline-flex;align-items:center;margin-right:1em;">
          <span style="width:${+swatchWidth}px;height:${+swatchHeight}px;margin-right:0.5em;background:${color(value)};border-radius:2px;"></span>${format(value)}</span>`
    )
    .join("");
  return span;
}
