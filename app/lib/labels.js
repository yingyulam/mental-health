// Label maps and the shared colour palette, ported verbatim from the
// notebook's "Global Variables" section.

// Colour-blind-friendly palette used across every chart.
export const tableau10 = [
  "#44AA99",
  "#88CCEE",
  "#DDCC77",
  "#CC6677",
  "#AA4499",
  "#D3D3D3",
];

export const mentalHealthLabels = {
  0: "Poor",
  1: "Fair",
  2: "Good",
  3: "Very good",
  4: "Excellent",
  9: "Not Stated",
};

export const immigrationLabels = {
  1: "Immigrant",
  2: "Non-immigrant",
  9: "Not stated",
};

export const provinceLabels = [
  "All",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Nova Scotia",
  "New Brunswick",
  "Québec",
  "Ontario",
  "Manitoba",
  "Saskatchewan",
  "Alberta",
  "British Columbia",
  "Yukon",
];

export const senseOfBelongingLabels = {
  1: "Very Strong",
  2: "Somewhat Strong",
  3: "Somewhat Weak",
  4: "Weak",
};

export const ageLabels = {
  1: "12 to 17 years",
  2: "18 to 34 years",
  3: "35 to 49 years",
  4: "50 to 64 years",
  5: "65 and older",
};

export const educationLabels = {
  1: "Less than Secondary",
  2: "Secondary, No Post-Secondary",
  3: "Post-Secondary/University",
  9: "Not Stated",
};

export const incomeLabels = {
  1: "$20,000-$39,999",
  2: "$40,000-$59,999",
  3: "$60,000-$79,999",
  4: "$80,000 or more",
  9: "Not Stated",
};

// Variables available to the Sankey diagram.
export const sankeyVariables = [
  { id: "GENDVMHI", name: "Mental Health", labels: mentalHealthLabels },
  { id: "EHG2DVH3", name: "Education Level", labels: educationLabels },
  { id: "INCDGHH", name: "Household Income", labels: incomeLabels },
];

// Hexbin layout for the Canada weather map.
export const canadaHexMap = [
  { Province: "British Columbia", Abbr: "BC", X: 1, Y: 2 },
  { Province: "Yukon", Abbr: "YT", X: 1, Y: 1 },
  { Province: "Alberta", Abbr: "AB", X: 2, Y: 2 },
  { Province: "Saskatchewan", Abbr: "SK", X: 3, Y: 2 },
  { Province: "Manitoba", Abbr: "MB", X: 4, Y: 2 },
  { Province: "Ontario", Abbr: "ON", X: 5, Y: 3 },
  { Province: "Québec", Abbr: "QC", X: 6, Y: 2 },
  { Province: "Newfoundland and Labrador", Abbr: "NL", X: 7, Y: 1 },
  { Province: "Nova Scotia", Abbr: "NS", X: 5, Y: 2 },
  { Province: "New Brunswick", Abbr: "NB", X: 7, Y: 2 },
  { Province: "Prince Edward Island", Abbr: "PE", X: 8, Y: 2 },
];
