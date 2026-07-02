import * as d3 from "d3";

/**
 * Creates the floating tooltip div used across charts (the notebook appended
 * one to <body> per chart). Returns the d3 selection plus show/move/hide
 * helpers and a `destroy` for cleanup on unmount.
 */
export function createTooltip() {
  const tip = d3
    .select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0 2px 10px rgba(0,0,0,0.12)")
    .style("z-index", "1000")
    .style("opacity", 0);

  return {
    node: tip,
    show(html, event) {
      tip.html(html).transition().duration(150).style("opacity", 1);
      if (event) this.move(event);
    },
    move(event) {
      tip
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    },
    hide() {
      tip.transition().duration(250).style("opacity", 0);
    },
    destroy() {
      tip.remove();
    },
  };
}
