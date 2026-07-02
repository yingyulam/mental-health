import { useState } from "react";
import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import {
  immigrationLabels,
  mentalHealthLabels,
  provinceLabels,
  tableau10,
} from "../lib/labels.js";

export default function IconArray({ canada_mental }) {
  const [provinceSelected, setProvince] = useState("All");

  const iconColor = d3
    .scaleOrdinal()
    .domain(canada_mental.map((d) => d.mental_score))
    .range(tableau10);

  const ref = useD3(
    (container) => {
      const margin = { top: 10, right: 20, bottom: 50, left: 60 };
      const visWidth = 800;
      const visHeight = 400;
      const iconSize = 30;
      const numColumns = 10;
      const totalIcons = 100;

      const immigrantGroups = Object.keys(immigrationLabels)
        .filter((key) => +key !== 9)
        .map((key) => ({
          key: +key,
          data: canada_mental.filter(
            (d) => +d.immigrant_flag === +key && d.province === provinceSelected
          ),
        }));

      const svg = container
        .append("svg")
        .attr(
          "viewBox",
          `0, 0, ${visWidth + margin.left + margin.right}, ${
            visHeight + margin.top + margin.bottom
          }`
        )
        .attr("preserveAspectRatio", "xMidYMid meet");

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(
          `Comparing Immigrant and Non-immigrant Mental Health in ${
            provinceSelected === "All" ? "Canada" : provinceSelected
          }`
        );

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 60)
        .attr("text-anchor", "middle")
        .attr("fill", "#555")
        .attr("font-size", "14px")
        .text(
          "Each icon array consists of 100 circles and each circle represents 1 person."
        );

      immigrantGroups.forEach((group, idx) => {
        const groupContainer = svg
          .append("g")
          .attr(
            "transform",
            `translate(${(idx * visWidth) / 2 + margin.left}, ${
              margin.top + 80
            })`
          );

        groupContainer
          .append("text")
          .attr("x", 150)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .text(immigrationLabels[group.key]);

        const iconsGroup = groupContainer
          .append("g")
          .attr("transform", `translate(0, 30)`);

        let iconsMap = group.data.flatMap((d) =>
          Array.from({ length: Math.round(d.rate) }, () => ({
            score: d.mental_score,
          }))
        );

        const lastScore = iconsMap.length
          ? iconsMap[iconsMap.length - 1].score
          : 0;

        if (iconsMap.length > totalIcons) {
          iconsMap = iconsMap.slice(0, totalIcons);
        } else if (iconsMap.length < totalIcons) {
          iconsMap = iconsMap.concat(
            Array.from({ length: totalIcons - iconsMap.length }, () => ({
              score: lastScore,
            }))
          );
        }

        iconsGroup
          .selectAll("circle")
          .data(iconsMap)
          .enter()
          .append("circle")
          .attr("cx", (d, i) => (i % numColumns) * iconSize + iconSize / 2)
          .attr(
            "cy",
            (d, i) => Math.floor(i / numColumns) * iconSize + iconSize / 2
          )
          .attr("r", iconSize / 3)
          .attr("fill", (d) => iconColor(d.score))
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay((d, i) => i * 5)
          .attr("opacity", 0.8);
      });

      // Legend
      const legend = svg
        .append("g")
        .attr("transform", `translate(${visWidth}, ${margin.top + 90})`);

      legend
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("Mental Health Status");

      const legendItems = Object.entries(mentalHealthLabels).map(
        ([score, label]) => ({ color: iconColor(score), label })
      );

      const legendGroups = legend
        .selectAll(".legend-group")
        .data(legendItems)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(10, ${i * 25 + 20})`);

      legendGroups
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", iconSize / 6)
        .attr("fill", (d) => d.color);

      legendGroups
        .append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "12px")
        .text((d) => d.label);
    },
    [canada_mental, provinceSelected]
  );

  return (
    <>
      <div className="controls">
        <div className="control">
          <label htmlFor="ia-prov">Province</label>
          <select
            id="ia-prov"
            value={provinceSelected}
            onChange={(e) => setProvince(e.target.value)}
          >
            {provinceLabels.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart" ref={ref} />
    </>
  );
}
