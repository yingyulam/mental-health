import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { Legend } from "../lib/legend.js";
import { canadaHexMap, mentalHealthLabels, tableau10 } from "../lib/labels.js";

export default function HexbinPie({ canada_mental, temperatureData }) {
  const iconColor = d3
    .scaleOrdinal()
    .domain(canada_mental.map((d) => d.mental_score))
    .range(tableau10);

  const ref = useD3(
    (container) => {
      const margin = { top: 20, right: 20, bottom: 40, left: 20 };
      const visWidth = 800;
      const visHeight = 400;
      const hexRadius = 25;

      const provinceTemperatureMap = new Map(
        temperatureData
          .filter(
            (d) =>
              d.province !== "Nunavut" && d.province !== "Northwest Territories"
          )
          .map((d) => [d.province, parseFloat(d.total_days_below_minus_ten)])
      );

      const colorScale = d3
        .scaleSequential(d3.interpolateYlGnBu)
        .domain(d3.extent(Array.from(provinceTemperatureMap.values())));

      const hexWidth = 2 * hexRadius;
      const hexHeight = Math.sqrt(3) * hexRadius;

      const svg = container
        .append("svg")
        .attr("viewBox", [0, 0, visWidth, visHeight]);

      const tooltip = createTooltip();

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Exploring Mental Health of Immigrants by Cold Temperature in Canada");

      svg
        .append("text")
        .attr("x", visWidth / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#555")
        .text("Click a province to see immigrant mental health distribution");

      const getColor = (province) => {
        const days = provinceTemperatureMap.get(province);
        return days ? colorScale(days) : "transparent";
      };

      const getTextColor = (bgColor) => {
        const rgb = d3.color(bgColor);
        if (!rgb) return "#000";
        const brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        return brightness < 140 ? "#fff" : "#000";
      };

      const hexbinMap = svg.append("g");

      hexbinMap
        .append("text")
        .attr("x", visWidth / 3)
        .attr("y", 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Cold Weather by Province");

      const hexGen = d3Hexbin();

      hexbinMap
        .append("g")
        .attr("fill", "#ddd")
        .attr("stroke", "black")
        .selectAll("path")
        .data(canadaHexMap)
        .enter()
        .append("path")
        .attr("transform", (d) => {
          const xOffset = d.Y % 2 === 0 ? 0 : hexRadius;
          return `translate(${d.X * hexWidth + margin.left + xOffset}, ${
            d.Y * hexHeight + margin.top * 5
          })`;
        })
        .attr("d", hexGen.hexagon(hexRadius))
        .attr("fill", (d) => getColor(d.Province))
        .attr("stroke", (d) =>
          provinceTemperatureMap.has(d.Province) ? "black" : "transparent"
        )
        .style("cursor", "pointer")
        .on("click", (event, d) => updatePieChart(d.Province))
        .on("mouseover", (event, d) => {
          const days = provinceTemperatureMap.get(d.Province)?.toFixed(0);
          d3.select(event.currentTarget).attr("opacity", 1);
          tooltip.show(
            `<strong>${d.Province}</strong><br/>${days} days below -10°C per year`,
            event
          );
        })
        .on("mousemove", (event) => tooltip.move(event))
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 0.7);
          tooltip.hide();
        });

      hexbinMap
        .append("g")
        .selectAll("text")
        .data(canadaHexMap)
        .enter()
        .append("text")
        .attr(
          "x",
          (d) => d.X * hexWidth + margin.left + (d.Y % 2 === 0 ? 0 : hexRadius)
        )
        .attr("y", (d) => d.Y * hexHeight + margin.top * 5)
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .style("fill", (d) => getTextColor(getColor(d.Province)))
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .text((d) => (provinceTemperatureMap.has(d.Province) ? d.Abbr : ""));

      hexbinMap
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left * 4}, ${visHeight - margin.bottom * 2})`
        )
        .append(() =>
          Legend(colorScale, {
            title:
              "Number of Days with Maximum Temperature Below -10°C per Year",
            width: 150,
          })
        );

      function updatePieChart(province) {
        const daysBelowMinus10 = provinceTemperatureMap.get(province);
        const filteredData = canada_mental
          .filter((d) => d.province === province && +d.immigrant_flag === 1)
          .map((d) => ({ mentalScore: d.mental_score, rate: +d.rate }));

        svg.selectAll(".pieChart").remove();
        const pieChartSvg = createPieChart(
          filteredData,
          province,
          daysBelowMinus10
        );
        const pieChartGroup = svg
          .append("g")
          .attr("class", "pieChart")
          .attr("transform", `translate(${visWidth / 1.6}, ${margin.top * 3})`);
        pieChartGroup.node().appendChild(pieChartSvg);
      }

      function createPieChart(filteredData, province, daysBelowMinus10) {
        const width = 250;
        const height = 400;
        const m = { top: 35, right: 10, bottom: 35, left: 10 };
        const innerWidth = width - m.left - m.right;
        const innerHeight = height - m.top * 2 - m.bottom * 2;
        const radius = Math.min(innerWidth, innerHeight) / 2;

        const pie = d3.pie().sort(null).value((d) => d.rate);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const labelRadius = radius * 0.8;
        const arcLabel = d3
          .arc()
          .innerRadius(labelRadius)
          .outerRadius(labelRadius);
        const arcs = pie(filteredData);

        const pieSvg = d3
          .create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        const chartGroup = pieSvg
          .append("g")
          .attr(
            "transform",
            `translate(${m.left + innerWidth / 2}, ${m.top + innerHeight / 2})`
          );

        pieSvg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 18)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .style("font-family", "serif")
          .text(province);

        pieSvg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 36)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#555")
          .style("font-family", "serif")
          .text(`Max temp below -10°C: ${daysBelowMinus10.toFixed(0)} days/year`);

        chartGroup
          .append("g")
          .attr("stroke", "white")
          .selectAll("path")
          .data(arcs)
          .join("path")
          .attr("fill", (d) => iconColor(d.data.mentalScore))
          .attr("opacity", 0.8)
          .attr("d", arc)
          .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 1);
            tooltip.show(
              `<strong>Mental Health: ${
                mentalHealthLabels[d.data.mentalScore]
              }</strong><br/>
               Immigration Status: Immigrant<br/>
               Percentage: ${d.data.rate.toFixed(2)}%`,
              event
            );
          })
          .on("mousemove", (event) => tooltip.move(event))
          .on("mouseout", function () {
            d3.select(this).attr("opacity", 0.8);
            tooltip.hide();
          });

        chartGroup
          .append("g")
          .attr("text-anchor", "middle")
          .selectAll("text")
          .data(arcs)
          .join("text")
          .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
          .call((text) =>
            text
              .filter((d) => d.endAngle - d.startAngle > 0.25)
              .append("tspan")
              .attr("y", "0.7em")
              .attr("fill-opacity", 0.7)
              .text((d) => `${d.data.rate.toFixed(2)}%`)
          );

        const legend = pieSvg
          .append("g")
          .attr("transform", `translate(${m.left + 10}, ${innerHeight + m.bottom})`);

        const itemsPerRow = 3;
        const legendItems = legend
          .selectAll("g")
          .data(arcs)
          .join("g")
          .attr("transform", (d, i) => {
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            return `translate(${col * 70}, ${row * 20})`;
          });

        legendItems
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", (d) => iconColor(d.data.mentalScore))
          .attr("opacity", 0.8);

        legendItems
          .append("text")
          .attr("x", 18)
          .attr("y", 10)
          .text((d) => mentalHealthLabels[d.data.mentalScore])
          .style("font-size", "10px");

        return pieSvg.node();
      }

      updatePieChart("Alberta");

      return () => tooltip.destroy();
    },
    [canada_mental, temperatureData]
  );

  return <div className="chart" ref={ref} />;
}
