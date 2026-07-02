import * as d3 from "d3";
import { useD3 } from "../lib/useD3.js";
import { createTooltip } from "../lib/tooltip.js";
import { ageLabels, immigrationLabels, mentalHealthLabels, tableau10 } from "../lib/labels.js";

export default function BubbleChart({ ageData }) {
  const ref = useD3(
    (container) => {
      const width = 800;
      const height = 500;
      const margin = { top: 80, right: 350, bottom: 120, left: 250 };

      const svg = container
        .append("svg")
        .attr("viewBox", [
          0,
          0,
          width + margin.left + margin.right,
          height + margin.top + margin.bottom,
        ])
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "max-width: 100%; height: auto;");

      svg
        .append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Mental Health Status by Age Group and Immigration Status");

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const { bubbleData, avgData } = ageData;

      const xScale = d3.scaleLinear().domain([0.5, 5.5]).range([0, width]);
      const yScale = d3.scaleLinear().domain([0, 4.5]).range([height, 0]);
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(bubbleData, (d) => d.percentage) || 0.1])
        .range([3, 25]);
      const colorScale = d3
        .scaleOrdinal()
        .domain([1, 2, 9])
        .range([tableau10[0], tableau10[2], tableau10[5]]);

      const xAxis = d3
        .axisBottom(xScale)
        .tickValues([1, 2, 3, 4, 5])
        .tickFormat((d) => ageLabels[d]);
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("transform", "rotate(-45)")
        .attr("y", 15)
        .attr("x", -5)
        .attr("text-anchor", "end");

      const yAxis = d3
        .axisLeft(yScale)
        .tickValues([0, 1, 2, 3, 4])
        .tickFormat((d) => mentalHealthLabels[d]);
      g.append("g").call(yAxis).selectAll("text").attr("font-size", "12px");

      g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 100)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Age Group");
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Mental Health Status");
      g.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Bubble size represents percentage of respondents");

      const lineGenerator = d3
        .line()
        .x((d) => xScale(d.age))
        .y((d) => yScale(d.avgScore))
        .curve(d3.curveBasis);
      const immGroups = d3.group(avgData, (d) => d.immigration);

      // Immigration status legend
      const legendG = g
        .append("g")
        .attr("transform", `translate(${width + 20}, 10)`);
      legendG
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .text("Immigration Status");
      const uniqueImmValues = Array.from(
        new Set(bubbleData.map((d) => d.immigration))
      ).sort((a, b) => a - b);
      const legendImm = legendG
        .selectAll(".legend-imm")
        .data(uniqueImmValues)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25 + 10})`);
      legendImm.append("circle").attr("r", 6).attr("fill", (d) => colorScale(d));
      legendImm
        .append("text")
        .attr("x", 15)
        .attr("y", 4)
        .text((d) => immigrationLabels[d]);

      const maxPercentage = d3.max(bubbleData, (d) => d.percentage) || 1;
      const sizeLegendData = [
        maxPercentage * 0.1,
        maxPercentage * 0.3,
        maxPercentage * 0.6,
      ].sort((a, b) => a - b);

      const trendLegendOffset = 100 + uniqueImmValues.length * 5;
      const trendLegendG = g
        .append("g")
        .attr("transform", `translate(${width + 20}, ${trendLegendOffset})`);
      trendLegendG
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .text("Trend Lines");

      let trendLineCount = 0;
      immGroups.forEach((immData, immStatus) => {
        if (Number(immStatus) === 9) return;
        const sortedData = [...immData].sort((a, b) => a.age - b.age);
        g.append("path")
          .datum(sortedData)
          .attr("fill", "none")
          .attr("stroke", colorScale(Number(immStatus)))
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", Number(immStatus) === 1 ? "5,5" : "none")
          .attr("d", lineGenerator);
        trendLegendG
          .append("line")
          .attr("x1", 0)
          .attr("y1", trendLineCount * 25 + 5)
          .attr("x2", 15)
          .attr("y2", trendLineCount * 25 + 5)
          .attr("stroke", colorScale(Number(immStatus)))
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", Number(immStatus) === 1 ? "5,5" : "none");
        trendLegendG
          .append("text")
          .attr("x", 40)
          .attr("y", trendLineCount * 25 + 10)
          .attr("fill", colorScale(Number(immStatus)))
          .text(`Avg. Mental Health - ${immigrationLabels[immStatus]}`);
        trendLineCount++;
      });

      const sizeLegendOffset = trendLegendOffset + trendLineCount * 30 + 20;
      const sizeLegendG = g
        .append("g")
        .attr("transform", `translate(${width + 20}, ${sizeLegendOffset})`);
      sizeLegendG
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .text("Percentage (%)");
      const sizeLegend = sizeLegendG
        .selectAll(".legend-size")
        .data(sizeLegendData)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 40 + 20})`);
      sizeLegend
        .append("circle")
        .attr("r", (d) => radiusScale(d))
        .attr("fill", "rgba(100, 100, 100, 0.1)")
        .attr("stroke", "#666")
        .attr("stroke-width", 1);
      sizeLegend
        .append("text")
        .attr("x", (d) => radiusScale(d) + 10)
        .attr("y", (d) => (radiusScale(d) > 15 ? 0 : 4))
        .text((d) => d.toFixed(1) + "%");

      const tooltip = createTooltip();

      const positionGroups = d3.group(
        bubbleData,
        (d) => `${d.age}-${d.mentalHealth}`
      );
      const bubbleLayer = g.append("g").attr("class", "bubbles");
      const gridInteractions = g.append("g").attr("class", "grid-interactions");

      positionGroups.forEach((bubblesAtPosition, positionKey) => {
        const [age, mentalHealth] = positionKey.split("-").map(Number);
        const sortedBubbles = [...bubblesAtPosition].sort(
          (a, b) => b.percentage - a.percentage
        );
        sortedBubbles.forEach((d) => {
          bubbleLayer
            .append("circle")
            .datum(d)
            .attr("class", `bubble bubble-imm-${d.immigration}`)
            .attr("cx", xScale(d.age))
            .attr("cy", yScale(d.mentalHealth))
            .attr("r", 0)
            .attr("fill", d3.color(colorScale(d.immigration)).copy({ opacity: 1 }))
            .attr("stroke", colorScale(d.immigration))
            .attr("stroke-width", 1.5);
        });

        const rectWidth = (width / 5) * 0.8;
        const rectHeight = (height / 5) * 0.8;
        gridInteractions
          .append("rect")
          .attr("x", xScale(age) - rectWidth / 2)
          .attr("y", yScale(mentalHealth) - rectHeight / 2)
          .attr("width", rectWidth)
          .attr("height", rectHeight)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseover", (event) =>
            showPositionDetails(age, mentalHealth, bubblesAtPosition, event)
          )
          .on("mousemove", (event) => tooltip.move(event))
          .on("mouseout", hidePositionDetails);
      });

      bubbleLayer
        .selectAll("circle.bubble")
        .transition()
        .duration(500)
        .attr("r", (d) => radiusScale(d.percentage));

      function showPositionDetails(age, mentalHealth, bubblesAtPosition, event) {
        let html = `
          <div style="font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 8px; padding-bottom: 5px;">
            <div>Age Group: ${ageLabels[age]}</div>
            <div>Mental Health: ${mentalHealthLabels[mentalHealth]}</div>
          </div>`;
        for (const bubble of bubblesAtPosition) {
          html += `
            <div style="margin-top: 8px; padding-top: 5px; ${
              bubblesAtPosition.length > 1 ? "border-top: 1px dashed #eee;" : ""
            }">
              <div style="font-weight: bold; color: ${colorScale(
                bubble.immigration
              )};">${immigrationLabels[bubble.immigration]}</div>
              <div><strong>Count:</strong> ${bubble.count}</div>
              <div><strong>Percentage:</strong> ${bubble.percentage.toFixed(
                2
              )}%</div>
            </div>`;
        }
        tooltip.show(html, event);
        bubbleLayer
          .selectAll("circle.bubble")
          .style("opacity", (d) =>
            d.age === age && d.mentalHealth === mentalHealth ? 1 : 0.3
          );
      }

      function hidePositionDetails() {
        tooltip.hide();
        bubbleLayer.selectAll("circle.bubble").style("opacity", 1);
      }

      g.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#666")
        .text("Hover over a position to see all immigration groups");
      g.append("text")
        .attr("x", width / 2)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#666")
        .text("Sub-group Details by Immigration Status (Click Legend Items to Filter)");

      // Filter controls
      const filterControlG = g
        .append("g")
        .attr("transform", `translate(${width + 20}, ${sizeLegendOffset + 170})`);
      filterControlG
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("font-weight", "bold")
        .text("Filter By Group");

      const filterControls = filterControlG
        .selectAll(".filter-control")
        .data([...uniqueImmValues, -1])
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25 + 10})`)
        .style("cursor", "pointer")
        .on("click", function (event, d) {
          filterControls
            .select("circle")
            .attr("fill", "white")
            .attr("stroke-width", 1);
          d3.select(this)
            .select("circle")
            .attr("fill", d === -1 ? "#999" : colorScale(d))
            .attr("stroke-width", 2);
          if (d === -1) {
            bubbleLayer.selectAll("circle.bubble").style("display", null);
          } else {
            bubbleLayer
              .selectAll("circle.bubble")
              .style("display", (b) => (b.immigration === d ? null : "none"));
          }
        });

      filterControls
        .append("circle")
        .attr("r", 6)
        .attr("fill", (d) => (d === -1 ? "#999" : "white"))
        .attr("stroke", (d) => (d === -1 ? "#999" : colorScale(d)))
        .attr("stroke-width", (d) => (d === -1 ? 2 : 1));
      filterControls
        .append("text")
        .attr("x", 15)
        .attr("y", 4)
        .text((d) => (d === -1 ? "All Groups" : immigrationLabels[d]));

      return () => tooltip.destroy();
    },
    [ageData]
  );

  return <div className="chart" ref={ref} />;
}
