// A short list of major US cities for city-level Google search targeting.
// The `canonicalName` values follow Google Ads' geo-target naming format
// ("City,Region,Country"), which Bright Data's SERP API accepts directly as
// the `uule` parameter — no manual encoding needed. This is a starting set,
// not exhaustive; if a city you need isn't here, most forms below also let
// you type or paste any other canonical name directly.
export const US_CITIES: { label: string; canonicalName: string }[] = [
  { label: "New York, NY", canonicalName: "New York,New York,United States" },
  { label: "Los Angeles, CA", canonicalName: "Los Angeles,California,United States" },
  { label: "Chicago, IL", canonicalName: "Chicago,Illinois,United States" },
  { label: "Dallas, TX", canonicalName: "Dallas,Texas,United States" },
  { label: "Houston, TX", canonicalName: "Houston,Texas,United States" },
  { label: "Miami, FL", canonicalName: "Miami,Florida,United States" },
  { label: "San Francisco, CA", canonicalName: "San Francisco,California,United States" },
  { label: "Seattle, WA", canonicalName: "Seattle,Washington,United States" },
  { label: "Boston, MA", canonicalName: "Boston,Massachusetts,United States" },
  { label: "Atlanta, GA", canonicalName: "Atlanta,Georgia,United States" },
  { label: "Phoenix, AZ", canonicalName: "Phoenix,Arizona,United States" },
  { label: "Denver, CO", canonicalName: "Denver,Colorado,United States" },
];
