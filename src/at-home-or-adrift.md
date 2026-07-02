<h1>At Home or Adrift? </h1>
<h3>Analysis of Mental Health Factors Between Immigrants and Non-Immigrants in Canada</h3>
<h4>--CS7250 Final Project</h4>

Authors: Yingyu Lin, Chen Chen

<h2>Introduction</h2>

This project explores how various factors—such as region, weather, sense of belonging to the local community, age group and work activity—may relate to self-reported mental health among immigrants and non-immigrants in Canada.

Rather than seeking a definitive answer, our goal is to spark curiosity and raise awareness about the experiences of immigrants. The visual narrative is designed to be viewer-driven, encouraging users to interact with the data, explore different dimensions, and draw their own insights. Through this exploratory approach, we hope to promote reflection on how social, environmental, and demographic factors may influence or shape mental well-being.

<h2>Data Description</h2>

The main dataset we used in this project is the Canadian Community Health Survey (CCHS) Public Use Microdata File. This data is collected by Statistics Canada, Canada's national statistical agency. This comprehensive health survey gathers information from Canadians across the country about their health status, healthcare utilization patterns, and various health determinants. The survey is designed to provide reliable estimates at the health region level and includes respondents aged 12 and older living in private dwellings across all provinces and territories.

<h3>Dataset Contents</h3>
The CCHS dataset contains a variety of information including:

- Demographic variables (age, gender, immigration status, etc.)
- Mental health indicators (perceived mental health, stress levels, mood disorders)
- Physical health measures (chronic conditions, activity limitations)
- Health behaviours (smoking, alcohol consumption, physical activity)
- Healthcare access and utilization
- Social determinants of health (income, education, employment)
- Geographic variables (province, health region)

<h3>Preprocessing and Patterns</h3>
We had a brainstorming meeting in the beginning to develop ideas for our visualizations. Since our focus is on comparing  mental health between immigrants and non-immigrants, the first two variables we identified were immigration status and perceived mental health. 

Based on our interests and project goals, we each pursued variables that aligned with our specific research questions, including province, income, education, age, belongings. During our exploratory data analysis (EDA), we noticed that the sample contained significantly more non-immigrant data points than immigrant data points. This imbalance led us to make the decision that we would compare these groups in relative terms rather than absolute counts to ensure fair comparisons.

Additionally, one of our key hypotheses was that geographic location and climate conditions might impact mental health outcomes. To explore this relationship, we incorporated <b>the Canadian Climate Normals dataset</b> from Environment and Climate Change Canada, which provides 30-year statistical summaries of weather elements across Canadian locations, including temperature, precipitation, humidity, and other meteorological variables.

To effectively visualize geographic patterns in mental health status across Canada, we also integrated a <b>Canada Map GeoJSON file</b> from SimpleMaps. This geographical dataset contains the boundaries of Canadian provinces and territories, allowing us to create interactive spatial visualizations that reveal regional variations in mental health outcomes and potential correlations with climate conditions.


<h2>Logistics</h2>

<h3>Imports</h3>

```js
d3 = require('d3@7', "d3-hexbin@0.2")
```

```js
import {Legend, swatches} from "@d3/color-legend"
```

```js
d3Sankey = require.alias({"d3-array": d3, "d3-shape": d3, "d3-sankey": "d3-sankey@0.12.3/dist/d3-sankey.min.js"})("d3-sankey")
```

<h3>Global Variables</h3>

```js
// tableau10 = [
//     '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', 
//     '#59a14f', '#edc949', '#af7aa1', '#ff9da7', 
//     '#9c755f', '#bab0ab'
//   ];
tableau10 = [
    '#44AA99', '#88CCEE', '#DDCC77', '#CC6677',
    '#AA4499', '#D3D3D3'
  ];
```

```js
mentalHealthLabels = ({
    0: "Poor",
    1: "Fair",
    2: "Good",
    3: "Very good",
    4: "Excellent",
    9: "Not Stated"
  });
```

```js
immigrationLabels = ({
  1: "Immigrant",
  2: "Non-immigrant",
  9: "Not stated"
});
```

```js
provinceLabels = [
  'All',
  'Newfoundland and Labrador',
  'Prince Edward Island',
  'Nova Scotia',
  'New Brunswick',
  'Québec',
  'Ontario',
  'Manitoba',
  'Saskatchewan',
  'Alberta',
  'British Columbia',
  'Yukon'
]
```

```js
senseOfBelongingLabels = ({
    1: "Very Strong",
    2: "Somewhat Strong",
    3: "Somewhat Weak",
    4: "Weak"
  });
```

```js
ageLabels = ({
    1: "12 to 17 years",
    2: "18 to 34 years",
    3: "35 to 49 years",
    4: "50 to 64 years",
    5: "65 and older"
  });
```

```js
satisfactionLabels = ({
    0: "Very Dissatisfied",
    1: "Satisfaction: 1",
    2: "Satisfaction: 2",
    3: "Satisfaction: 3",
    4: "Satisfaction: 4",
    5: "Satisfaction: 5",
    6: "Satisfaction: 6",
    7: "Satisfaction: 7",
    8: "Satisfaction: 8",
    9: "Satisfaction: 9",
    10: "Very Satisfied",
    97: "Don't Know",
    98: "Refusal",
    99: "Not Stated"
  })
```

```js
educationLabels = ({
    1: "Less than Secondary",
    2: "Secondary, No Post-Secondary",
    3: "Post-Secondary/University",
    9: "Not Stated"})
```

```js
incomeLabels = ({
    1: "$20,000-$39,999",
    2: "$40,000-$59,999",
    3: "$60,000-$79,999",
    4: "$80,000 or more",
    9: "Not Stated"
  })
```

<h3>Data Uploads and Processing</h3>

<h4> -- Overview & Chloropleth map</h4>

```js
canada = FileAttachment("ca.json").json()
```

```js
canada_mental = FileAttachment("canada_mental_overview@2.csv").csv()
```

```js
overviewData = {
 const allProvinceData = canada_mental.filter(item => item.province === "All");
const allProvinceDataExNotStated = allProvinceData.filter(item => item.mental_score !== "9");
  
  // Transform the data to calculate percentage as count/population
  const overviewData = allProvinceDataExNotStated.map(item => {
    const count = parseInt(item.count);
    const population = parseInt(item.population);
    
    return {
      immigrationStatus: parseInt(item.immigrant_flag),
      mentalHealth: parseInt(item.mental_score),
      count: count,
      population: population,
      // Calculate percentage as count divided by population
      percentage: count / population
    };
  });
  
  return overviewData;
}
```

<h4> -- Weather</h4>

```js
canadaHexMap = [
  {Province: "British Columbia", Abbr: "BC", X: 1, Y: 2},      // Far west
  {Province: "Yukon", Abbr: "YT", X: 1, Y: 1},                 // North of BC
  {Province: "Alberta", Abbr: "AB", X: 2, Y: 2},               // Just east of BC
  {Province: "Saskatchewan", Abbr: "SK", X: 3, Y: 2},           // East of Alberta
  {Province: "Manitoba", Abbr: "MB", X: 4, Y: 2},              // East of Saskatchewan
  {Province: "Ontario", Abbr: "ON", X: 5, Y: 3},               // East of Manitoba
  {Province: "Québec", Abbr: "QC", X: 6, Y: 2},                // East of Ontario
  {Province: "Newfoundland and Labrador", Abbr: "NL", X: 7, Y: 1}, // Top-right of the map
  {Province: "Nova Scotia", Abbr: "NS", X: 5, Y: 2},           // To the south-east of Quebec
  {Province: "New Brunswick", Abbr: "NB", X: 7, Y: 2},          // To the south of Quebec
  {Province: "Prince Edward Island", Abbr: "PE", X: 8, Y: 2},   // Just south of Nova Scotia
]
```

```js
temperatureData = FileAttachment("cold_days@2.csv").csv()
```

<h4> -- Sense of Belonging</h4>

```js
belonging = FileAttachment("belonging_mental.csv").csv()
```

```js
filteredBelonging = belonging.map(d => ({
  immigrationStatus: +d['immigrant_flag'],
  mentalHealthStatus: +d['mental_score'],
  senseOfBelonging: +d['sense_belonging'],
  percentage: +d['percentage']
})).filter(d => d.immigrationStatus !== 9 && d.mentalHealthStatus !== 9 && !([7, 8, 9].includes(d.senseOfBelonging)))
```

<h4> -- Age Groups</h4>

```js
data = FileAttachment("clean_cchs_data.csv").csv({typed: true})
```

```js

ageData = {
  // Group data by age, immigration status, and mental health
  const grouped = d3.group(data, 
    d => `${d.DHHGAGE}-${d.SDCDVIMM}-${d.GENDVMHI}`
  );
  
  // Calculate totals for each age-immigration combination
  const totals = {};
  for (const d of data) {
    const key = `${d.DHHGAGE}-${d.SDCDVIMM}`;
    totals[key] = (totals[key] || 0) + 1;
  }
  
  // Create aggregated data with correct percentages
  const bubbleData = [];
  for (let ageGroup = 1; ageGroup <= 5; ageGroup++) {
    for (let immStatus = 1; immStatus <= 2; immStatus++) {
      // Get the total count for this age-immigration combination
      const totalForGroup = totals[`${ageGroup}-${immStatus}`] || 0;
      
      // Skip if there's no data for this combination
      if (totalForGroup === 0) continue;
      
      for (let mhStatus = 0; mhStatus <= 4; mhStatus++) {
        const key = `${ageGroup}-${immStatus}-${mhStatus}`;
        const group = grouped.get(key) || [];
        const count = group.length;
        
        if (count > 0) {
          // Calculate percentage within this age-immigration group
          const percentage = (count / totalForGroup) * 100;
          
          bubbleData.push({
            age: ageGroup,
            immigration: immStatus,
            mentalHealth: mhStatus,
            count: count,
            // The group total is also useful for reference
            groupTotal: totalForGroup,
            percentage: percentage
          });
        }
      }
    }
  }
  
  // Calculate average mental health score by age and immigration
  const avgMentalHealthByAgeImm = {};
  for (let ageGroup = 1; ageGroup <= 5; ageGroup++) {
    for (let immStatus = 1; immStatus <= 2; immStatus++) {
      const filtered = data.filter(d => d.DHHGAGE === ageGroup && d.SDCDVIMM === immStatus);
      if (filtered.length > 0) {
        const avgScore = d3.mean(filtered, d => d.GENDVMHI);
        avgMentalHealthByAgeImm[`${ageGroup}-${immStatus}`] = avgScore;
      }
    }
  }
  
  // Transform to array format
  const avgData = Object.entries(avgMentalHealthByAgeImm).map(([key, value]) => {
    const [age, immigration] = key.split('-').map(Number);
    return { age, immigration, avgScore: value };
  });
  
  return {
    bubbleData,
    avgData
  };
}
```

