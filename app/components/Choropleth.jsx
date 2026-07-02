import { useState } from "react";
import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { Legend } from "../lib/legend.js";
import { immigrationLabels, mentalHealthLabels } from "../lib/labels.js";

export default function Choropleth({ canada, canada_mental }) {
  const [immigrationStatusSelected, setImmigration] = useState(1);
  const [mentalHealthSelected, setMental] = useState(4);

  const ref = useD3(
    (container) => {
      const margin = { top: 40, right: 90, bottom: 10, left: 60 };
      const visWidth = 800;
      const visHeight = 660;

      const provinceMap = new Map(
        [...canada.features.map((d) => d.properties.name), "All"].map((name) => [
          name,
          name === "Nunavut" || name === "Northwest Territories"
            ? null
            : +canada_mental.find(
                (d) =>
                  d.province === name &&
                  +d.immigrant_flag === immigrationStatusSelected &&
                  +d.mental_score === mentalHealthSelected
              )?.rate || 0,
        ])
      );

      const rates = Array.from(provinceMap.values());
      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(rates.filter((v) => v != null)));

      const getColor = (province) => {
        const percentage = provinceMap.get(province);
        return percentage == null ? "transparent" : colorScale(percentage);
      };

      const svg = container
        .append("svg")
        .attr(
          "viewBox",
          `0 0 ${visWidth + margin.left + margin.right} ${
            visHeight + margin.top + margin.bottom
          }`
        )
        .attr("preserveAspectRatio", "xMinYMin meet");

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .attr("font-weight", "bold")
        .text("Map of Canadian Self-rated Mental Health");

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("fill", "#555")
        .attr("font-size", "14px")
        .text(
          "Mental Health by Region: Subtle East-West Variations for Non-Immigrants, No Clear Pattern for Immigrants"
        );

      svg
        .append("g")
        .attr("transform", "translate(660,90)")
        .append(() =>
          Legend(colorScale, {
            title: `${immigrationLabels[immigrationStatusSelected]} with ${mentalHealthLabels[mentalHealthSelected]} Mental Health Rate (%)`,
            width: 260,
          })
        );

      const tooltip = createTooltip();

      const projection = d3
        .geoAlbers()
        .center([0, 60])
        .rotate([98, 0])
        .parallels([29.5, 45.5])
        .scale(900)
        .translate([visWidth / 2, visHeight / 2 + margin.top + 10]);

      const path = d3.geoPath().projection(projection);
      const map = svg.append("g");

      map
        .append("g")
        .selectAll("path")
        .data(canada.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => getColor(d.properties.name))
        .attr("opacity", 0.7)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 1);
          const percentage = provinceMap.get(d.properties.name);
          tooltip.show(
            `<strong>${d.properties.name}</strong><br/>
             ${
               percentage != null
                 ? `Immigration Status: ${immigrationLabels[immigrationStatusSelected]}<br/>
                    Mental Health: ${mentalHealthLabels[mentalHealthSelected]}<br/>
                    Percentage: ${percentage}%`
                 : "No data"
             }`,
            event
          );
        })
        .on("mousemove", (event) => tooltip.move(event))
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 0.7);
          tooltip.hide();
        });

      // Canada overall indicator circle
      const canadaGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left * 2}, ${margin.top + 80})`)
        .attr("text-anchor", "end");

      canadaGroup
        .append("circle")
        .attr("cx", 20)
        .attr("cy", 0)
        .attr("r", 20)
        .attr("fill", getColor("All"))
        .attr("opacity", 0.7)
        .on("mouseover", function (event) {
          d3.select(this).attr("opacity", 1);
          tooltip.show(
            `<strong>Canada</strong><br/>
             Immigration Status: ${immigrationLabels[immigrationStatusSelected]}<br/>
             Percentage: ${provinceMap.get("All")}%`,
            event
          );
        })
        .on("mousemove", (event) => tooltip.move(event))
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 0.7);
          tooltip.hide();
        });

      canadaGroup
        .append("text")
        .attr("x", -10)
        .attr("y", 5)
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr("font-weight", "bold")
        .text("Canada");

      return () => tooltip.destroy();
    },
    [canada, canada_mental, immigrationStatusSelected, mentalHealthSelected]
  );

  const immOptions = Object.entries(immigrationLabels).filter(
    ([k]) => +k !== 9
  );
  const mentalOptions = Object.entries(mentalHealthLabels).filter(
    ([k]) => +k !== 9
  );

  return (
    <>
      <div className="controls">
        <div className="control">
          <label htmlFor="cp-imm">Immigration Status</label>
          <select
            id="cp-imm"
            value={immigrationStatusSelected}
            onChange={(e) => setImmigration(+e.target.value)}
          >
            {immOptions.map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="control">
          <label htmlFor="cp-mh">Mental Health</label>
          <select
            id="cp-mh"
            value={mentalHealthSelected}
            onChange={(e) => setMental(+e.target.value)}
          >
            {mentalOptions.map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart" ref={ref} />
    </>
  );
}
