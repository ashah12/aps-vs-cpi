// Agency category groupings for the selector dropdown
export const AGENCY_CATEGORIES = [
  {
    name: 'Central Agencies',
    keys: ['APS', 'PMC', 'Treasury', 'Finance'],
  },
  {
    name: 'National Security & Law',
    keys: ['Defence', 'HomeAffairs', 'AFP', 'AGS'],
  },
  {
    name: 'Service Delivery',
    keys: ['ServicesAustralia', 'ATO'],
  },
  {
    name: 'Economic & Industry',
    keys: ['Industry', 'Agriculture', 'Infrastructure', 'IPAustralia'],
  },
  {
    name: 'Social Services',
    keys: ['Health', 'Education', 'Employment', 'VeteransAffairs'],
  },
  {
    name: 'Science & Environment',
    keys: ['ABS', 'DCCEEW', 'GeoscienceAustralia', 'BOM'],
  },
  {
    name: 'Foreign Affairs',
    keys: ['DFAT'],
  },
];

// Color palette for comparison chart lines (up to 5 agencies + CPI)
export const COMPARISON_COLORS = [
  '#8884d8', // Purple
  '#ff7300', // Orange
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FF6B6B', // Red
  '#FFD93D', // Yellow
  '#6BCB77', // Green
  '#4D96FF', // Light blue
];

// CPI line color (always green in comparison)
export const CPI_COLOR = '#82ca9d';

const agencyMetadata = { AGENCY_CATEGORIES, COMPARISON_COLORS, CPI_COLOR };
export default agencyMetadata;