<h4> -- Education and Income</h4>

```js
immigrantData = data.filter(d => d.SDCDVIMM === 1);
```

```js
nonImmigrantData = data.filter(d => d.SDCDVIMM === 2);
```

```js
variables = [
  { id: "GENDVMHI", name: "Mental Health", labels: mentalHealthLabels },
  { id: "EHG2DVH3", name: "Education Level", labels: educationLabels },
  { id: "INCDGHH", name: "Household Income", labels: incomeLabels }
]

```

```js
targetVar = variables.find(v => v.id === "GENDVMHI")
```

```js
sankeyData = {
  // Get the variables for the flow
  const src = sourceVar.id;
  const tgt = targetVar.id;
  const mid = includeMiddle.length ? middleVar.id : null;
  
  // Track unique nodes and links
  const uniqueNodes = new Set();
  const links = [];
  
  // Direct mapping: source -> target
  if (!mid) {
    const linkMap = {};
    
    sankeyDataUnderlying.forEach(item => {
      if (item[src] !== null && item[tgt] !== null) {
        const sourceNode = `${src}_${item[src]}`;
        const targetNode = `${tgt}_${item[tgt]}`;
        
        uniqueNodes.add(sourceNode);
        uniqueNodes.add(targetNode);
        
        const linkKey = `${sourceNode}->${targetNode}`;
        linkMap[linkKey] = (linkMap[linkKey] || 0) + 1;
      }
    });
    
    // Convert to links array
    Object.entries(linkMap).forEach(([key, value]) => {
      const [source, target] = key.split('->');
      links.push({ source, target, value });
    });
  } 
  // Mapping with intermediate: source -> middle -> target
  else {
    const linkMap1 = {}; // source -> middle
    const linkMap2 = {}; // middle -> target
    
    sankeyDataUnderlying.forEach(item => {
      // Source -> Middle
      if (item[src] !== null && item[mid] !== null) {
        const sourceNode = `${src}_${item[src]}`;
        const middleNode = `${mid}_${item[mid]}`;
        
        uniqueNodes.add(sourceNode);
        uniqueNodes.add(middleNode);
        
        const linkKey1 = `${sourceNode}->${middleNode}`;
        linkMap1[linkKey1] = (linkMap1[linkKey1] || 0) + 1;
      }
      
      // Middle -> Target
      if (item[mid] !== null && item[tgt] !== null) {
        const middleNode = `${mid}_${item[mid]}`;
        const targetNode = `${tgt}_${item[tgt]}`;
        
        uniqueNodes.add(middleNode);
        uniqueNodes.add(targetNode);
        
        const linkKey2 = `${middleNode}->${targetNode}`;
        linkMap2[linkKey2] = (linkMap2[linkKey2] || 0) + 1;
      }
    });
    
    // Convert to links array
    Object.entries(linkMap1).forEach(([key, value]) => {
      const [source, target] = key.split('->');
      links.push({ source, target, value });
    });
    
    Object.entries(linkMap2).forEach(([key, value]) => {
      const [source, target] = key.split('->');
      links.push({ source, target, value });
    });
  }
  
  // Create nodes array with proper labels
  const nodes = Array.from(uniqueNodes).map(id => {
    const [category, value] = id.split('_');
    let name;
    
    // Get the variable definition
    const variable = variables.find(v => v.id === category);
    
    if (variable && variable.labels[value]) {
      name = variable.labels[value];
    } else {
      name = id; // Default if no matching category
    }
    
    return {
      id,
      name,
      category
    };
  });
  
  return { nodes, links };
}

```

```js
sankeyDataUnderlying = {
  if (dataType.id === "immigrant") {
    return immigrantData;
  } else if (dataType.id === "nonImmigrant") {
    return nonImmigrantData;
  } else {
    return data; // The original combined dataset
  }
}
```

```js
colors = ({
  GENDVMHI: tableau10[0],  // blue
  EHG2DVH3: tableau10[2],  // red
  INCDGHH: tableau10[3]})    // teal

```

<h3>Functions</h3>

```js
iconColor = d3.scaleOrdinal()
    .domain(canada_mental.map(d => d.mental_score))
    .range([tableau10[0], tableau10[1], tableau10[2], tableau10[3], 
    tableau10[4], tableau10[5]]);

```

```js
function createPieChart(filteredData, province, daysBelowMinus10) {
  const width = 250;
  const height = 400;

  const margin = { top: 35, right: 10, bottom: 35, left: 10 }; // Space for title & legend
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top * 2 - margin.bottom * 2;
  const radius = Math.min(innerWidth, innerHeight) / 2;

  const mentalScores = ["0", "1", "2", "3", "4", "9"];

  const pie = d3.pie()
    .sort(null)
    .value(d => d.rate);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const labelRadius = radius * 0.8;
  const arcLabel = d3.arc()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius);

  const arcs = pie(filteredData);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc") 
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("opacity", 0);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`);

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .style("font-family", "serif")
    .text(province);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 36)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#555")
    .style("font-family", "serif")
    .text(`Max temp below -10°C: ${daysBelowMinus10.toFixed(0)} days/year`);

  // Pie slices
  chartGroup.append("g")
    .attr("stroke", "white")
    .selectAll("path")
    .data(arcs)
    .join("path")
      .attr("fill", d => iconColor(d.data.mentalScore))
      .attr("opacity", 0.8)
      .attr("d", arc)
        .on("mouseover", (event, d) => {
        d3.select(this)
          .attr("opacity", 1);
          tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`
            <strong>Mental Health: ${mentalHealthLabels[d.data.mentalScore]}</strong><br/>
            Immigration Status: Immigrant<br/>
            Percentage: ${d.data.rate.toFixed(2)}%
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
        tooltip.transition().duration(300).style("opacity", 0);
      })
  
  // Percentages
  chartGroup.append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
      .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25)
        .append("tspan")
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .text(d => `${d.data.rate.toFixed(2)}%`)
      );

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + 10}, ${innerHeight + margin.bottom})`);

  const itemsPerRow = 3;
  const legendItems = legend.selectAll("g")
    .data(arcs)
    .join("g")
    .attr("transform", (d, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      return `translate(${col * 70}, ${row * 20})`;
    });

  legendItems.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => iconColor(d.data.mentalScore))
    .attr("opacity", 0.8);

  legendItems.append("text")
    .attr("x", 18)
    .attr("y", 10)
    .text(d => mentalHealthLabels[d.data.mentalScore])
    .style("font-size", "10px");

  return svg.node();
}

```

<h2>Visualizations and Design Rationale</h2>

```html
<h3>0. Overview</h3>

