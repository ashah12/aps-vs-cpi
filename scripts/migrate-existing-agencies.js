#!/usr/bin/env node
/**
 * Migrates existing agency data from salary-data.json into per-agency files.
 * Adds new metadata fields and removes unused wageGrowth array.
 * Expands Defence to include all 8 APS levels.
 */

const fs = require('fs');
const path = require('path');

const existingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'salary-data.json'), 'utf8')
);

const METADATA = {
  APS: {
    shortName: 'APSC',
    category: 'Central Agencies',
    dataSource: 'mixed',
    eaName: 'APSC Enterprise Agreement 2024-2027',
    eaLink: 'https://www.apsc.gov.au/sites/default/files/2024-03/APSC%20Enterprise%20Agreement%202024-2027.pdf',
  },
  Defence: {
    shortName: 'Defence',
    category: 'National Security',
    dataSource: 'mixed',
    eaName: 'Defence Enterprise Agreement 2024-25',
    eaLink: 'https://www.defence.gov.au/about/reports-publications/enterprise-agreements',
  },
  ATO: {
    shortName: 'ATO',
    category: 'Service Delivery',
    dataSource: 'mixed',
    eaName: 'ATO Enterprise Agreement 2024-25',
    eaLink: 'https://www.ato.gov.au/about-ato/careers/working-at-the-ato/enterprise-agreement/',
  },
  ABS: {
    shortName: 'ABS',
    category: 'Science & Environment',
    dataSource: 'mixed',
    eaName: 'ABS Enterprise Agreement 2024-2027',
    eaLink: 'https://www.abs.gov.au/about/careers/enterprise-agreement',
  },
};

// For Defence, we need to expand from 2 levels (APS5, APS6) to all 8 levels
// We'll extrapolate the other levels based on APS ratios from the APS agency
const LEVELS = ['APS1', 'APS2', 'APS3', 'APS4', 'APS5', 'APS6', 'EL1', 'EL2'];
const STEPS = ['Step 1', 'Step 2', 'Step 3'];

function expandDefenceData(defenceYears, apsYears) {
  const expanded = {};
  for (const [yearStr, levels] of Object.entries(defenceYears)) {
    expanded[yearStr] = {};

    // Use Defence's APS6 Step 1 as the reference point
    const defenceAps6Step1 = levels['APS6']?.['Step 1'] || levels['APS5']?.['Step 1'] * 1.11;

    // Get APS agency's APS6 Step 1 for this year as ratio reference
    const apsAps6Step1 = apsYears[yearStr]['APS6']['Step 1'];

    for (const level of LEVELS) {
      expanded[yearStr][level] = {};
      if (levels[level]) {
        // Use existing Defence data
        for (const step of STEPS) {
          expanded[yearStr][level][step] = levels[level][step];
        }
      } else {
        // Extrapolate from APS data, scaled to Defence's pay level
        const scaleFactor = defenceAps6Step1 / apsAps6Step1;
        for (const step of STEPS) {
          expanded[yearStr][level][step] = Math.round(apsYears[yearStr][level][step] * scaleFactor);
        }
      }
    }
  }
  return expanded;
}

const outputDir = path.join(__dirname, '..', 'src', 'data', 'agencies');

for (const [key, agency] of Object.entries(existingData.agencies)) {
  const meta = METADATA[key];
  let years = agency.years;

  // Expand Defence data
  if (key === 'Defence') {
    years = expandDefenceData(agency.years, existingData.agencies.APS.years);
  }

  const output = {
    key,
    name: agency.name,
    shortName: meta.shortName,
    category: meta.category,
    dataSource: meta.dataSource,
    eaName: meta.eaName,
    eaLink: meta.eaLink,
    years,
  };

  // Remove wageGrowth (dead code)
  // It was in agency.wageGrowth but we're not copying it

  const filename = key.toLowerCase() + '.json';
  fs.writeFileSync(
    path.join(outputDir, filename),
    JSON.stringify(output, null, 2) + '\n'
  );
  console.log(`Migrated: ${filename}`);
}

console.log('\nMigration complete.');
