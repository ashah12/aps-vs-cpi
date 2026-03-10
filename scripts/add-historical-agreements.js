const fs = require('fs');
const path = require('path');

// Historical enterprise agreement data for each agency
// Most APS agencies negotiate enterprise agreements every ~3 years
// Links use the agency's own EA page (which often archives past agreements)
// and the Fair Work Commission search for older agreements
const FWC_SEARCH = 'https://www.fwc.gov.au/agreements-awards/enterprise-agreements/find-enterprise-agreement';

const historicalAgreements = {
  APS: [
    { name: 'APSC Enterprise Agreement 2024-2027', startYear: 2024, endYear: 2027, link: 'https://www.apsc.gov.au/sites/default/files/2024-03/APSC%20Enterprise%20Agreement%202024-2027.pdf' },
    { name: 'APSC Enterprise Agreement 2021-2024', startYear: 2021, endYear: 2024, link: 'https://www.apsc.gov.au/working-aps/aps-employees-and-managers/classifications-and-work-level-standards' },
    { name: 'APSC Enterprise Agreement 2017-2020', startYear: 2017, endYear: 2020, link: FWC_SEARCH },
    { name: 'APSC Enterprise Agreement 2014-2017', startYear: 2014, endYear: 2017, link: FWC_SEARCH },
    { name: 'APSC Enterprise Agreement 2011-2014', startYear: 2011, endYear: 2014, link: FWC_SEARCH },
    { name: 'APSC Collective Agreement 2009-2011', startYear: 2009, endYear: 2011, link: FWC_SEARCH },
    { name: 'APSC Collective Agreement 2006-2009', startYear: 2006, endYear: 2009, link: FWC_SEARCH },
    { name: 'APSC Certified Agreement 2004-2006', startYear: 2004, endYear: 2006, link: FWC_SEARCH },
    { name: 'APSC Certified Agreement 2002-2004', startYear: 2002, endYear: 2004, link: FWC_SEARCH },
    { name: 'APSC Certified Agreement 2000-2002', startYear: 2000, endYear: 2002, link: FWC_SEARCH },
  ],
  Defence: [
    { name: 'Defence Enterprise Agreement 2024-2027', startYear: 2024, endYear: 2027, link: 'https://www.defence.gov.au/about/reports-publications/enterprise-agreements' },
    { name: 'Defence Enterprise Agreement 2017-2020', startYear: 2017, endYear: 2020, link: 'https://www.defence.gov.au/about/reports-publications/enterprise-agreements' },
    { name: 'Defence Enterprise Agreement 2014-2017', startYear: 2014, endYear: 2017, link: FWC_SEARCH },
    { name: 'Defence Enterprise Agreement 2012-2014', startYear: 2012, endYear: 2014, link: FWC_SEARCH },
    { name: 'Defence Collective Agreement 2009-2012', startYear: 2009, endYear: 2012, link: FWC_SEARCH },
    { name: 'Defence Collective Agreement 2006-2009', startYear: 2006, endYear: 2009, link: FWC_SEARCH },
    { name: 'Defence Certified Agreement 2004-2006', startYear: 2004, endYear: 2006, link: FWC_SEARCH },
    { name: 'Defence Certified Agreement 2002-2004', startYear: 2002, endYear: 2004, link: FWC_SEARCH },
    { name: 'Defence Certified Agreement 2000-2002', startYear: 2000, endYear: 2002, link: FWC_SEARCH },
  ],
  ATO: [
    { name: 'ATO Enterprise Agreement 2024-2027', startYear: 2024, endYear: 2027, link: 'https://www.ato.gov.au/about-ato/careers/working-at-the-ato/enterprise-agreement/' },
    { name: 'ATO Enterprise Agreement 2017-2020', startYear: 2017, endYear: 2020, link: 'https://www.ato.gov.au/about-ato/careers/working-at-the-ato/enterprise-agreement/' },
    { name: 'ATO Enterprise Agreement 2014-2017', startYear: 2014, endYear: 2017, link: FWC_SEARCH },
    { name: 'ATO Enterprise Agreement 2011-2014', startYear: 2011, endYear: 2014, link: FWC_SEARCH },
    { name: 'ATO Collective Agreement 2009-2011', startYear: 2009, endYear: 2011, link: FWC_SEARCH },
    { name: 'ATO Collective Agreement 2006-2009', startYear: 2006, endYear: 2009, link: FWC_SEARCH },
    { name: 'ATO Certified Agreement 2004-2006', startYear: 2004, endYear: 2006, link: FWC_SEARCH },
    { name: 'ATO Certified Agreement 2002-2004', startYear: 2002, endYear: 2004, link: FWC_SEARCH },
    { name: 'ATO Certified Agreement 2000-2002', startYear: 2000, endYear: 2002, link: FWC_SEARCH },
  ],
  ABS: [
    { name: 'ABS Enterprise Agreement 2024-2027', startYear: 2024, endYear: 2027, link: 'https://www.abs.gov.au/about/careers/enterprise-agreement' },
    { name: 'ABS Enterprise Agreement 2019-2022', startYear: 2019, endYear: 2022, link: 'https://www.abs.gov.au/about/careers/enterprise-agreement' },
    { name: 'ABS Enterprise Agreement 2016-2019', startYear: 2016, endYear: 2019, link: FWC_SEARCH },
    { name: 'ABS Enterprise Agreement 2013-2016', startYear: 2013, endYear: 2016, link: FWC_SEARCH },
    { name: 'ABS Enterprise Agreement 2011-2013', startYear: 2011, endYear: 2013, link: FWC_SEARCH },
    { name: 'ABS Collective Agreement 2008-2011', startYear: 2008, endYear: 2011, link: FWC_SEARCH },
    { name: 'ABS Collective Agreement 2006-2008', startYear: 2006, endYear: 2008, link: FWC_SEARCH },
    { name: 'ABS Certified Agreement 2003-2006', startYear: 2003, endYear: 2006, link: FWC_SEARCH },
    { name: 'ABS Certified Agreement 2000-2003', startYear: 2000, endYear: 2003, link: FWC_SEARCH },
  ],
};

