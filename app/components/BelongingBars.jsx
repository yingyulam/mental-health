import { useState } from "react";
import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { swatches } from "../lib/legend.js";
import {
  mentalHealthLabels,
  senseOfBelongingLabels,
  tableau10,
} from "../lib/labels.js";

const iconColor = d3
  .scaleOrdinal()
  .domain([0, 1, 2, 3, 4, 9])
  .range(tableau10);

export default function BelongingBars({ filteredBelonging }) {
  const [belongingSelected, setBelonging] = useState("All");

  const ref = useD3(
    (container) => {
      const margin = { top: 30, right: 40, bottom: 100, left: 70 };
      const width = 800;
      const height = 500;

      const immigrantData = filteredBelonging.filter(
        (d) => d.immigrationStatus === 1
      );
      const nonImmigrantData = filteredBelonging.filter(
        (d) => d.immigrationStatus === 2
      );

      const fx = d3
        .scaleBand()
        .domain(
          Array.from(
            new Set(filteredBelonging.map((d) => d.senseOfBelonging))
          ).reverse()
        )
        .rangeRound([margin.left, width - margin.right])
        .paddingInner(0.1);

      const mentals = new Set(filteredBelonging.map((d) => d.mentalHealthStatus));
      const x = d3
        .scaleBand()
        .domain(mentals)
        .rangeRound([0, fx.bandwidth()])
        .padding(0.05);

      const container_div = d3
        .create("div")
        .style("display", "flex")
        .style("align-items", "flex-start")
        .style("gap", "20px");

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("font-size", "20px")
        .text("How Community Belonging Affects Mental Health");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top * 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#555")
        .text(
          "Stronger Sense of Belonging Appears More Beneficial for Immigrants’ Mental Health Than for Non-Immigrants"
        );

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -((height + margin.top) / 2))
        .attr("y", margin.left / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Percentage of Self-rated Mental Health Levels (%)");

      // Annotation
      const yImmigrant = d3
        .scaleLinear()
        .domain([0, d3.max(filteredBelonging, (d) => d.percentage)])
        .nice()
        .rangeRound([height / 2 - margin.bottom, margin.top]);

      const target = immigrantData.find(
        (d) => d.senseOfBelonging === 1 && d.mentalHealthStatus === 4
      );

      if (target) {
        const barGroupX = fx(target.senseOfBelonging);
        const barX = barGroupX + x(target.mentalHealthStatus) + x.bandwidth() / 2;
        const barTopY = yImmigrant(target.percentage) + margin.top + 53;
        const labelY = barTopY - 20;
        const annOpacity =
          belongingSelected === "All" || +belongingSelected === 1 ? 1 : 0.2;

        svg
          .append("text")
          .attr("x", barX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "black")
          .text("significantly higher")
          .attr("opacity", annOpacity);

        svg
          .append("defs")
          .append("marker")
          .attr("id", "belonging-arrow")
          .attr("viewBox", "0 0 10 10")
          .attr("refX", 5)
          .attr("refY", 5)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto-start-reverse")
          .append("path")
          .attr("d", "M 0 0 L 10 5 L 0 10 z")
          .attr("fill", "black");

        svg
          .append("line")
          .attr("x1", barX)
          .attr("x2", barX)
          .attr("y1", labelY + 4)
          .attr("y2", barTopY - 1)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("marker-end", "url(#belonging-arrow)")
          .attr("opacity", annOpacity);
      }

      const tooltip = createTooltip();

      function createBarChart(data, offsetY, immigrationStatusLabel) {
        const y = d3
          .scaleLinear()
          .domain([0, d3.max(filteredBelonging, (d) => d.percentage)])
          .nice()
          .rangeRound([height / 2 - margin.bottom, margin.top]);

        svg
          .append("g")
          .selectAll()
          .data(d3.group(data, (d) => d.senseOfBelonging))
          .join("g")
          .attr(
            "transform",
            ([senseOfBelonging]) => `translate(${fx(senseOfBelonging)},${offsetY})`
          )
          .selectAll("rect")
          .data(([, d]) => d)
          .join("rect")
          .attr("x", (d) => x(d.mentalHealthStatus))
          .attr("y", (d) => y(d.percentage))
          .attr("width", x.bandwidth())
          .attr("height", (d) => y(0) - y(d.percentage))
          .attr("fill", (d) => iconColor(d.mentalHealthStatus))
          .attr("opacity", (d) =>
            belongingSelected === "All" ||
            +belongingSelected === +d.senseOfBelonging
              ? 1
              : 0.2
          )
          .on("mouseover", function (event, d) {
            tooltip.show(
              `<strong>${immigrationStatusLabel}</strong><br/>
               ------<br/>
               Sense of Belonging: ${senseOfBelongingLabels[d.senseOfBelonging]}<br/>
               Percentage: ${d.percentage}%`,
              event
            );
          })
          .on("mousemove", (event) => tooltip.move(event))
          .on("mouseout", function () {
            d3.select(this).attr("opacity", (d) =>
              belongingSelected === "All" ||
              +belongingSelected === +d.senseOfBelonging
                ? 1
                : 0.2
            );
            tooltip.hide();
          });

        svg
          .append("g")
          .attr("transform", `translate(0,${offsetY + height / 2 - margin.bottom})`)
          .call(
            d3
              .axisBottom(fx)
              .tickFormat((d) => senseOfBelongingLabels[d])
              .tickSizeOuter(0)
          )
          .call((g) => g.selectAll(".domain").remove());

        if (immigrationStatusLabel === "Non-Immigrants") {
          svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", offsetY + height / 2 - margin.bottom + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Sense of Belonging to the Local Community");
        }

        svg
          .append("g")
          .attr("transform", `translate(${margin.left},${offsetY})`)
          .call(d3.axisLeft(y).ticks(null, "s"))
          .call((g) => g.selectAll(".domain").remove());

        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", offsetY + margin.top)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(immigrationStatusLabel);
      }

      createBarChart(immigrantData, margin.top + 55, "Immigrants");
      createBarChart(nonImmigrantData, margin.top + height / 2, "Non-Immigrants");

      // Legend
      const legend = swatches(
        d3
          .scaleOrdinal()
          .domain([0, 1, 2, 3, 4])
          .range(tableau10.slice(0, 5)),
        { columns: 1, format: (d) => mentalHealthLabels[d] }
      );

      const legendContainer = d3
        .create("div")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "flex-start")
        .style("margin-top", "20px");
      legendContainer
        .append("div")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("margin-bottom", "5px")
        .text("Mental Health");
      legendContainer.node().appendChild(legend);

      container_div.node().appendChild(svg.node());
      container_div.node().appendChild(legendContainer.node());
      container.node().appendChild(container_div.node());

      return () => tooltip.destroy();
    },
    [filteredBelonging, belongingSelected]
  );

  const radioOptions = [
    ...Object.keys(senseOfBelongingLabels).sort((a, b) => b - a),
    "All",
  ];

  return (
    <>
      <div className="controls">
        <div className="control">
          <label>Sense of Belonging</label>
          <div className="control-radio">
            {radioOptions.map((opt) => (
              <label key={opt}>
                <input
                  type="radio"
                  name="belonging"
                  value={opt}
                  checked={belongingSelected === opt}
                  onChange={(e) => setBelonging(e.target.value)}
                />
                {opt === "All" ? "All" : senseOfBelongingLabels[opt]}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="chart" ref={ref} />
    </>
  );
}
