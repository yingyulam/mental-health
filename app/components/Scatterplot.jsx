import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { tableau10 } from "../lib/labels.js";

export default function Scatterplot({ canada_mental, temperatureData }) {
  const ref = useD3(
    (container) => {
      const margin = { top: 50, right: 115, bottom: 60, left: 60 };
      const width = 800;
      const height = 400;

      const svg = container
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Does Regional Temperature Affect Mental Health?");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .attr("fill", "#555")
        .attr("font-size", "14px")
        .text("Cold Climate May Have Limited Impact on Mental Health in Canada");

      const coldDaysMap = new Map(
        temperatureData
          .filter(
            (d) =>
              d.province !== "Nunavut" && d.province !== "Northwest Territories"
          )
          .map((d) => [d.province, +d.total_days_below_minus_ten])
      );

      const allRates = d3.rollups(
        canada_mental.filter(
          (d) =>
            (d.mental_score === "3" || d.mental_score === "4") &&
            coldDaysMap.has(d.province)
        ),
        (v) => d3.sum(v, (d) => +d.rate),
        (d) => `${d.province}_${d.immigrant_flag}`
      );

      const data = allRates.map(([key, mentalRate]) => {
        const [province, immigrant_flag] = key.split("_");
        return {
          province,
          immigrant_flag,
          group: immigrant_flag === "1" ? "Immigrant" : "Non-immigrant",
          coldDays: coldDaysMap.get(province),
          mentalHealthRate: mentalRate,
        };
      });

      const x = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.coldDays))
        .nice()
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top * 1.5]);

      const color = d3
        .scaleOrdinal()
        .domain(["Immigrant", "Non-immigrant"])
        .range([tableau10[0], tableau10[2]]);

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Number of Days with Maximum Temperature Below -10°C Per Year");

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("High Self-rated Mental Health (%)");

      const tooltip = createTooltip();

      svg
        .append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.coldDays))
        .attr("cy", (d) => y(d.mentalHealthRate))
        .attr("r", 6)
        .attr("fill", (d) => color(d.group))
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
          tooltip.show(
            `<strong>Province: ${d.province}</strong><br/>
             Immigration Status: ${d.group}<br/>
             Cold Days Per Year: ${d.coldDays.toFixed(1)} days<br/>
             High self-rated mental health: ${d.mentalHealthRate.toFixed(2)}%`,
            event
          );
        })
        .on("mousemove", (event) => tooltip.move(event))
        .on("mouseout", () => tooltip.hide());

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - margin.right}, ${margin.top * 1.5})`
        );

      legend
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("Immigration Status");

      ["Immigrant", "Non-immigrant"].forEach((group, i) => {
        legend
          .append("circle")
          .attr("cx", 15)
          .attr("cy", i * 20 + 20)
          .attr("r", 4)
          .attr("fill", color(group));
        legend
          .append("text")
          .attr("x", 22)
          .attr("y", i * 20 + 23)
          .text(group)
          .attr("font-size", "10px")
          .attr("fill", "#333");
      });

      return () => tooltip.destroy();
    },
    [canada_mental, temperatureData]
  );

  return <div className="chart" ref={ref} />;
}