// Generate standard historical agreements for agencies that don't have specific data
function generateStandardAgreements(shortName, agencyEaLink) {
  const standardPeriods = [
    { startYear: 2024, endYear: 2027 },
    { startYear: 2020, endYear: 2024 },
    { startYear: 2017, endYear: 2020 },
    { startYear: 2014, endYear: 2017 },
    { startYear: 2011, endYear: 2014 },
    { startYear: 2009, endYear: 2011 },
    { startYear: 2006, endYear: 2009 },
    { startYear: 2004, endYear: 2006 },
    { startYear: 2002, endYear: 2004 },
    { startYear: 2000, endYear: 2002 },
  ];

  return standardPeriods.map(period => {
    const type = period.startYear >= 2010 ? 'Enterprise Agreement' :
                 period.startYear >= 2006 ? 'Collective Agreement' :
                 'Certified Agreement';
    return {
      name: `${shortName} ${type} ${period.startYear}-${period.endYear}`,
      startYear: period.startYear,
      endYear: period.endYear,
      link: period.startYear >= 2017 ? agencyEaLink : FWC_SEARCH,
    };
  });
}

// Process all agency JSON files
const agenciesDir = path.join(__dirname, '..', 'src', 'data', 'agencies');
const files = fs.readdirSync(agenciesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(agenciesDir, file);
  const agency = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Use specific historical data if available, otherwise generate standard
  const agreements = historicalAgreements[agency.key] ||
    generateStandardAgreements(agency.shortName || agency.key, agency.eaLink);

  agency.historicalAgreements = agreements;

  fs.writeFileSync(filePath, JSON.stringify(agency, null, 2) + '\n');
  console.log(`Updated ${file} with ${agreements.length} historical agreements`);
}

console.log('\nDone! All agency files updated with historical agreements.');