```

<h4>Heatmap</h4>

We developed this heatmap during our exploratory data analysis as a bird's-eye view of the relationship between immigration status and mental health in Canada. Our analysis reveals that while "Very good" mental health is most common among both immigrants (33.9%) and non-immigrants (36.4%), immigrants report "Excellent" mental health at notably higher rates (32.0% vs 27.3%)—marking the largest percentage difference between the groups. The data suggests slightly better overall mental health among immigrants, with 89.8% reporting "Good" to "Excellent" outcomes versus 88.3% of non-immigrants. Given the substantial difference in sample populations (17,476 immigrants compared to 88,594 non-immigrants), we deliberately used percentage-based visualization to prevent the larger non-immigrant dataset from skewing visual interpretation. The gradient effectively represents percentage distributions, while hover tooltips provide both raw counts and percentage values.This approach quickly surfaced key patterns that revealed potential underlying factors influencing mental health outcomes, guiding our subsequent exploration into what specific determinants might be affecting mental health status across different immigration categories.


```js
chart = {
  const margin = { top: 40, right: 120, bottom: 120, left: 120 };
  const visWidth = 800;
  const visHeight = 660;
  
  // Define width and height variables properly
  const width = visWidth;
  const height = visHeight;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create a tooltip div that is hidden by default
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc") 
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("opacity", 0)
    .style("z-index", "10");

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);
  
  // Create a group element
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("Immigration Status & Mental Health in Canada");
  
  // Get unique categories
  const immigrationStatuses = Object.keys(immigrationLabels)
  .filter(key => +key !== 9) // Filter out the "not stated" immigration group
  .map(Number);

  const mentalHealthLevels = Object.keys(mentalHealthLabels)
  .filter(key => +key !== 9) // Filter out the "not stated" mental health level
  .map(Number);
  
  // Create scales
  const xScale = d3.scaleBand()
    .domain(immigrationStatuses)
    .range([0, innerWidth])
    .padding(0.1);
    
  const yScale = d3.scaleBand()
    .domain(mentalHealthLevels)
    .range([innerHeight, 0])
    .padding(0.1);
    
  // Color scale
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([0, d3.max(overviewData, d => d.percentage)]);
  
  // Add x-axis with improved label positioning
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(d => immigrationLabels[d]))
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    // Increased translation and rotation angle for better spacing
    .attr("transform", "translate(-15,10)rotate(-60)")
    .style("text-anchor", "end");
    
  // Add y-axis with improved label positioning
  g.append("g")
    .call(d3.axisLeft(yScale).tickFormat(d => mentalHealthLabels[d]))
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("font-weight", "normal")
    // Adjusted label distance from axis
    .attr("dx", "-0.4em");

  // Add x-axis label with adjusted position to accommodate rotated labels
  g.append("text")
    .attr("x", innerWidth / 2)
    // Increased spacing below the x-axis
    .attr("y", innerHeight + 110)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Immigration Status");
    
  // Add y-axis label with adjusted position
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -75)  
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Mental Health Status");
  
  // Add heatmap cells with interactive tooltip
  g.selectAll("rect")
    .data(overviewData)
    .join("rect")
      .attr("x", d => xScale(d.immigrationStatus))
      .attr("y", d => yScale(d.mentalHealth))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.percentage))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // Show tooltip on mouseover
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        
        tooltip.html(`
          Immigration Status: ${immigrationLabels[d.immigrationStatus]}<br/>
          Mental Health: ${mentalHealthLabels[d.mentalHealth]}<br/>
          Count: ${d.count.toLocaleString()}<br/>
          Percentage: ${(d.percentage * 100).toFixed(2)}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
          
        // Highlight the current cell
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function() {
        // Hide tooltip on mouseout
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          
        // Remove highlight
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      });
  
  // Add a color legend
  const legendWidth = 20;
  const legendHeight = innerHeight / 2;
  
  // Adjusted legend position
  const legend = g.append("g")
    .attr("transform", `translate(${innerWidth + 30}, ${innerHeight/4})`);
    
  const legendAxis = d3.axisRight()
    .scale(d3.scaleLinear()
      .domain([0, d3.max(overviewData, d => d.percentage)])
      .range([legendHeight, 0]))
    .ticks(5)
    .tickFormat(d => `${(d * 100).toFixed(1)}%`);
  
  legend.append("g")
    .call(legendAxis)
    .attr("transform", `translate(${legendWidth}, 0)`);
    
  // Create color gradient for legend
  const defs = svg.append("defs");
  
  const gradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");
    
  // Generate gradient stops
  const numStops = 10;
  for (let i = 0; i <= numStops; i++) {
    const offset = i / numStops;
    const value = offset * d3.max(overviewData, d => d.percentage);
    gradient.append("stop")
      .attr("offset", `${offset * 100 }%`)
      .attr("stop-color", colorScale(value));
  }
  
  // Add the colored rectangle
  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");
    
  // Add legend title with adjusted position
  legend.append("text")
    .attr("x", 20)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Percentage");
  
  return svg.node();
}
```

<h3>1. Location</h3>

<h4>Choropleth Map</h4>

When presenting regional data, what’s more intuitive than seeing the country itself? Canada is vast, yet it consists of only 10 provinces and 3 territories, making it well-suited for a choropleth map. This approach allows us to present regional data in a way that is visually appealing, uncluttered, and easy to interpret at a glance.

Our map, inspired by the Canadian COVID-19 mental health map, uses a clean color scale and two dropdowns for filtering by immigration status and mental health levels. Hover tooltips provide exact percentages, adding detail without clutter.

We tested a zoom feature but removed it, as zooming felt unnecessary and distracting given the limited number of regions with available data. The final result is a simple yet powerful geospatial view of mental health across Canada. 

Though we considered grouping mental health levels for simplicity, we ultimately decided not to. Grouping can sometimes overlook important details, and how to group is a subjective judgment that might obscure nuances in the data. We chose to present the full range of self-rated mental health categories to maintain clarity and allow for a more granular interpretation.



```js
viewof immigrationStatusSelected = Inputs.select(
  new Map(
    Object.entries(immigrationLabels)
      .filter(([key, value]) => +key !== 9)
      .map(([key, value]) => [value, Number(key)])),
    { value: 1, label: "Immigration Status" }
);
```

```js
viewof mentalHealthSelected = Inputs.select(
  new Map(
    Object.entries(mentalHealthLabels)
      .filter(([key, value]) => +key !== 9)
      .map(([key, value]) => [value, Number(key)])), 
    { value: 4, label: "Mental Health" }
);
```

```js
{
  const margin = { top: 40, right: 90, bottom: 10, left: 60 };
  const visWidth = 800;
  const visHeight = 660;

  const provinceMap = new Map(
    [...canada.features.map(d => d.properties.name), "All"].map(name => [
      name,
      (name === "Nunavut" || name === "Northwest Territories")
        ? null
        : +canada_mental.find(d =>
            d.province === name &&
            +d.immigrant_flag === immigrationStatusSelected &&
            +d.mental_score === mentalHealthSelected
          )?.rate || 0
    ])
  );

  const rates = Array.from(provinceMap.values()); 
  
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
      .domain(d3.extent(rates)); 

  // Function to handle undefined values
  const getColor = (province) => {
      const percentage = provinceMap.get(province);
      return percentage == null ? "transparent" : colorScale(percentage);
  };

  // Create svg element
  const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${visWidth + margin.left + margin.right} ${visHeight + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMinYMin meet');

  // // Zoom effect
  // const zoom = d3.zoom()
  //   .scaleExtent([1, 3]) 
  //   .translateExtent([[0, 0], [visWidth + margin.left + margin.right, visHeight + margin.top + margin.bottom]])  
  //   .on("zoom", function(event) {
  //     map.attr("transform", event.transform);  
  //   });
  
  // svg.call(zoom); 
  
  svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "25px")
    .attr("font-weight", "bold")
    .text("Map of Canadian Self-rated Mental Health");

  svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 60)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .attr("font-size", "14px")
    .text("Mental Health by Region: Subtle East-West Variations for Non-Immigrants, No Clear Pattern for  Immigrants");

  // Legend
  svg.append("g")
    .attr("transform", "translate(660,90)")
    // .append(() => Legend(colorScale, {title: "Immigrant with Poor Mental Health Rate(%)", width: 260}));
    .append(() => Legend(colorScale, {title: `${immigrationLabels[immigrationStatusSelected]} with ${mentalHealthLabels[mentalHealthSelected]} Mental Health Rate (%)`, width: 260}));

    // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc") 
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("opacity", 0);
  
  const projection = d3.geoAlbers()
    .center([0, 60])  // Adjust the center to focus on Canada
    .rotate([98, 0])   // Rotate the map to fit Canada
    .parallels([29.5, 45.5])  // Set the parallels to match North America
    .scale(900) // Adjust the scale
    .translate([visWidth / 2, visHeight / 2 + margin.top + 10]);


  // Create a path generator
  const path = d3.geoPath().projection(projection);

  const map = svg.append('g')
  
  map.append('g')
    .selectAll("path")
    .data(canada.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => getColor(d.properties.name)) // Use getColor function
    .attr('opacity', 0.7)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('opacity', 1);
      const percentage = provinceMap.get(d.properties.name);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <strong>${d.properties.name}</strong><br/>
        ${percentage != null 
          ? `Immigration Status: ${immigrationLabels[immigrationStatusSelected]}<br/>
             Mental Health: ${mentalHealthLabels[mentalHealthSelected]}<br/>
             Percentage: ${percentage}%`
          : 'No data'}
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
        tooltip.transition().duration(300).style("opacity", 0);
      })
    

  // Add a circle indicating the overall info of Canada
  const canadaGroup = svg.append('g')
    .attr('transform', `translate(${margin.left * 2}, ${margin.top + 80})`) // Position group
    .attr('text-anchor', 'end'); // Align text to the right of its position

  let mapProvinceSelected = null;

  const canadaCircle = canadaGroup.append('circle')
    .attr('cx', 20)
    .attr('cy', 0)
    .attr('r', 20)
    .attr('fill', getColor('All'))
    .attr('opacity', 0.7)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <strong>Canada</strong><br/>
        Immigration Status: ${immigrationLabels[immigrationStatusSelected]}<br/>
        Percentage: ${provinceMap.get('All')}%
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr('opacity', 0.7);
      tooltip.transition().duration(300).style("opacity", 0);
    });

  
  // Append text to the left of the circle
  canadaGroup.append('text')
      .attr('x', -10) // Position text to the left of the circle
      .attr('y', 5) // Align vertically to the center
      .attr('font-size', '18px')
      .attr('fill', 'black') // Adjust color for contrast
      .attr('font-weight', 'bold')
      .text('Canada');

  return svg.node();
}

```

<h4>Icon Array</h4>

While the choropleth map allows for quick regional comparisons, it doesn’t show the distribution of mental health levels, nor does it directly compare immigrants and non-immigrants. That’s where our side-by-side icon arrays come in. Two dropdown menus let users select the province of interest, offering a localized view of the data for more focused comparisons. As some users tend to hover over the graph, we chose not to include tooltips on the icon arrays to avoid obstructing the view when they want to count the circles.

A bar chart could be a valid choice, but we ultimately chose icon arrays, as studies show that people interpret frequencies more intuitively than abstract percentages. Each circle represents 1 out of 100 individuals, making the data feel more tangible. Different colours indicate different mental health levels to display distribution and the contrast between groups.

We initially considered using human-shaped icons to create a more metaphorical connection. However, circles offered better clarity and flexibility. They’re natively supported in D3, can be easily colour-coded, and maintain a clean, consistent aesthetic that works well with our dataset and layout.

The colour scheme is a carefully chosen diverging palette, ranging from blue to green, yellow, red, and finally purple, designed to represent the full spectrum of self-rated mental health, from poor to excellent. Cooler tones (blue and green) evoke a sense of low energy or distress, while warmer tones (red and purple) suggest more positive or vibrant mental states. The palette is also colorblind-friendly to enhance accessibility. Additionally, light grey indicates respondents without self-rated mental health information, signalling uncertainty without introducing visual noise. All the graphs below follow this colour scheme for consistency and intuitive interpretation across the visualizations.



```js
viewof provinceSelected = Inputs.select(provinceLabels, { label: "Province" } );
```

```js
iconArray = {
  const margin = { top: 10, right: 20, bottom: 50, left: 60 };
  const visWidth = 800;
  const visHeight = 400;
  const iconSize = 30;
  const numColumns = 10;
  const totalIcons = 100;

  const immigrantGroups = Object.keys(immigrationLabels)
    .filter(key => +key !== 9) //Filter out the "not stated" immigration group
    .map(key => ({
      key: +key,
      data: canada_mental.filter(d => +d.immigrant_flag === +key && d.province === provinceSelected)
  }));

  const svg = d3.create('svg')
    .attr('viewBox', `0, 0, ${visWidth + margin.left + margin.right}, ${visHeight + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet'); // Optional, for responsive centering

  svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text(`Comparing Immigrant and Non-immigrant Mental Health in ${provinceSelected === 'All' ? 'Canada' : provinceSelected}`);

  svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 60)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .attr("font-size", "14px")
    .text("Each icon array consists of 100 circles and each circle represents 1 person.");

  immigrantGroups.forEach((group, idx) => {
    const groupContainer = svg.append('g')
      .attr('transform', `translate(${idx * visWidth / 2 + margin.left}, ${margin.top + 80})`);

    groupContainer.append('text')
      .attr('x', 150)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(immigrationLabels[group.key]);

    const iconsGroup = groupContainer.append('g')
      .attr('transform', `translate(0, 30)`);

    let iconsMap = group.data.flatMap(d =>
      Array.from({ length: Math.round(d.rate) }, () => ({ score: d.mental_score }))
    );

    const lastScore = iconsMap.length ? iconsMap[iconsMap.length - 1].score : 0;

    if (iconsMap.length > totalIcons) {
      iconsMap = iconsMap.slice(0, totalIcons);
    } else if (iconsMap.length < totalIcons) {
      iconsMap = iconsMap.concat(
        Array.from({ length: totalIcons - iconsMap.length }, () => ({ score: lastScore }))
      );
    }

    iconsGroup.selectAll('circle')
      .data(iconsMap)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => (i % numColumns) * iconSize + iconSize / 2)
      .attr('cy', (d, i) => Math.floor(i / numColumns) * iconSize + iconSize / 2)
      .attr('r', iconSize / 3)
      .attr('fill', d => iconColor(d.score))
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 5)
      .attr('opacity', 0.8);
  });

  // --- Legend ---
  const legend = svg.append('g')
    .attr('transform', `translate(${visWidth}, ${margin.top + 90})`);

  legend.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'start')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text("Mental Health Status");

  const legendItems = Object.entries(mentalHealthLabels).map(([score, label]) => ({
    color: iconColor(score),
    label
  }));

  const legendGroups = legend.selectAll('.legend-group')
    .data(legendItems)
    .enter()
    .append('g')
    .attr('class', 'legend-group')
    .attr('transform', (d, i) => `translate(10, ${i * 25 + 20})`);

  legendGroups.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', iconSize / 6)
    .attr('fill', d => d.color);

  legendGroups.append('text')
    .attr('x', 10)
    .attr('y', 4)
    .attr('font-size', '12px')
    .text(d => d.label);

  return svg.node();
}

