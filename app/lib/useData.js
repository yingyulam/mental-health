import { useEffect, useState } from "react";
import * as d3 from "d3";

const base = import.meta.env.BASE_URL; // respects vite `base` on Pages/subpaths

// Load once, cache the promise so every consumer shares the same fetch.
let cache = null;

async function loadAll() {
  const [canada, canada_mental, temperatureData, belonging, cchs] =
    await Promise.all([
      d3.json(`${base}data/ca.json`),
      d3.csv(`${base}data/canada_mental_overview.csv`), // strings, coerced per-chart
      d3.csv(`${base}data/cold_days.csv`),
      d3.csv(`${base}data/belonging_mental.csv`),
      d3.csv(`${base}data/clean_cchs_data.csv`, d3.autoType), // typed numbers
    ]);

  // --- Overview / heatmap ---
  const overviewData = canada_mental
    .filter((item) => item.province === "All" && item.mental_score !== "9")
    .map((item) => {
      const count = parseInt(item.count);
      const population = parseInt(item.population);
      return {
        immigrationStatus: parseInt(item.immigrant_flag),
        mentalHealth: parseInt(item.mental_score),
        count,
        population,
        percentage: count / population,
      };
    });

  // --- Sense of belonging ---
  const filteredBelonging = belonging
    .map((d) => ({
      immigrationStatus: +d.immigrant_flag,
      mentalHealthStatus: +d.mental_score,
      senseOfBelonging: +d.sense_belonging,
      percentage: +d.percentage,
    }))
    .filter(
      (d) =>
        d.immigrationStatus !== 9 &&
        d.mentalHealthStatus !== 9 &&
        ![7, 8, 9].includes(d.senseOfBelonging)
    );

  // --- Age (bubble chart) ---
  const ageData = buildAgeData(cchs);

  // --- Education & income (sankey source pools) ---
  const immigrantData = cchs.filter((d) => d.SDCDVIMM === 1);
  const nonImmigrantData = cchs.filter((d) => d.SDCDVIMM === 2);

  return {
    canada,
    canada_mental,
    temperatureData,
    overviewData,
    filteredBelonging,
    ageData,
    cchs,
    immigrantData,
    nonImmigrantData,
  };
}

function buildAgeData(data) {
  const grouped = d3.group(data, (d) => `${d.DHHGAGE}-${d.SDCDVIMM}-${d.GENDVMHI}`);

  const totals = {};
  for (const d of data) {
    const key = `${d.DHHGAGE}-${d.SDCDVIMM}`;
    totals[key] = (totals[key] || 0) + 1;
  }

  const bubbleData = [];
  for (let ageGroup = 1; ageGroup <= 5; ageGroup++) {
    for (let immStatus = 1; immStatus <= 2; immStatus++) {
      const totalForGroup = totals[`${ageGroup}-${immStatus}`] || 0;
      if (totalForGroup === 0) continue;
      for (let mhStatus = 0; mhStatus <= 4; mhStatus++) {
        const group = grouped.get(`${ageGroup}-${immStatus}-${mhStatus}`) || [];
        const count = group.length;
        if (count > 0) {
          bubbleData.push({
            age: ageGroup,
            immigration: immStatus,
            mentalHealth: mhStatus,
            count,
            groupTotal: totalForGroup,
            percentage: (count / totalForGroup) * 100,
          });
        }
      }
    }
  }

  const avgMentalHealthByAgeImm = {};
  for (let ageGroup = 1; ageGroup <= 5; ageGroup++) {
    for (let immStatus = 1; immStatus <= 2; immStatus++) {
      const filtered = data.filter(
        (d) => d.DHHGAGE === ageGroup && d.SDCDVIMM === immStatus
      );
      if (filtered.length > 0) {
        avgMentalHealthByAgeImm[`${ageGroup}-${immStatus}`] = d3.mean(
          filtered,
          (d) => d.GENDVMHI
        );
      }
    }
  }

  const avgData = Object.entries(avgMentalHealthByAgeImm).map(([key, value]) => {
    const [age, immigration] = key.split("-").map(Number);
    return { age, immigration, avgScore: value };
  });

  return { bubbleData, avgData };
}

/** React hook: returns { data, loading, error }. */
export function useData() {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    if (!cache) cache = loadAll();
    cache
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => {
        cache = null; // allow retry on next mount
        if (alive) setState({ data: null, loading: false, error });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
