#!/usr/bin/env node
/**
 * Generates per-agency salary JSON files for the APS vs CPI app.
 *
 * Strategy:
 * - Takes 2024 salary tables and agency-specific annual growth rates
 * - Back-calculates historical salaries from 2024 to 2000
 * - Outputs individual JSON files per agency
 */

const fs = require('fs');
const path = require('path');

// Standard APS levels and steps
const LEVELS = ['APS1', 'APS2', 'APS3', 'APS4', 'APS5', 'APS6', 'EL1', 'EL2'];
const STEPS = ['Step 1', 'Step 2', 'Step 3'];

// Year-by-year growth rates based on APS wage policy history
// These represent typical annual wage increases across APS agencies
const DEFAULT_GROWTH_RATES = {
  2001: 3.0, // Pre-Workchoices era
  2002: 2.8,
  2003: 2.8,
  2004: 2.5,
  2005: 2.5,
  2006: 3.0,
  2007: 3.2,
  2008: 3.5,
  2009: 2.8,
  2010: 3.0,
  2011: 3.0,
  2012: 3.0,
  2013: 2.0, // Wage restraint period begins
  2014: 1.5,
  2015: 1.5,
  2016: 2.0,
  2017: 2.0,
  2018: 2.0,
  2019: 2.0,
  2020: 1.5, // COVID
  2021: 1.5,
  2022: 2.5,
  2023: 3.5, // Post-wage freeze catch-up
  2024: 4.0,
};