```

<h3>2. Weather</h3>

<h4>Scatterplot</h4>

Weather was the first factor we selected, since Canada is very cold yet has many immigrants from warmer regions like China, India, and the Philippines. If we could find a connection between cold weather and mental health, it would be a great starting point to raise awareness about the need for additional support for immigrants.

During the EDA stage, we analyzed different temperature conditions, such as the number of days with maximum or minimum temperatures below certain thresholds per year, and found that coldness shows a consistent regional pattern across the country. We then narrowed our metric to "the number of days with maximum temperature below -10°C," which we believe marks a clear cutoff between warmth and cold.

We also examined various mental health levels, but they all showed a similar trend: coldness may not impact the mental health of either immigrants or non-immigrants as we initially assumed. In the final visualization, we chose to display only high self-rated mental health (combining “very good” and “excellent”) to keep things simple and avoid overwhelming users with too many filters, since all levels showed similar patterns.

Because the data points are discrete, we used a scatterplot with two colors to represent immigrants and non-immigrants. It’s simple, effective, and gets the message across. We use a tooltip to include detailed information without overcrowding the graph.

Although we didn’t find the expected relationship between climate and mental health, we’re still excited about the results and chose to keep this chart in our project. This finding suggests that other factors may play a more significant role in explaining regional disparities in mental health.

```js
scatterPlot2 = {
  const margin = { top: 50, right: 115, bottom: 60, left: 60 };
  const width = 800;
  const height = 400;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Does Regional Temperature Affect Mental Health?");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .attr("font-size", "14px")
    .text("Cold Climate May Have Limited Impact on Mental Health in Canada");

  const coldDaysMap = new Map(
    temperatureData
      .filter(d => d.province !== "Nunavut" && d.province !== "Northwest Territories")
      .map(d => [d.province, +d.total_days_below_minus_ten])
  );

  const allRates = d3.rollups(
    canada_mental.filter(d =>
      (d.mental_score === "3" || d.mental_score === "4") &&
      coldDaysMap.has(d.province)
    ),
    v => d3.sum(v, d => +d.rate),
    d => `${d.province}_${d.immigrant_flag}`
  );

  const data = allRates.map(([key, mentalRate]) => {
    const [province, immigrant_flag] = key.split("_");
    return {
      province,
      immigrant_flag,
      group: immigrant_flag === "1" ? "Immigrant" : "Non-immigrant",
      coldDays: coldDaysMap.get(province),
      mentalHealthRate: mentalRate
    };
  });

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.coldDays)).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    // .domain(d3.extent(data, d => d.mentalHealthRate)).nice()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top * 1.5]);

  const color = d3.scaleOrdinal()
    .domain(["Immigrant", "Non-immigrant"])
    .range([tableau10[0], tableau10[2]]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Days with Maximum Temperature Below -10°C Per Year");

  svg.append("g")
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

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc") 
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("opacity", 0);

  svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("cx", d => x(d.coldDays))
      .attr("cy", d => y(d.mentalHealthRate))
      .attr("r", 6)
      .attr("fill", d => color(d.group))
      // .attr("stroke", "#222")
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong>Province: ${d.province}</strong><br/>
          Immigration Status: ${d.group}<br/>
          Cold Days Per Year: ${d.coldDays.toFixed(1)} days<br/>
          High self-rated mental health: ${d.mentalHealthRate.toFixed(2)}%
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity", 0);
      });

  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right}, ${margin.top * 1.5})`);

  legend.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'start')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .text("Immigration Status");

  ["Immigrant", "Non-immigrant"].forEach((group, i) => {
    legend.append("circle")
      .attr("cx", 15)
      .attr("cy", i * 20 + 20)
      .attr("r", 4)
      .attr("fill", color(group));

    legend.append("text")
      .attr("x", 22)
      .attr("y", i * 20 + 23)
      .text(group)
      .attr("font-size", "10px")
      .attr("fill", "#333");
  });

  return svg.node();
}

```

<h4>Hexbin Map and Pie Chart</h4>

What if we used a map of Canadian weather to navigate mental health distribution? This interactive and engaging map allows users to explore the mental health of immigrants across Canada. Inspired by the Hexbin map in the D3.js Graph Gallery, we chose this stylized alternative to a traditional geographic map. Some provinces, like Prince Edward Island, are quite small and can be easily overlooked in standard maps. Meanwhile, the simple and recognizable layout of Canadian provinces makes Canada well-suited for a hexbin-style visualization. The text under the title and the pointer on hover act as hints for interaction.

Since we had already used an icon array, we wanted to explore other types of visualizations. We chose a pie chart, which is well-suited for showing proportions. With six mental health categories, the data is still within the effective range for pie charts. We included percentages inside the chart, along with tooltips for clarification, to enhance readability and make the distribution easy to interpret.

Although we already know that coldness may not significantly impact mental health, this interactive and engaging map still serves as a valuable complement to our regional data, allowing for more detailed exploration—and it could be utilized for other significant factors in the future.

