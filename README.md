# At Home or Adrift?

Analysis of mental health factors between immigrants and non-immigrants in
Canada

This is a **React + Vite** web app converted from the original Observable
notebook (`src/at-home-or-adrift.md`). It presents seven interactive D3
visualizations woven into a narrative article:

| # | Section | Visualization |
|---|---------|---------------|
| 0 | Overview | Heatmap (immigration status × mental health) |
| 1 | Location | Choropleth map + icon array |
| 2 | Weather | Scatterplot + hexbin map with click-to-pie |
| 3 | Belonging | Grouped bar chart (radio filter) |
| 4 | Age | Bubble chart (trend lines + group filter) |
| 5 | Income & Education | Sankey diagram (dropdown controls) |

## Getting started

```bash
npm install
npm run dev      # start the dev server 
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Project structure

```
index.html            # entry HTML (loads app/main.jsx)
vite.config.js        # Vite config (base: "./" for easy static hosting)
public/data/          # data files, served statically and fetched at runtime
  ca.json             #   Canada GeoJSON (SimpleMaps)
  canada_mental_overview.csv
  cold_days.csv
  belonging_mental.csv
  clean_cchs_data.csv #   CCHS microdata
app/
  main.jsx            # React entry
  App.jsx             # article layout + prose, mounts every chart
  styles.css
  lib/
    labels.js         # label maps + shared colour palette
    useData.js        # loads all data, derives per-chart datasets
    useD3.js          # hook: runs imperative D3 against a container ref
    tooltip.js        # shared floating tooltip helper
    legend.js         # port of Observable's @d3/color-legend (Legend + swatches)
  components/         # one file per visualization
src/                  # original Observable notebook + source data (untouched)
```

## Deploying

Deployed on Vercel; pushes to main auto-deploy. Live at [mental-health-canada.vercel.app.](https://mental-health-canada.vercel.app)