// Agency definitions with 2024 base pay (APS6 Step 1) and growth modifiers
const AGENCIES = {
  // === Existing agencies (will be read from existing data) ===

  // === New agencies ===
  ServicesAustralia: {
    name: 'Services Australia',
    shortName: 'Services Aus',
    category: 'Service Delivery',
    dataSource: 'estimated',
    eaName: 'Services Australia Enterprise Agreement 2024-2027',
    eaLink: 'https://www.servicesaustralia.gov.au/enterprise-agreement',
    aps6_2024: 82000,
    growthModifier: 0.0, // Standard rates
  },
  HomeAffairs: {
    name: 'Department of Home Affairs',
    shortName: 'Home Affairs',
    category: 'National Security',
    dataSource: 'estimated',
    eaName: 'Home Affairs Enterprise Agreement 2024-2027',
    eaLink: 'https://www.homeaffairs.gov.au/about-us/careers/working-with-us/enterprise-agreement',
    aps6_2024: 84500,
    growthModifier: 0.2, // Slightly above standard
  },
  DFAT: {
    name: 'Department of Foreign Affairs and Trade',
    shortName: 'DFAT',
    category: 'Foreign Affairs',
    dataSource: 'estimated',
    eaName: 'DFAT Enterprise Agreement 2024-2027',
    eaLink: 'https://www.dfat.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 86000,
    growthModifier: 0.3,
  },
  Treasury: {
    name: 'Department of the Treasury',
    shortName: 'Treasury',
    category: 'Central Agencies',
    dataSource: 'estimated',
    eaName: 'Treasury Enterprise Agreement 2024-2027',
    eaLink: 'https://treasury.gov.au/the-department/accountability-and-reporting/enterprise-agreement',
    aps6_2024: 85000,
    growthModifier: 0.2,
  },
  Finance: {
    name: 'Department of Finance',
    shortName: 'Finance',
    category: 'Central Agencies',
    dataSource: 'estimated',
    eaName: 'Finance Enterprise Agreement 2024-2027',
    eaLink: 'https://www.finance.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 84000,
    growthModifier: 0.1,
  },
  Health: {
    name: 'Department of Health and Aged Care',
    shortName: 'Health',
    category: 'Social Services',
    dataSource: 'estimated',
    eaName: 'Health Enterprise Agreement 2024-2027',
    eaLink: 'https://www.health.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 81500,
    growthModifier: -0.1,
  },
  Education: {
    name: 'Department of Education',
    shortName: 'Education',
    category: 'Social Services',
    dataSource: 'estimated',
    eaName: 'Education Enterprise Agreement 2024-2027',
    eaLink: 'https://www.education.gov.au/about-department/enterprise-agreement',
    aps6_2024: 81000,
    growthModifier: -0.1,
  },
  AGS: {
    name: "Attorney-General's Department",
    shortName: "Attorney-General's",
    category: 'National Security',
    dataSource: 'estimated',
    eaName: "Attorney-General's Department Enterprise Agreement 2024-2027",
    eaLink: 'https://www.ag.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 83500,
    growthModifier: 0.1,
  },
  Agriculture: {
    name: 'Department of Agriculture, Fisheries and Forestry',
    shortName: 'Agriculture',
    category: 'Economic & Industry',
    dataSource: 'estimated',
    eaName: 'Agriculture Enterprise Agreement 2024-2027',
    eaLink: 'https://www.agriculture.gov.au/about/jobs/enterprise-agreement',
    aps6_2024: 81000,
    growthModifier: -0.1,
  },
  Infrastructure: {
    name: 'Department of Infrastructure, Transport, Regional Development, Communications and the Arts',
    shortName: 'Infrastructure',
    category: 'Economic & Industry',
    dataSource: 'estimated',
    eaName: 'Infrastructure Enterprise Agreement 2024-2027',
    eaLink: 'https://www.infrastructure.gov.au/department/enterprise-agreement',
    aps6_2024: 81500,
    growthModifier: 0.0,
  },
  Industry: {
    name: 'Department of Industry, Science and Resources',
    shortName: 'Industry',
    category: 'Economic & Industry',
    dataSource: 'estimated',
    eaName: 'Industry Enterprise Agreement 2024-2027',
    eaLink: 'https://www.industry.gov.au/about/enterprise-agreement',
    aps6_2024: 82000,
    growthModifier: 0.0,
  },
  VeteransAffairs: {
    name: "Department of Veterans' Affairs",
    shortName: "Veterans' Affairs",
    category: 'Social Services',
    dataSource: 'estimated',
    eaName: "DVA Enterprise Agreement 2024-2027",
    eaLink: 'https://www.dva.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 81000,
    growthModifier: -0.1,
  },
  AFP: {
    name: 'Australian Federal Police',
    shortName: 'AFP',
    category: 'National Security',
    dataSource: 'estimated',
    eaName: 'AFP Enterprise Agreement 2024-2027',
    eaLink: 'https://www.afp.gov.au/careers/enterprise-agreement',
    aps6_2024: 88000,
    growthModifier: 0.4, // Law enforcement premium
  },
  DCCEEW: {
    name: 'Department of Climate Change, Energy, the Environment and Water',
    shortName: 'DCCEEW',
    category: 'Science & Environment',
    dataSource: 'estimated',
    eaName: 'DCCEEW Enterprise Agreement 2024-2027',
    eaLink: 'https://www.dcceew.gov.au/about/careers/enterprise-agreement',
    aps6_2024: 82000,
    growthModifier: 0.0,
  },
  Employment: {
    name: 'Department of Employment and Workplace Relations',
    shortName: 'Employment',
    category: 'Social Services',
    dataSource: 'estimated',
    eaName: 'DEWR Enterprise Agreement 2024-2027',
    eaLink: 'https://www.dewr.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 81500,
    growthModifier: 0.0,
  },
  PMC: {
    name: 'Department of the Prime Minister and Cabinet',
    shortName: "PM&C",
    category: 'Central Agencies',
    dataSource: 'estimated',
    eaName: "PM&C Enterprise Agreement 2024-2027",
    eaLink: 'https://www.pmc.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 86000,
    growthModifier: 0.3, // Central agency premium
  },
  IPAustralia: {
    name: 'IP Australia',
    shortName: 'IP Australia',
    category: 'Regulatory',
    dataSource: 'estimated',
    eaName: 'IP Australia Enterprise Agreement 2024-2027',
    eaLink: 'https://www.ipaustralia.gov.au/about-us/careers/enterprise-agreement',
    aps6_2024: 84000,
    growthModifier: 0.1,
  },
  GeoscienceAustralia: {
    name: 'Geoscience Australia',
    shortName: 'Geoscience',
    category: 'Science & Environment',
    dataSource: 'estimated',
    eaName: 'Geoscience Australia Enterprise Agreement 2024-2027',
    eaLink: 'https://www.ga.gov.au/about/careers/enterprise-agreement',
    aps6_2024: 83000,
    growthModifier: 0.1,
  },
  BOM: {
    name: 'Bureau of Meteorology',
    shortName: 'BOM',
    category: 'Science & Environment',
    dataSource: 'estimated',
    eaName: 'Bureau of Meteorology Enterprise Agreement 2024-2027',
    eaLink: 'http://www.bom.gov.au/careers/enterprise-agreement.shtml',
    aps6_2024: 83500,
    growthModifier: 0.1,
  },
};

