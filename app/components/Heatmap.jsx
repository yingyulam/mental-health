import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { immigrationLabels, mentalHealthLabels } from "../lib/labels.js";

export default function Heatmap({ overviewData }) {
  const ref = useD3(
    (container) => {
      const margin = { top: 40, right: 120, bottom: 120, left: 120 };
      const width = 800;
      const height = 660;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const tooltip = createTooltip();

      const svg = container
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Immigration Status & Mental Health in Canada");

      const immigrationStatuses = Object.keys(immigrationLabels)
        .filter((key) => +key !== 9)
        .map(Number);
      const mentalHealthLevels = Object.keys(mentalHealthLabels)
        .filter((key) => +key !== 9)
        .map(Number);

      const xScale = d3
        .scaleBand()
        .domain(immigrationStatuses)
        .range([0, innerWidth])
        .padding(0.1);
      const yScale = d3
        .scaleBand()
        .domain(mentalHealthLevels)
        .range([innerHeight, 0])
        .padding(0.1);

      const maxPct = d3.max(overviewData, (d) => d.percentage);
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain([0, maxPct]);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => immigrationLabels[d]))
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("transform", "translate(-15,10)rotate(-60)")
        .style("text-anchor", "end");

      g.append("g")
        .call(d3.axisLeft(yScale).tickFormat((d) => mentalHealthLabels[d]))
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("dx", "-0.4em");

      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 110)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Immigration Status");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -75)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Mental Health Status");

      g.selectAll("rect")
        .data(overviewData)
        .join("rect")
        .attr("x", (d) => xScale(d.immigrationStatus))
        .attr("y", (d) => yScale(d.mentalHealth))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(d.percentage))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
          tooltip.show(
            `Immigration Status: ${immigrationLabels[d.immigrationStatus]}<br/>
             Mental Health: ${mentalHealthLabels[d.mentalHealth]}<br/>
             Count: ${d.count.toLocaleString()}<br/>
             Percentage: ${(d.percentage * 100).toFixed(2)}%`,
            event
          );
          d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
        })
        .on("mousemove", (event) => tooltip.move(event))
        .on("mouseout", function () {
          tooltip.hide();
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
        });

      // Color legend
      const legendWidth = 20;
      const legendHeight = innerHeight / 2;
      const legend = g
        .append("g")
        .attr("transform", `translate(${innerWidth + 30}, ${innerHeight / 4})`);

      const legendAxis = d3
        .axisRight(
          d3.scaleLinear().domain([0, maxPct]).range([legendHeight, 0])
        )
        .ticks(5)
        .tickFormat((d) => `${(d * 100).toFixed(1)}%`);

      legend
        .append("g")
        .call(legendAxis)
        .attr("transform", `translate(${legendWidth}, 0)`);

      const defs = svg.append("defs");
      const gradient = defs
        .append("linearGradient")
        .attr("id", "heatmap-legend-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const offset = i / numStops;
        gradient
          .append("stop")
          .attr("offset", `${offset * 100}%`)
          .attr("stop-color", colorScale(offset * maxPct));
      }

      legend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#heatmap-legend-gradient)");

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Percentage");

      return () => tooltip.destroy();
    },
    [overviewData]
  );

  return <div className="chart" ref={ref} />;
}