```js
temperatureGraph = {
  // Hexagonal grid setup
  const margin = { top: 20, right: 20, bottom: 40, left: 20 }; // Increased the right margin for more space
  const visWidth = 800;
  const visHeight = 400;
  const hexRadius = 25;

  // Filter temperature data and exclude Nunavut and Northwest Territories
  const provinceTemperatureMap = new Map(
    temperatureData
      .filter(d => d.province !== "Nunavut" && d.province !== "Northwest Territories")  // Exclude unwanted provinces
      .map(d => [d.province, parseFloat(d.total_days_below_minus_ten)])  // Create map with temperature data
  );

  // Color scale based on total_days_below_minus_ten (temperature)
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain(d3.extent(Array.from(provinceTemperatureMap.values())));  // Use extent of temperature values for color scale

  // Define hexagonal grid layout properties
  const hexWidth = 2 * hexRadius;
  const hexHeight = Math.sqrt(3) * hexRadius;

  // Create the container SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, visWidth, visHeight]);
  
  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "1px solid #ccc") 
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("opacity", 0);

  // Add title text to the SVG
  svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text('Exploring Mental Health of Immigrants by Cold Temperature in Canada');
  
   svg.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#555")
    .text("Click a province to see immigrant mental health distribution");
  
  // Function to get color for a given province
  const getColor = (province) => {
    const daysBelowMinus10 = provinceTemperatureMap.get(province);
    return daysBelowMinus10 ? colorScale(daysBelowMinus10) : "transparent";
  };

  // Function to calculate the text color based on the background color brightness
  const getTextColor = (bgColor) => {
    const rgb = d3.color(bgColor);
    if (!rgb) return "#000";  // Fallback to black if color cannot be parsed

    // Calculate brightness using luminance formula
    const brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    return brightness < 140 ? "#fff" : "#000";  // Light text on dark background, dark text on light
  };

  const hexbinMap = svg.append('g');

  hexbinMap.append('text')
    .attr("x", visWidth / 3)
    .attr("y", 80)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text('Cold Weather by Province');

  hexbinMap.append("g")
    .attr("fill", "#ddd")
    .attr("stroke", "black")
    .selectAll("path")
    .data(canadaHexMap)  // Use your Canada map data
    .enter().append("path")
      .attr("transform", d => {
        const xOffset = (d.Y % 2 === 0) ? 0 : hexRadius;  // Staggered rows
        return `translate(${d.X * hexWidth + margin.left + xOffset}, ${d.Y * hexHeight + margin.top * 5})`;
      })
      .attr("d", d3.hexbin().hexagon(hexRadius))  // Create hexagons
      .attr("fill", d => getColor(d.Province))  // Apply color based on temperature data
      .attr("stroke", d => provinceTemperatureMap.has(d.Province) ? "black" : "transparent")
      .style("cursor", "pointer")  // Change cursor to pointer
      .on("click", (event, d) => {
        // When a hexagon is clicked, update the pie chart for the selected province
        updatePieChart(d.Province);
      })
      .on("mouseover", (event, d) => {
        const days = provinceTemperatureMap.get(d.Province)?.toFixed(0);
        d3.select(event.currentTarget)
          .attr('opacity', 1);
          tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`
            <strong>${d.Province}</strong><br/>
            ${days} days below -10°C per year
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
        tooltip.transition().duration(300).style("opacity", 0);
      })

  // Add text labels (Province Abbr) to each hexagon
  hexbinMap.append("g")
    .selectAll("text")
    .data(canadaHexMap)
    .enter().append("text")
      .attr("x", d => d.X * hexWidth + margin.left + ((d.Y % 2 === 0) ? 0 : hexRadius))  // Staggered X
      .attr("y", d => d.Y * hexHeight + margin.top * 5)  // Center Y
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("fill", d => {
        const color = getColor(d.Province);
        return getTextColor(color);  // Set text color based on background brightness
      })
      .style("font-size", "12px")
      .style("pointer-events", "none")  // Disable text selection and interactions
      .text(d => provinceTemperatureMap.has(d.Province) ? d.Abbr : "");  // Display abbreviation if temperature data exists

  // Add colour legend
  hexbinMap.append("g")
    .attr("transform", `translate(${margin.left * 4}, ${visHeight - margin.bottom * 2})`)
    .append(() => Legend(colorScale, { title: 'Number of Days with Maximum Temperature Below -10°C per Year', width: 150 }));

  // Function to update the pie chart based on the selected province
  const updatePieChart = (province) => {
    // Filter the mental health data by the selected province
    const daysBelowMinus10 = provinceTemperatureMap.get(province);
    
    const filteredData = canada_mental
      .filter(d => d.province === province && +d.immigrant_flag === 1)
      .map(d => ({
        mentalScore: d.mental_score,
        rate: +d.rate
      }));
  
    // Remove any existing pie chart (to prevent stacking multiple pie charts)
    svg.selectAll(".pieChart").remove();
  
    // Create and append the pie chart SVG element
    const pieChartSvg = createPieChart(filteredData, province, daysBelowMinus10);
  
    // Create a group to hold the pie chart and position it
    const pieChartGroup = svg.append("g")
      .attr("class", "pieChart")  // Add a class to target pie charts
      .attr("transform", `translate(${visWidth / 1.6}, ${margin.top * 3})`);  // Position it to the right
    // Append the pie chart inside the group
    pieChartGroup.node().appendChild(pieChartSvg);
  }
  updatePieChart("Alberta");
  
  // Return the SVG node
  return svg.node();
}

```

<h3>3. Sense of Belonging</h3>

<h4>Bar Chart</h4>

Another factor we explored is the sense of belonging to the local community. We chose grouped bar charts because position is the most effective encoding channel in data visualization, our data is categorical, and we wanted to group different levels of belonging to show how mental health levels vary within each group. By stacking two charts—one for immigrants and one for non-immigrants—users can make a side-by-side comparison and quickly spot differences between the two groups.

We initially designed a bar chart for immigrants with non-immigrants’ data overlaid as a line graph, where lines would appear based on the selected mental health level. However, we realized that this interaction-based design could hide key information and make it harder for users to compare across groups. To improve clarity and visibility, we switched to the current design of stacked grouped bar charts, where all data is displayed up front.

A radio button at the top of the chart allows users to filter by levels of sense of belonging, ordered from very weak to very strong, matching the order shown in the chart. This design supports a storytelling flow, guiding users through changes in mental health distribution as the sense of belonging strengthens. Tooltips help viewers to gain detailed information. A text annotation highlights a notable insight: a very strong sense of community appears to benefit immigrants more than non-immigrants—this quickly draws attention to one of the key messages of the visualization.

```js
viewof belongingSelected = Inputs.radio(
  [...Object.keys(senseOfBelongingLabels).sort((a, b) => b - a), "All"],
  {
    label: "Sense of Belonging",
    format: d => d === "All" ? "All" : senseOfBelongingLabels[d],
    value: "All"
  }
)
```

```js
{
  const margin = {top: 30, right: 40, bottom: 100, left: 70};
  const width = 800;
  const height = 500; // Increased height to accommodate both charts
  
  // Filter immigrant and non-immigrant data
  const immigrantData = filteredBelonging.filter(d => d.immigrationStatus === 1);
  const nonImmigrantData = filteredBelonging.filter(d => d.immigrationStatus === 2);
  
  // Prepare the scales for positional and color encodings.
  const fx = d3.scaleBand()
      .domain(Array.from(new Set(filteredBelonging.map(d => d.senseOfBelonging))).reverse())
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);
  
  // Define mental health categories
  const mentals = new Set(filteredBelonging.map(d => d.mentalHealthStatus));
  
  const x = d3.scaleBand()
      .domain(mentals)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);
  
  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
  
  // Append a title for the entire chart
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "20px")
      .text("How Community Belonging Affects Mental Health")

    svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top * 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#555")
    .text("Stronger Sense of Belonging Appears More Beneficial for Immigrants’ Mental Health Than for Non-Immigrants");

    // Add shared y-axis label
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -((height + margin.top) / 2)) // center vertically across both charts
      .attr("y", margin.left / 2) // offset from left edge dynamically
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Percentage of Self-rated Mental Health Levels (%)");

    // ---Text annoation---
  const yImmigrant = d3.scaleLinear()
    .domain([0, d3.max(filteredBelonging, d => d.percentage)]).nice()
    .rangeRound([height / 2 - margin.bottom, margin.top]);
  
  // Find the target bar
  const target = immigrantData.find(d =>
    d.senseOfBelonging === 1 &&
    d.mentalHealthStatus === 4
  );
  
  if (target) {
    const barGroupX = fx(target.senseOfBelonging);
    const barX = barGroupX + x(target.mentalHealthStatus) + x.bandwidth() / 2;
    const barTopY = yImmigrant(target.percentage) + margin.top + 53;

  // Label text just above the bar
  const labelY = barTopY - 20;

  // Add the label
  svg.append("text")
    .attr("x", barX)
    .attr("y", labelY)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("significantly higher")
    .attr("opacity", d => belongingSelected === "All" || +belongingSelected === 1? 1 : 0.2)

  // Add pointer line
  svg.append("line")
    .attr("x1", barX)
    .attr("x2", barX)
    .attr("y1", labelY + 4) // start slightly below the text
    .attr("y2", barTopY - 1) // end just above the bar
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("marker-end", "url(#arrow)")
    .attr("opacity", d => belongingSelected === "All" || +belongingSelected === 1? 1 : 0.2)

  // Define arrowhead marker
  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "black");
  }

  // Function to create each chart (immigrant or non-immigrant)
  function createBarChart(data, offsetY, immigrationStatusLabel) {
      // Define Y scale for the specific chart
      const y = d3.scaleLinear()
          .domain([0, d3.max(filteredBelonging, d => d.percentage)]).nice()
          .rangeRound([height / 2 - margin.bottom, margin.top]);

        // Append tooltips
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "white")
        .style("color", "black")
        .style("border", "1px solid #ccc") 
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0);
  
      // Create a group for each senseOfBelonging (State)
      svg.append("g")
          .selectAll()
          .data(d3.group(data, d => d.senseOfBelonging))
          .join("g")
          .attr("transform", ([senseOfBelonging]) => `translate(${fx(senseOfBelonging)},${offsetY})`)
          .selectAll("rect")
          .data(([, d]) => d)
          .join("rect")
          .attr("x", d => x(d.mentalHealthStatus))
          .attr("y", d => y(d.percentage))
          .attr("width", x.bandwidth())
          .attr("height", d => y(0) - y(d.percentage))
          .attr("fill", d => iconColor(d.mentalHealthStatus)) // Use existing iconColor scale
          .attr("opacity", d => belongingSelected === "All" || +belongingSelected === +d.senseOfBelonging ? 1               : 0.2)
          .on("mouseover", (event, d) => {
            d3.select(this)
              tooltip.transition().duration(200).style('opacity', 1);
                    tooltip.html(`
                <strong>${immigrationStatusLabel}</strong><br/>
                ------<br/>
                Sense of Beloning: ${senseOfBelongingLabels[d.senseOfBelonging]}<br/>
                Percentage: ${d.percentage}%
              `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("opacity", 
                    d => belongingSelected === "All" || +belongingSelected ===  +d.senseOfBelonging ? 1: 0.2);
            tooltip.transition().duration(300).style("opacity", 0);
          })
    

      // Append the x-axis for sense of belonging
      svg.append("g")
          .attr("transform", `translate(0,${offsetY + height / 2 - margin.bottom})`)
          .call(d3.axisBottom(fx).tickFormat(d => senseOfBelongingLabels[d]).tickSizeOuter(0))
          .call(g => g.selectAll(".domain").remove());
    
      if (immigrationStatusLabel === "Non-Immigrants") {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", offsetY + height / 2 - margin.bottom + 40) // slightly below the axis
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Sense of Belonging to the Local Community");
    }
    
      // Append the y-axis for percentage
      svg.append("g")
          .attr("transform", `translate(${margin.left},${offsetY})`)
          .call(d3.axisLeft(y).ticks(null, "s"))
          .call(g => g.selectAll(".domain").remove());
  
      // Append a label to differentiate between immigrant and non-immigrant
      svg.append("text")
          .attr("x", width / 2)
          .attr("y", offsetY + margin.top)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(immigrationStatusLabel);
  }
  
  // Create the immigrant chart at the top
  createBarChart(immigrantData, margin.top + 55, "Immigrants");
  
  // Create the non-immigrant chart below it
  createBarChart(nonImmigrantData, margin.top + height / 2, "Non-Immigrants");
  
    // --- Legend ---
  // Create the legend using swatches
  const legend = swatches({
    color: d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range([tableau10[0], tableau10[1], tableau10[2], tableau10[3], tableau10[4]]),
    label: "Mental Health Status",
    columns: 1,
    format: d => mentalHealthLabels[d]
  });
  
  // Create a wrapper container for the chart and legend
  const container = html`<div style="display: flex; align-items: flex-start; gap: 20px;"></div>`;
  
  // Create the title for the legend
  const legendTitle = html`<div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">Mental      Health</div>`;
  
  // Create a legend container with the title and the legend itself
  const legendContainer 
    = html`<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0px;"></div>`;
  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(legend);
  
  // Adjust the marginTop to move the legend further down
  legendContainer.style.marginTop = "20px"; // Adjust this value to move the legend further down
  
  // Add the chart SVG to the container
  container.appendChild(svg.node());
  container.appendChild(legendContainer);
  
  // Return the final container
  return container;

}
```

```html
<h3>4. Age</h3>
```

<h4>Bubble Chart</h4>

This bubble chart maps age, immigration status, and mental health levels together, showing percentages within each immigrant group through bubble size. It shows patterns across age cohorts that would be obscured in tabular formats. For instance, users could immediately see that young immigrants report better mental health than non-immigrants (green circle is greater than orange circle). 

The interactive design facilitates discovery through user-led exploration. Users can hover over overlapping bubbles to get more information. We also included a "Filter by Group" feature, which allows users to do more focused analysis of specific immigration subgroups, transforming complex data relationships into accessible insights. Our implementation of trend lines connecting average mental health scores across age groups introduces a temporal dimension that illustrates divergent trajectories between populations. These reveal a compelling pattern: immigrants begin with higher average scores (3.11 vs. 2.97) in the youngest cohort, experience lower scores in middle age, and eventually converge with non-immigrants in the oldest age group (2.95), while non-immigrants maintain relatively stable mental health throughout life. 

Through our design, we considered alternative approaches such as stacked bar charts and geographic mapping but determined they would obscure the multidimensional relationships present in the data. The chosen implementation balances depth and clarity that highlights key insights about mental health patterns across age and immigration status.

```js
BubbleChart = {
  // Set up dimensions
  const width = 800;
  const height = 500;
  const margin = {top: 80, right: 350, bottom: 120, left: 250};
  
  // Create SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("style", "max-width: 100%; height: auto;");
    
  // Add title
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .text("Mental Health Status by Age Group and Immigration Status");
  
  // Create main group element
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Extract data from the processed data cell
  const { bubbleData, avgData } = ageData;

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0.5, 5.5])
    .range([0, width]);
    
  const yScale = d3.scaleLinear()
    .domain([0, 4.5])
    .range([height, 0]);
    
  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(bubbleData, d => d.percentage) || 0.1]) // Add fallback value
    .range([3, 25]);
    
  // Color scale using Tableau10
  const colorScale = d3.scaleOrdinal()
    .domain([1, 2, 9]) // Including "Not stated" category
    .range([tableau10[0], tableau10[2], tableau10[5]]); 
    
  // Create x-axis
  const xAxis = d3.axisBottom(xScale)
    .tickValues([1, 2, 3, 4, 5])
    .tickFormat(d => ageLabels[d]);
    
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("transform", "rotate(-45)")
    .attr("y", 15)
    .attr("x", -5)
    .attr("text-anchor", "end");
    
  // Create y-axis
  const yAxis = d3.axisLeft(yScale)
    .tickValues([0, 1, 2, 3, 4])
    .tickFormat(d => mentalHealthLabels[d]);
    
  g.append("g")
    .call(yAxis)
    .selectAll("text")
    .attr("font-size", "12px");
    
  // Add axes titles
  g.append("text")
    .attr("x", width/ 2)
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
    
  // Add subtitle
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .text("Bubble size represents percentage of respondents");
    
  // Create trend lines
  const lineGenerator = d3.line()
    .x(d => xScale(d.age))
    .y(d => yScale(d.avgScore))
    .curve(d3.curveBasis);
    
  const immGroups = d3.group(avgData, d => d.immigration);
  
  // Add legend
  const legendG = g.append("g")
    .attr("transform", `translate(${width + 20}, 10)`);
    
  // Immigration status legend
  legendG.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-weight", "bold")
    .text("Immigration Status");
    
  // Get unique immigration status values from data (for more robust legend)
  const uniqueImmValues = Array.from(new Set(bubbleData.map(d => d.immigration))).sort((a, b) => a - b);
  
  const legendImm = legendG.selectAll(".legend-imm")
    .data(uniqueImmValues)
    .enter()
    .append("g")
    .attr("class", "legend-imm")
    .attr("transform", (d, i) => `translate(0, ${i * 25 + 10})`);
    
  legendImm.append("circle")
    .attr("r", 6)
    .attr("fill", d => colorScale(d));
    
  legendImm.append("text")
    .attr("x", 15)
    .attr("y", 4)
    .text(d => immigrationLabels[d]);
    
  // Fix overlapping legends by repositioning size legend
  // Size legend moved down to avoid overlap with trend line legend
  const maxPercentage = d3.max(bubbleData, d => d.percentage) || 1;
  const sizeLegendData = [
    maxPercentage * 0.1,
    maxPercentage * 0.3,
    maxPercentage * 0.6
  ].sort((a, b) => a - b);
  
  // Calculate proper offset based on number of immigration categories
  const trendLegendOffset = 100 + (uniqueImmValues.length * 5);