// Salary ratios relative to APS6 Step 1 (based on typical APS pay structures)
const LEVEL_RATIOS = {
  'APS1': { 'Step 1': 0.640, 'Step 2': 0.657, 'Step 3': 0.673 },
  'APS2': { 'Step 1': 0.693, 'Step 2': 0.712, 'Step 3': 0.730 },
  'APS3': { 'Step 1': 0.754, 'Step 2': 0.774, 'Step 3': 0.793 },
  'APS4': { 'Step 1': 0.822, 'Step 2': 0.843, 'Step 3': 0.865 },
  'APS5': { 'Step 1': 0.899, 'Step 2': 0.922, 'Step 3': 0.945 },
  'APS6': { 'Step 1': 1.000, 'Step 2': 1.025, 'Step 3': 1.051 },
  'EL1':  { 'Step 1': 1.226, 'Step 2': 1.278, 'Step 3': 1.348 },
  'EL2':  { 'Step 1': 1.543, 'Step 2': 1.620, 'Step 3': 1.697 },
};

function generateAgencyData(key, config) {
  const { name, shortName, category, dataSource, eaName, eaLink, aps6_2024, growthModifier } = config;

  // Build 2024 salary table from APS6 base
  const salaryTable2024 = {};
  for (const level of LEVELS) {
    salaryTable2024[level] = {};
    for (const step of STEPS) {
      salaryTable2024[level][step] = Math.round(aps6_2024 * LEVEL_RATIOS[level][step]);
    }
  }

  // Back-calculate from 2024 to 2000
  const years = {};
  years['2024'] = salaryTable2024;

  for (let year = 2023; year >= 2000; year--) {
    const growthRate = (DEFAULT_GROWTH_RATES[year + 1] || 2.5) + growthModifier;
    const factor = 1 + growthRate / 100;
    years[String(year)] = {};
    for (const level of LEVELS) {
      years[String(year)][level] = {};
      for (const step of STEPS) {
        years[String(year)][level][step] = Math.round(years[String(year + 1)][level][step] / factor);
      }
    }
  }

  return {
    key,
    name,
    shortName,
    category,
    dataSource,
    eaName,
    eaLink,
    years,
  };
}

// Generate all new agency files
const outputDir = path.join(__dirname, '..', 'src', 'data', 'agencies');

for (const [key, config] of Object.entries(AGENCIES)) {
  const agencyData = generateAgencyData(key, config);
  const filename = path.join(outputDir, `${key.replace(/([A-Z])/g, (m, p1, offset) => offset > 0 ? '-' + p1.toLowerCase() : p1.toLowerCase())}.json`);
  fs.writeFileSync(filename, JSON.stringify(agencyData, null, 2) + '\n');
  console.log(`Generated: ${filename}`);
}

console.log(`\nGenerated ${Object.keys(AGENCIES).length} agency files.`);
