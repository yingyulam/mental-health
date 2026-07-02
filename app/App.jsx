import { useData } from "./lib/useData.js";
import Heatmap from "./components/Heatmap.jsx";
import Choropleth from "./components/Choropleth.jsx";
import IconArray from "./components/IconArray.jsx";
import Scatterplot from "./components/Scatterplot.jsx";
import HexbinPie from "./components/HexbinPie.jsx";
import BelongingBars from "./components/BelongingBars.jsx";
import BubbleChart from "./components/BubbleChart.jsx";
import Sankey from "./components/Sankey.jsx";

function Figure({ children, caption }) {
  return (
    <figure className="figure">
      {children}
      {caption && <figcaption className="figcaption">{caption}</figcaption>}
    </figure>
  );
}

export default function App() {
  const { data, loading, error } = useData();

  return (
    <>
      <header className="site-header">
        <div className="inner">
          <span className="brand">At Home or Adrift?</span>
          <nav className="site-nav">
            <a href="#overview">Overview</a>
            <a href="#location">Location</a>
            <a href="#weather">Weather</a>
            <a href="#belonging">Belonging</a>
            <a href="#age">Age</a>
            <a href="#income">Income &amp; Education</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>At Home or Adrift?</h1>
        <p className="subtitle">
          Analysis of mental health factors between immigrants and
          non-immigrants in Canada
        </p>
      </section>

      <main className="prose">
        <section id="intro">
          <h2>Introduction</h2>
          <p>
            This project explores how various factors—such as region, weather,
            sense of belonging to the local community, age group and work
            activity—may relate to self-reported mental health among immigrants
            and non-immigrants in Canada.
          </p>
          <p>
            Rather than seeking a definitive answer, our goal is to spark
            curiosity and raise awareness about the experiences of immigrants.
            The visual narrative is designed to be viewer-driven, encouraging
            users to interact with the data, explore different dimensions, and
            draw their own insights. Through this exploratory approach, we hope
            to promote reflection on how social, environmental, and demographic
            factors may influence or shape mental well-being.
          </p>

          <h2>Data Description</h2>
          <p>
            The main dataset is the Canadian Community Health Survey (CCHS)
            Public Use Microdata File, collected by Statistics Canada. This
            comprehensive health survey gathers information from Canadians about
            their health status, healthcare utilization, and health
            determinants, and includes respondents aged 12 and older living in
            private dwellings across all provinces and territories. We also
            incorporate the <strong>Canadian Climate Normals</strong> dataset
            (Environment and Climate Change Canada) and a{" "}
            <strong>Canada Map GeoJSON</strong> from SimpleMaps.
          </p>
          <p>
            Because the sample contains many more non-immigrant than immigrant
            respondents (88,594 vs 17,476), we compare the groups in{" "}
            <em>relative</em> terms rather than absolute counts to keep the
            comparison fair.
          </p>
        </section>

        <section id="overview">
          <span className="eyebrow">00 — Overview</span>
          <h2>A Bird&apos;s-Eye View</h2>
          <h4>Heatmap</h4>
          <p>
            We developed this heatmap during exploratory analysis as a
            bird&apos;s-eye view of the relationship between immigration status
            and mental health. While &quot;Very good&quot; mental health is most
            common among both immigrants (33.9%) and non-immigrants (36.4%),
            immigrants report &quot;Excellent&quot; mental health at notably
            higher rates (32.0% vs 27.3%)—the largest difference between the
            groups. The gradient encodes percentage distributions; hover for raw
            counts and percentages.
          </p>
          {data && (
            <Figure>
              <Heatmap overviewData={data.overviewData} />
            </Figure>
          )}
        </section>

        <section id="location">
          <span className="eyebrow">01 — Location</span>
          <h2>Mental Health Across Canada</h2>
          <h4>Choropleth Map</h4>
          <p>
            Canada is vast, yet it consists of only 10 provinces and 3
            territories, making it well-suited for a choropleth map. Two
            dropdowns filter by immigration status and mental health level;
            hover tooltips provide exact percentages. We chose to present the
            full range of self-rated mental health categories rather than
            grouping them, to preserve nuance.
          </p>
          {data && (
            <Figure>
              <Choropleth
                canada={data.canada}
                canada_mental={data.canada_mental}
              />
            </Figure>
          )}

          <h4>Icon Array</h4>
          <p>
            The choropleth doesn&apos;t show the distribution of mental health
            levels, nor does it directly compare the two groups. These
            side-by-side icon arrays do. Each circle represents 1 in 100
            individuals—studies show people interpret frequencies more
            intuitively than abstract percentages. The colour scheme is a
            colour-blind-friendly diverging palette used consistently across
            every chart.
          </p>
          {data && (
            <Figure>
              <IconArray canada_mental={data.canada_mental} />
            </Figure>
          )}
        </section>

        <section id="weather">
          <span className="eyebrow">02 — Weather</span>
          <h2>Does Cold Weather Matter?</h2>
          <h4>Scatterplot</h4>
          <p>
            Canada is cold, yet many immigrants come from warmer regions. We
            narrowed our metric to &quot;the number of days with maximum
            temperature below -10°C.&quot; Across mental health levels the trend
            was similar: coldness may not impact mental health as we initially
            assumed. Here we show high self-rated mental health (&quot;very
            good&quot; + &quot;excellent&quot;) to keep things simple.
          </p>
          {data && (
            <Figure>
              <Scatterplot
                canada_mental={data.canada_mental}
                temperatureData={data.temperatureData}
              />
            </Figure>
          )}

          <h4>Hexbin Map &amp; Pie Chart</h4>
          <p>
            What if we used a map of Canadian weather to navigate mental health
            distribution? This hexbin map gives every province equal visual
            weight—small provinces like Prince Edward Island aren&apos;t lost.{" "}
            <strong>Click a province</strong> to see the immigrant mental health
            distribution as a pie chart.
          </p>
          {data && (
            <Figure caption="Click any coloured hexagon to update the pie chart.">
              <HexbinPie
                canada_mental={data.canada_mental}
                temperatureData={data.temperatureData}
              />
            </Figure>
          )}
        </section>

        <section id="belonging">
          <span className="eyebrow">03 — Sense of Belonging</span>
          <h2>Community &amp; Well-being</h2>
          <h4>Grouped Bar Chart</h4>
          <p>
            By stacking two charts—one for immigrants, one for
            non-immigrants—users can compare side by side. The radio buttons
            filter by level of belonging, from very weak to very strong,
            supporting a storytelling flow. A notable insight: a very strong
            sense of community appears to benefit immigrants more than
            non-immigrants.
          </p>
          {data && (
            <Figure>
              <BelongingBars filteredBelonging={data.filteredBelonging} />
            </Figure>
          )}
        </section>

        <section id="age">
          <span className="eyebrow">04 — Age</span>
          <h2>Mental Health Across the Lifespan</h2>
          <h4>Bubble Chart</h4>
          <p>
            This bubble chart maps age, immigration status, and mental health
            together, with bubble size showing percentage within each immigrant
            group. Trend lines reveal a compelling pattern: immigrants begin
            with higher average scores in the youngest cohort (3.11 vs 2.97),
            dip in middle age, and converge with non-immigrants in the oldest
            group (2.95). Hover over a position to compare groups; click legend
            items to filter.
          </p>
          {data && (
            <Figure>
              <BubbleChart ageData={data.ageData} />
            </Figure>
          )}
        </section>

        <section id="income">
          <span className="eyebrow">05 — Income &amp; Education</span>
          <h2>Socioeconomic Pathways</h2>
          <h4>Sankey Diagram</h4>
          <p>
            Sankey diagrams excel at revealing complex relationships between
            multiple variables at once. Trace how individuals flow through
            combinations of education, income, and mental health outcomes—and
            how those pathways differ by immigration status. Select the source,
            optionally add an intermediate variable, and toggle between
            immigrant, non-immigrant, and combined populations.
          </p>
          {data && (
            <Figure>
              <Sankey
                cchs={data.cchs}
                immigrantData={data.immigrantData}
                nonImmigrantData={data.nonImmigrantData}
              />
            </Figure>
          )}
        </section>

        <section id="about">
          <h2>About This Project</h2>
          <p>
            The development process was iterative: we would select a factor,
            process the data, uncover unexpected issues, then regroup and pivot.
            Our graphs—and even the factors we explored—evolved as the project
            progressed, but our main goal stayed consistent. Built with Python
            (data processing) and D3.js, and originally authored as an Observable
            notebook.
          </p>
          <h4>Data Sources</h4>
          <ul>
            <li>
              <a
                href="https://www150.statcan.gc.ca/n1/pub/82m0013x/82m0013x2024001-eng.htm"
                target="_blank"
                rel="noreferrer"
              >
                Canadian Community Health Survey (CCHS) — Public Use Microdata
                File
              </a>
            </li>
            <li>
              <a
                href="https://climate.weather.gc.ca/climate_normals/index_e.html"
                target="_blank"
                rel="noreferrer"
              >
                Canadian Climate Normals (1991–2020)
              </a>
            </li>
            <li>
              <a
                href="https://simplemaps.com/gis/country/ca"
                target="_blank"
                rel="noreferrer"
              >
                Canada Map GeoJSON — SimpleMaps
              </a>
            </li>
          </ul>
        </section>

        {loading && <div className="status">Loading data…</div>}
        {error && (
          <div className="status error">
            Failed to load data: {String(error.message || error)}
          </div>
        )}
      </main>

      <footer>
        <p>
          At Home or Adrift? — Yingyu Lin &amp; Chen Chen
        </p>
        <p>
          <a
            href="https://observablehq.com/@learning-visualization/at-home-or-adrift"
            target="_blank"
            rel="noreferrer"
          >
            View the original Observable notebook →
          </a>
        </p>
      </footer>
    </>
  );
}