// Create a trend lines legend
const trendLegendG = g.append("g")
  .attr("transform", `translate(${width + 20}, ${trendLegendOffset})`);

trendLegendG.append("text")
  .attr("x", 0)
  .attr("y", -10) // Reduced gap from title to first legend item
  .attr("font-weight", "bold")
  .text("Trend Lines");
  
// Draw the trend lines and add to legend
// Only add trend lines for immigration values 1 and 2 (not for "Not stated")
const trendLineValues = uniqueImmValues.filter(val => val !== 9);
let trendLineCount = 0;

immGroups.forEach((immData, immStatus) => {
  // Skip "Not stated" category for trend lines if present
  if (Number(immStatus) === 9) return;
  
  // Sort by age
  const sortedData = [...immData].sort((a, b) => a.age - b.age);
  
  g.append("path")
    .datum(sortedData)
    .attr("fill", "none")
    .attr("stroke", colorScale(Number(immStatus)))
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", Number(immStatus) === 1 ? "5,5" : "none")
    .attr("d", lineGenerator);
    
  // Add trend line to legend - start items closer to the title
  trendLegendG.append("line")
    .attr("x1", 0)
    .attr("y1", trendLineCount * 25 + 5) // Adjusted y-position to start closer to title
    .attr("x2", 15)
    .attr("y2", trendLineCount * 25 + 5) // Keep same y-position
    .attr("stroke", colorScale(Number(immStatus)))
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", Number(immStatus) === 1 ? "5,5" : "none");
    
  trendLegendG.append("text")
    .attr("x", 40)
    .attr("y", trendLineCount * 25 + 10) // Adjusted to match new line positions
    .attr("fill", colorScale(Number(immStatus)))
    .text(`Avg. Mental Health - ${immigrationLabels[immStatus]}`);
    
  trendLineCount++;
});  

  // Calculate size legend offset based on trend legend position and height
  const sizeLegendOffset = trendLegendOffset + (trendLineCount * 30) + 20;
  
  const sizeLegendG = g.append("g")
    .attr("transform", `translate(${width + 20}, ${sizeLegendOffset})`);
    
  sizeLegendG.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-weight", "bold")
    .text("Percentage (%)");
  
  const sizeLegend = sizeLegendG.selectAll(".legend-size")
    .data(sizeLegendData)
    .enter()
    .append("g")
    .attr("class", "legend-size")
    .attr("transform", (d, i) => `translate(0, ${i * 40 + 20})`);
    
  sizeLegend.append("circle")
    .attr("r", d => radiusScale(d))
    .attr("fill", "rgba(100, 100, 100, 0.1)")
    .attr("stroke", "#666")
    .attr("stroke-width", 1);
    
  sizeLegend.append("text")
    .attr("x", d => radiusScale(d) + 10)
    .attr("y", d => radiusScale(d) > 15 ? 0 : 4)
    .text(d => d.toFixed(1) + "%");

  // Create DIV tooltip
  const tooltip = d3.create("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("box-shadow", "0 2px 10px rgba(0,0,0,0.1)")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("z-index", "1000");
  
  document.body.appendChild(tooltip.node());
  
  // Group data by age and mental health
  const positionGroups = d3.group(bubbleData, d => `${d.age}-${d.mentalHealth}`);
  
  // Create a separate container for all bubbles
  const bubbleLayer = g.append("g").attr("class", "bubbles");
  
  // Create invisibile interaction rectangles for all grid positions
  const gridInteractions = g.append("g").attr("class", "grid-interactions");
  
  // Create rectangles for each grid position
  positionGroups.forEach((bubblesAtPosition, positionKey) => {
    const [age, mentalHealth] = positionKey.split('-').map(Number);
    
    // Create all bubbles at this position
    // Smallest to largest (to ensure largest are behind)
    const sortedBubbles = [...bubblesAtPosition].sort((a, b) => b.percentage - a.percentage);
    
    // Create the bubbles
    sortedBubbles.forEach(d => {
      bubbleLayer.append("circle")
        .datum(d)
        .attr("class", `bubble bubble-imm-${d.immigration}`)
        .attr("cx", xScale(d.age))
        .attr("cy", yScale(d.mentalHealth))
        .attr("r", 0)
        .attr("fill", d3.color(colorScale(d.immigration)).copy({opacity: 1}))
        .attr("stroke", colorScale(d.immigration))
        .attr("stroke-width", 1.5);
    });
    
    // Create an invisible interaction rectangle for this grid position
    const rectWidth = (width / 5) * 0.8;  // Divide by 5 age groups, with some margin
    const rectHeight = (height / 5) * 0.8; // Divide by 5 mental health levels, with margin
    
    gridInteractions.append("rect")
      .attr("x", xScale(age) - rectWidth / 2)
      .attr("y", yScale(mentalHealth) - rectHeight / 2)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Show details for current position
        showPositionDetails(age, mentalHealth, bubblesAtPosition);
      })
      .on("mouseout", function() {
        // Hide details and tooltip
        hidePositionDetails();
      });
  });
  
  // Animate bubbles
  bubbleLayer.selectAll("circle.bubble")
    .transition()
    .duration(500)
    .attr("r", d => radiusScale(d.percentage));
  
  // Variable to track the currently selected grid position
  let currentHighlightedPosition = null;
  
  // Function to show details for a position
  function showPositionDetails(age, mentalHealth, bubblesAtPosition) {
    currentHighlightedPosition = `${age}-${mentalHealth}`;
    
    // Generate tooltip content for all bubbles at this position
    let tooltipHTML = `
      <div style="font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 8px; padding-bottom: 5px;">
        <div>Age Group: ${ageLabels[age]}</div>
        <div>Mental Health: ${mentalHealthLabels[mentalHealth]}</div>
      </div>
    `;
    
    // Add details for each immigration status
    for (const bubble of bubblesAtPosition) {
      tooltipHTML += `
        <div style="margin-top: 8px; padding-top: 5px; ${bubblesAtPosition.length > 1 ? 'border-top: 1px dashed #eee;' : ''}">
          <div style="font-weight: bold; color: ${colorScale(bubble.immigration)};">
            ${immigrationLabels[bubble.immigration]}
          </div>
          <div><strong>Count:</strong> ${bubble.count}</div>
          <div><strong>Percentage:</strong> ${(bubble.percentage).toFixed(2)}%</div>
        </div>
      `;
    }
    
    // Show tooltip
    tooltip
      .style("display", "block")
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 28}px`)
      .html(tooltipHTML);
    
    // Highlight all bubbles at this position
    bubbleLayer.selectAll("circle.bubble")
      .style("opacity", d => (d.age === age && d.mentalHealth === mentalHealth) ? 1 : 0.3);
  }
  
  // Function to hide details
  function hidePositionDetails() {
    currentHighlightedPosition = null;
    
    // Hide tooltip
    tooltip.style("display", "none");
    
    // Restore all bubbles
    bubbleLayer.selectAll("circle.bubble")
      .style("opacity", 1);
  }
  
  // Add interaction helper text
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#666")
    .text("Hover over a position to see all immigration groups");

  // Add interaction helper text
  g.append("text")
    .attr("x", width / 2)
    .attr("y", 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#666")
    .text("Sub-group Details by Immigration Status (Click Legend Items to Filter)");
  
  // Listen for mousemove to update tooltip position
  svg.node().addEventListener("mousemove", function(event) {
    if (tooltip.style("display") !== "none") {
      tooltip
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY - 28}px`);
    }
  });
  
  // Add immigration controls for filtering (optional)
  const filterControlG = g.append("g")
    .attr("transform", `translate(${width + 20}, ${sizeLegendOffset + 170})`);
    
  filterControlG.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-weight", "bold")
    .text("Filter By Group");
  
  const filterControls = filterControlG.selectAll(".filter-control")
    .data([...uniqueImmValues, -1]) // Add "All" option
    .enter()
    .append("g")
    .attr("class", "filter-control")
    .attr("transform", (d, i) => `translate(0, ${i * 25 + 10})`)
    .style("cursor", "pointer")
    .on("click", function(event, d) {
      // Update active state
      filterControls.select("circle")
        .attr("fill", "white")
        .attr("stroke-width", 1);
        
      d3.select(this).select("circle")
        .attr("fill", d === -1 ? "#999" : colorScale(d))
        .attr("stroke-width", 2);
      
      // Filter bubbles
      if (d === -1) {
        // Show all
        bubbleLayer.selectAll("circle.bubble").style("display", null);
      } else {
        // Show only selected
        bubbleLayer.selectAll("circle.bubble")
          .style("display", b => b.immigration === d ? null : "none");
      }
    });
    
  filterControls.append("circle")
    .attr("r", 6)
    .attr("fill", d => d === -1 ? "#999" : "white") // Active for "All" by default
    .attr("stroke", d => d === -1 ? "#999" : colorScale(d))
    .attr("stroke-width", d => d === -1 ? 2 : 1);
    
  filterControls.append("text")
    .attr("x", 15)
    .attr("y", 4)
    .text(d => d === -1 ? "All Groups" : immigrationLabels[d]);
  
  // Return the completed SVG
  return Object.assign(svg.node(), {
    // Return the tooltip as a property to allow cleanup later
    tooltip: tooltip.node()
  });
}
```

```html
<h3>5. Household Incoem and Education Level</h3>
```

<h4>Sankey Chart</h4>

Social and economic factors are often discussed in relation to one another. For example, there's a common perception that higher education leads to higher income, which in turn results in better mental health outcomes. To explore these interconnected relationships, we chose to implement a Sankey diagram that allows users to visualize how these multiple factors interact with each other, and importantly, how these patterns may differ between immigrant and non-immigrant populations.
Sankey diagrams work particularly well for this purpose because they are excellent at revealing complex relationships between multiple variables simultaneously. While traditional visualization methods like bar charts or scatter plots can effectively show relationships between two variables, they struggle to capture the multi-dimensional nature of these socioeconomic interconnections.Users can explore questions like: "Are there education levels that strongly correlate with positive mental health outcomes regardless of income?" or "Do certain income brackets show surprising mental health patterns that contradict general trends?" These insights are much harder to extract from traditional graph types. Our interactive Sankey visualization addresses this limitation by allowing users to trace how individuals flow through different combinations of education levels, income brackets, and mental health outcomes, making it easier to identify patterns that might otherwise remain hidden in the data.

Our interactive filter that allows users to switch between immigrant, non-immigrant, and combined population data. This functionality enables nuanced exploration of how life trajectories and outcomes may differ between these groups. Users can investigate questions like:  
- Whether education translates to income equivalently for immigrant and non-immigrant populations
- If mental health outcomes follow different patterns based on immigration status

By toggling between these views, users can immediately see which pathways strengthen or weaken when comparing populations, makeing it more of a user-led experience

<h4> User Instruction: Interactive Sankey Diagram</h4>

This Sankey diagram allows you to explore relationships between variables:

1. <b>Mental Health</b>: Perceived mental health status, from Poor to Excellent
2. <b>Education Level</b>: Highest level of education in household
3. <b>Household Income</b>: Total household income range

Select your source, target, and the middle variable using the dropdown menus above.
- The width of each link represents the number of records flowing between categories


```js
viewof dataType = Inputs.select(
  [
    {id: "all", name: "All Data"},
    {id: "immigrant", name: "Immigrant Only"},
    {id: "nonImmigrant", name: "Non-Immigrant Only"}
  ],
  {
    value: {id: "all", name: "All Data"},
    label: "Immigration Status:",
    format: x => x.name
  }
)
```

```js
viewof sourceVar = Inputs.select(
  variables.filter(v => v.id !== "GENDVMHI"), 
  {
    value: variables.find(v => v.id === "INCDGHH"), 
    label: "Source Variable:",
    format: x => x.name
  }
)
```

```js
viewof includeMiddle = Inputs.checkbox(["Include intermediate variable"], {label: "Add Intermediate:"})
```

```js
viewof middleVar = Inputs.select(
  variables.filter(v => v.id !== sourceVar.id && v.id !== targetVar.id),
  {
    value: variables.find(v => v.id !== sourceVar.id && v.id !== targetVar.id),
    label: "Middle Variable:",
    format: x => x.name
  }
)
```

```js
sankeyChart = {
  // Set up basic chart dimensions
  const width = 900;
  const height = 600;
  
  // Create the SVG container
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("font", "10px sans-serif");
  
  // Create the sankey generator
  const sankey = d3Sankey.sankey()
    .nodeId(d => d.id)
    .nodeAlign(d3Sankey.sankeyJustify)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 50], [width - 1, height - 5]]); 
  
  // Generate the sankey data
  const {nodes, links} = sankey({
    nodes: sankeyData.nodes.map(d => Object.assign({}, d)),
    links: sankeyData.links.map(d => Object.assign({}, d))
  });
  
  // Draw the links
  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .join("g")
    .attr("stroke", d => colors[d.source.category]);
  
  // Create path elements for links
  const linkPath = link.append("path")
    .attr("d", d3Sankey.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1, d.width));
  
  // Add tooltips to links - separate step to ensure proper attachment
  linkPath.append("title")
    .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);
  
  // Draw the nodes
  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
  // Add node rectangles
  const nodeRect = node.append("rect")
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => colors[d.category])
    .attr("opacity", 0.8);
  
  // Add tooltips to nodes - separate step to ensure proper attachment
  nodeRect.append("title")
    .text(d => `${d.name}\n${d.value}`);
  
  // Add node labels
  node.append("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 - d.x0 + 6 : -6)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d => d.name)
    .style("font-size", "12px");
  
  // Add title
  let title = `${sourceVar.name} → ${targetVar.name}`;
  if (includeMiddle.length) {
    title = `${sourceVar.name} → ${middleVar.name} → ${targetVar.name}`;
  }
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text(`Sankey Diagram: ${title}`);
  
  return svg.node();
}
```

<h2>Development Journey</h2>
<space></space>
<h4>Project Evolution and Development Cycle</h4>

Throughout the project, we followed an iterative and collaborative development process. After reviewing the dataset documentation and aligning on a research question, we held a meeting to brainstorm ideas and settle on a project design. We defined our goals, identified areas for exploration, and listed possible charts to create. After receiving feedback from the instructor, we revised our outline to ensure it was feasible within our timeline and scope. We eventually focused on four main areas: regional climate conditions, age of landing, work activity, and other influencing factors.

The development process was far from linear. It was iterative — we would select a factor, process the data, uncover unexpected issues, then regroup and pivot. Our graphs — and even the factors we explored — evolved as the project progressed, but our main goal stayed consistent. For example, we initially thought that the age of landing was a promising factor to explore. However, after diving deeper into the dataset, we realized that it didn’t include the current age or the number of years since arrival, so we couldn’t make the calculations we had hoped to. We shifted our focus to broader age groups instead.

We also reconsidered some design decisions along the way. Initially, we planned to use the choropleth map as an interactive navigation tool. However, due to Observable Notebook's limitations and the small size of some provinces, we found it more effective as a standalone visualization of regional mental health disparities. Similarly, we had intended to pair the map with dynamic icon arrays, but we decided to separate them into distinct visualizations to avoid a cluttered layout.

<h4>Task Distribution</h4>

Due to our different schedules, we structured the project to allow for independent work. We divided the charts and associated data processing tasks between us, and each teammate took ownership of their visualizations from start to finish. We regularly shared progress when necessary to make high-level decisions and review each other’s work. Although we worked asynchronously most of the time, we maintained consistent communication to ensure a coherent narrative and visual style across the project.

<h4>Challenges</h4>

Several technical and design challenges emerged along the way. One example was the icon array: we initially wanted to use human-shaped SVGs to represent respondents more metaphorically. However, D3 does not allow dynamic coloring of complex imported SVGs in the same way it handles simple shapes like circles or rectangles. We tried uploading SVGs with different colours, but Observable only allowed referencing SVGs through HTTP links in our case. We eventually opted for simple colored circles to retain clarity and consistency.
Another challenge was that some visual decisions — like layout and interactivity — required extensive iteration. D3 offered great flexibility, but small changes sometimes required significant rework. Looking back, we realized that using tools like Vega-Lite for early pattern detection might have accelerated our early exploration.

<h4>Tools Employed</h4>

- Python: data processing;
- D3.js in Observable Notebook: data processing, visualization implementation;
- Google Docs: project plan and outline sharing;
- Teams and Wechat: virtual meetings, ongoing communication;
- Zoom: presentation recording;
- ChatGPT: unfamiliar syntax clarification, troubleshooting.

<h4>Time Allocation</h4>

We did not formally log our time, but we can estimate the following breakdown based on our experience:
- Research and Planning (~10%)
- Data Processing (~20%)
- Visualization Implementation (~60%)
- Presentation and Write-up (~10%)


<h2>Feedback Incorporation</h2>
Several valuable themes emerged from the critiques of our visualization, which we addressed in our final version:

<h4>Legend Clarity</h4>

In our beta version, the legends in the overview and bubble charts were overlapping, making them difficult to read. We've resolved this issue by properly spacing and positioning the legends, ensuring they are clearly visible and don't interfere with the visualization elements.

<h4>Narrative Clarity</h4>

Feedback indicated that it was challenging for viewers to understand what story our visualizations were trying to tell. To address this, we added contextual comments directly in the charts:
- For the map visualization: "Mental Health by Region: Subtle East-West Variation for Non-Immigrants, No clear pattern for Immigrants"
- For the bar chart showing community belonging: "Stronger Sense of Belonging Appears More Beneficial for Immigrants' Mental Health than for Non-Immigrants"

<h4>Bubble Chart Complexity</h4>

We received feedback that the bubble chart combined too many elements (size variations and trendlines), making it difficult to discern the main takeaway. Chen decided not to simplify this visualization, as the project's primary goal is to provide a user-led exploratory experience. Instead, Chen added explanatory comments in the write-up to guide users. Our philosophy is that it's acceptable for users to click around and discover information at their own pace, aligning with our vision of creating an exploratory visualization portfolio rather than a guided narrative.

<h4>Bar Chart Confusion</h4>

Some feedback indicated confusion about the data and patterns in our original bar chart, as well as a misunderstanding of what the chart represented. To address this, we redesigned it into two stacked bar charts — one for immigrants and one for non-immigrants — for clearer comparison. We also replaced the interactive legend with radio buttons, which offer a more intuitive way to explore the data and guide user interaction more effectively.

<h4>Color Accessibility</h4>

Another theme of feedback was on our color palette, which was not friendly enough with color blindness. We've adjusted our color scheme to be more accessible, ensuring that our visualizations can be effectively interpreted by a wider audience, including those with various forms of color vision deficiency.

<h4>Grouping of Mental Health Levels</h4>

During our presentation, we asked whether grouping mental health levels would improve clarity. Some viewers responded positively to the idea. After discussion, we decided to keep the full range of levels in most visualizations to preserve detail and avoid subjective grouping that might obscure patterns — especially since our project is exploratory. However, in our newly designed scatterplot, we did apply grouping to highlight overall trends more clearly, where simplification served the purpose better.

The peer review process was incredibly helpful for our project. After staring at our own visualizations for weeks, we'd become blind to some obvious issues that our classmates spotted right away. Their fresh perspectives pointed out problems we simply hadn't seen, especially around accessibility and how clearly our message was coming across. We found the specific feedback about fixing the overlapping legends and updating our color choices for colorblind users particularly useful - these were straightforward fixes that made a big difference in the final product. Some reviewers also mentioned they weren't sure what to focus on in certain visualizations, which led us to add those explanatory comments to guide viewers. Working through these critiques definitely improved our final portfolio and reminded us how important it is to get outside perspectives.

<h2>Final Thoughts</h2>

Through this project, we gained valuable hands-on experience applying visualization techniques learned in class while exploring new visualization types. Working with Canadian health data gave us the opportunity to think deeply about design rationale from a designer's perspective, considering everything from color choices to narrative clarity.

We both enjoyed pushing beyond the basic charts we relied on before taking this course. Prior to this class, we might have defaulted to simple scatterplots and bar charts - straightforward options that, while useful, don't fully showcase the power of data visualization. Implementing interactive maps, hexagon maps and sankey charts, and thoughtfully designed comparison views challenged us to think more creatively about how to communicate complex relationships in our data.

The project also reinforced the importance of iterative design based on user feedback. Seeing how our peers interpreted (or sometimes misinterpreted) our visualizations provided concrete examples of where our design choices succeeded or failed to communicate effectively.

In the future, we might approach similar projects differently in several ways:

- Begin with simpler visualizations and gradually add complexity, rather than starting with ambitious multi-variable displays
- Consider accessibility requirements from the beginning of the design process, rather than retrofitting for colorblindness and other needs
- Spend more time on the narrative structure and guiding text elements to balance our goal of exploration with providing clear entry points for users
- Allocate more time for the technical implementation of interactive elements, as these required more development effort than initially anticipated

Last but not least, working as a team is one of the highlights of this project. Our collaboration was remarkably smooth, which we attribute to our effective communication and complementary working styles. We created a balanced partnership that played to our individual strengths. This division of responsibilities allowed us to work efficiently without duplicating efforts or missing important elements. Our regular check-ins kept us aligned on goals while giving each other the space to explore creative solutions within our areas of focus. This positive group experience has shown us how effective teamwork can significantly enhance both the process and outcome of visualization projects.

<h2>Acknowledgements</h2>

<h3>Data Resources</h3>
1. Canadian Community Health Survey: Public Use Microdata File:
https://www150.statcan.gc.ca/n1/pub/82m0013x/82m0013x2024001-eng.htm

2. Canadian Climate Normals (1991 - 2020):
https://climate.weather.gc.ca/climate_normals/index_e.html

3. Canada Map GeoJSON:  
https://simplemaps.com/gis/country/ca

<h3>Inspirations and References</h3>
1. Canadian COVID-19 mental health map:
https://health-infobase.canada.ca/covid-19/mental-health/

2. U.S. state choropleth: https://observablehq.com/@d3/us-state-choropleth/2

3. Icon Array:
https://observablehq.com/@tomgp/untitled

4. Pie Chart:
https://observablehq.com/@d3/pie-chart/2

5. Hexbin Map:
https://d3-graph-gallery.com/graph/hexbinmap_geo_label.html

6. Grouped Bar Chart:
https://observablehq.com/@d3/grouped-bar-chart/2

7. Colour Palettes for Colourblindness: https://davidmathlogic.com/colorblind/#%23332288-%23117733-%2344AA99-%2388CCEE-%23DDCC77-%23CC6677-%23AA4499-%23882255

8. Sankey Chart: https://www.economist.com/graphic-detail/2025/04/11/which-countries-would-benefit-most-from-an-american-brain-drain

<h2>Contributions of Each Team Member</h2>

As a team, we collaboratively explored the dataset documentation, discussed our research goals, and identified key factors to investigate through regular meetings. Yingyu also reached out to the instructor for feedback on our project outline and design direction.

We divided our work based on the factors we each focused on. Each of us was responsible for data processing, implementing visualizations, and writing the design rationale for our assigned charts.

- Yingyu designed the location-based choropleth map, icon arrays for province-specific analysis, a weather-related scatterplot, an interactive hexbin map with bar chart, and a grouped bar chart for the sense of belonging.
 
- Chen created the overview heatmap, a bubble chart for the age group, and an interactive sanky diagram for education and income.
 
Chen also initiated meetings and prepared the slides for the peer critique presentation. We both participated in the presentation recording, and Chen uploaded the final version. Yingyu organized the structure of our Observable notebook and wrote the introduction, development process, acknowledgements, and contributions of each team member, while Chen wrote the dataset description, feedback incorporation, and final thoughts. We reviewed and polished each other's section to ensure consistency and clarity. 

