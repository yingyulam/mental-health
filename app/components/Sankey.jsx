import { useState } from "react";
import * as d3 from "d3";
import {
  sankey as d3sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
} from "d3-sankey";
import { useD3 } from "../lib/useD3.js";
import { sankeyVariables, tableau10 } from "../lib/labels.js";

const TARGET_ID = "GENDVMHI"; // Mental Health, fixed target
const colors = {
  GENDVMHI: tableau10[0],
  EHG2DVH3: tableau10[2],
  INCDGHH: tableau10[3],
};

// source -> [middle] -> target, counting records per link.
function computeSankeyData(underlying, srcId, tgtId, midId) {
  const uniqueNodes = new Set();
  const links = [];

  if (!midId) {
    const linkMap = {};
    underlying.forEach((item) => {
      if (item[srcId] != null && item[tgtId] != null) {
        const s = `${srcId}_${item[srcId]}`;
        const t = `${tgtId}_${item[tgtId]}`;
        uniqueNodes.add(s);
        uniqueNodes.add(t);
        const k = `${s}->${t}`;
        linkMap[k] = (linkMap[k] || 0) + 1;
      }
    });
    Object.entries(linkMap).forEach(([key, value]) => {
      const [source, target] = key.split("->");
      links.push({ source, target, value });
    });
  } else {
    const linkMap1 = {};
    const linkMap2 = {};
    underlying.forEach((item) => {
      if (item[srcId] != null && item[midId] != null) {
        const s = `${srcId}_${item[srcId]}`;
        const mid = `${midId}_${item[midId]}`;
        uniqueNodes.add(s);
        uniqueNodes.add(mid);
        const k = `${s}->${mid}`;
        linkMap1[k] = (linkMap1[k] || 0) + 1;
      }
      if (item[midId] != null && item[tgtId] != null) {
        const mid = `${midId}_${item[midId]}`;
        const t = `${tgtId}_${item[tgtId]}`;
        uniqueNodes.add(mid);
        uniqueNodes.add(t);
        const k = `${mid}->${t}`;
        linkMap2[k] = (linkMap2[k] || 0) + 1;
      }
    });
    [linkMap1, linkMap2].forEach((lm) =>
      Object.entries(lm).forEach(([key, value]) => {
        const [source, target] = key.split("->");
        links.push({ source, target, value });
      })
    );
  }

  const nodes = Array.from(uniqueNodes).map((id) => {
    const [category, value] = id.split("_");
    const variable = sankeyVariables.find((v) => v.id === category);
    const name =
      variable && variable.labels[value] ? variable.labels[value] : id;
    return { id, name, category };
  });

  return { nodes, links };
}

export default function Sankey({ cchs, immigrantData, nonImmigrantData }) {
  const [dataTypeId, setDataTypeId] = useState("all");
  const [sourceVarId, setSourceVarId] = useState("INCDGHH");
  const [includeMiddle, setIncludeMiddle] = useState(false);
  const [middleVarId, setMiddleVarId] = useState(null);

  const sourceOptions = sankeyVariables.filter((v) => v.id !== TARGET_ID);
  const middleOptions = sankeyVariables.filter(
    (v) => v.id !== sourceVarId && v.id !== TARGET_ID
  );
  // Keep the middle selection valid even when the source changes.
  const effectiveMiddleId =
    middleOptions.find((v) => v.id === middleVarId)?.id ||
    middleOptions[0]?.id ||
    null;

  const sourceVar = sankeyVariables.find((v) => v.id === sourceVarId);
  const targetVar = sankeyVariables.find((v) => v.id === TARGET_ID);
  const middleVar = sankeyVariables.find((v) => v.id === effectiveMiddleId);

  const ref = useD3(
    (container) => {
      const underlying =
        dataTypeId === "immigrant"
          ? immigrantData
          : dataTypeId === "nonImmigrant"
          ? nonImmigrantData
          : cchs;

      const midId = includeMiddle ? effectiveMiddleId : null;
      const sankeyData = computeSankeyData(
        underlying,
        sourceVarId,
        TARGET_ID,
        midId
      );

      const width = 900;
      const height = 600;

      const svg = container
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .style("font", "10px sans-serif");

      const sankeyGen = d3sankey()
        .nodeId((d) => d.id)
        .nodeAlign(sankeyJustify)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([
          [1, 50],
          [width - 1, height - 5],
        ]);

      const { nodes, links } = sankeyGen({
        nodes: sankeyData.nodes.map((d) => Object.assign({}, d)),
        links: sankeyData.links.map((d) => Object.assign({}, d)),
      });

      const link = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(links)
        .join("g")
        .attr("stroke", (d) => colors[d.source.category]);

      link
        .append("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", (d) => Math.max(1, d.width))
        .append("title")
        .text((d) => `${d.source.name} → ${d.target.name}\n${d.value}`);

      const node = svg
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      node
        .append("rect")
        .attr("height", (d) => d.y1 - d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("fill", (d) => colors[d.category])
        .attr("opacity", 0.8)
        .append("title")
        .text((d) => `${d.name}\n${d.value}`);

      node
        .append("text")
        .attr("x", (d) => (d.x0 < width / 2 ? d.x1 - d.x0 + 6 : -6))
        .attr("y", (d) => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
        .text((d) => d.name)
        .style("font-size", "12px");

      let title = `${sourceVar.name} → ${targetVar.name}`;
      if (midId) {
        title = `${sourceVar.name} → ${middleVar.name} → ${targetVar.name}`;
      }

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(`Sankey Diagram: ${title}`);
    },
    [
      cchs,
      immigrantData,
      nonImmigrantData,
      dataTypeId,
      sourceVarId,
      includeMiddle,
      effectiveMiddleId,
    ]
  );

  return (
    <>
      <div className="controls">
        <div className="control">
          <label htmlFor="sk-data">Immigration Status:</label>
          <select
            id="sk-data"
            value={dataTypeId}
            onChange={(e) => setDataTypeId(e.target.value)}
          >
            <option value="all">All Data</option>
            <option value="immigrant">Immigrant Only</option>
            <option value="nonImmigrant">Non-Immigrant Only</option>
          </select>
        </div>
        <div className="control">
          <label htmlFor="sk-source">Source Variable:</label>
          <select
            id="sk-source"
            value={sourceVarId}
            onChange={(e) => setSourceVarId(e.target.value)}
          >
            {sourceOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control">
          <label>Add Intermediate:</label>
          <label className="control-inline">
            <input
              type="checkbox"
              checked={includeMiddle}
              onChange={(e) => setIncludeMiddle(e.target.checked)}
            />
            Include intermediate variable
          </label>
        </div>
        {includeMiddle && (
          <div className="control">
            <label htmlFor="sk-middle">Middle Variable:</label>
            <select
              id="sk-middle"
              value={effectiveMiddleId ?? ""}
              onChange={(e) => setMiddleVarId(e.target.value)}
            >
              {middleOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="chart" ref={ref} />
      <p className="figcaption">
        Target is fixed to <strong>Mental Health</strong>. The width of each link
        represents the number of records flowing between categories.
      </p>
    </>
  );
}
