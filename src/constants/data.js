// Agency-specific salary data
export const SALARY_DATA = {
  'APS': { // APSC salary data
    'APS1': {
      'Step 1': 51963,
      'Step 2': 53278,
      'Step 3': 54603
    },
    'APS2': {
      'Step 1': 56273,
      'Step 2': 57739,
      'Step 3': 59216
    },
    'APS3': {
      'Step 1': 61156,
      'Step 2': 62750,
      'Step 3': 64352
    },
    'APS4': {
      'Step 1': 66693,
      'Step 2': 68416,
      'Step 3': 70149
    },
    'APS5': {
      'Step 1': 72908,
      'Step 2': 74778,
      'Step 3': 76660
    },
    'APS6': {
      'Step 1': 81115,
      'Step 2': 83180,
      'Step 3': 85260
    },
    'EL1': {
      'Step 1': 99465,
      'Step 2': 103641,
      'Step 3': 109301
    },
    'EL2': {
      'Step 1': 125133,
      'Step 2': 131393,
      'Step 3': 137661
    }
  },
  'Defence': { // Defence salary data (slightly higher than APS)
    'APS1': {
      'Step 1': 53522,
      'Step 2': 54876,
      'Step 3': 56241
    },
    'APS2': {
      'Step 1': 57961,
      'Step 2': 59471,
      'Step 3': 60992
    },
    'APS3': {
      'Step 1': 62991,
      'Step 2': 64633,
      'Step 3': 66283
    },
    'APS4': {
      'Step 1': 68694,
      'Step 2': 70468,
      'Step 3': 72253
    },
    'APS5': {
      'Step 1': 75095,
      'Step 2': 77021,
      'Step 3': 78960
    },
    'APS6': {
      'Step 1': 83548,
      'Step 2': 85675,
      'Step 3': 87818
    },
    'EL1': {
      'Step 1': 102449,
      'Step 2': 106750,
      'Step 3': 112580
    },
    'EL2': {
      'Step 1': 128887,
      'Step 2': 135335,
      'Step 3': 141791
    }
  },
  'ATO': { // ATO salary data
    'APS1': {
      'Step 1': 52223,
      'Step 2': 53547,
      'Step 3': 54882
    },
    'APS2': {
      'Step 1': 56554,
      'Step 2': 58032,
      'Step 3': 59520
    },
    'APS3': {
      'Step 1': 61461,
      'Step 2': 63066,
      'Step 3': 64680
    },
    'APS4': {
      'Step 1': 67026,
      'Step 2': 68758,
      'Step 3': 70500
    },
    'APS5': {
      'Step 1': 73273,
      'Step 2': 75149,
      'Step 3': 77043
    },
    'APS6': {
      'Step 1': 81520,
      'Step 2': 83596,
      'Step 3': 85687
    },
    'EL1': {
      'Step 1': 99962,
      'Step 2': 104158,
      'Step 3': 109848
    },
    'EL2': {
      'Step 1': 125759,
      'Step 2': 132050,
      'Step 3': 138349
    }
  }
};

// Agency data structure with actual wage increases
export const AGENCIES = {
  'APS': {
    name: 'Australian Public Service Commission',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 4.0 }, // 2024-25 EA
      { year: 2025, wage: 3.8 }, // 2024-25 EA
      { year: 2026, wage: 3.4 }, // Projected
      { year: 2027, wage: 3.2 }, // Projected
      { year: 2028, wage: 3.0 }, // Projected
      { year: 2029, wage: 2.8 }, // Projected
      { year: 2030, wage: 2.8 }  // Projected
    ]
  },
  'Defence': {
    name: 'Department of Defence',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 4.2 }, // 2024-25 EA
      { year: 2025, wage: 4.0 }, // 2024-25 EA
      { year: 2026, wage: 3.6 }, // Projected
      { year: 2027, wage: 3.4 }, // Projected
      { year: 2028, wage: 3.2 }, // Projected
      { year: 2029, wage: 3.0 }, // Projected
      { year: 2030, wage: 3.0 }  // Projected
    ]
  },
  'ATO': {
    name: 'Australian Taxation Office',
    data: [
      { year: 2015, wage: 1.5 }, // 2014-17 EA
      { year: 2016, wage: 2.0 }, // 2014-17 EA
      { year: 2017, wage: 2.0 }, // 2014-17 EA
      { year: 2018, wage: 2.0 }, // 2017-20 EA
      { year: 2019, wage: 2.0 }, // 2017-20 EA
      { year: 2020, wage: 2.0 }, // 2017-20 EA
      { year: 2021, wage: 1.5 }, // 2020-23 EA
      { year: 2022, wage: 3.0 }, // 2020-23 EA
      { year: 2023, wage: 3.0 }, // 2020-23 EA
      { year: 2024, wage: 3.8 }, // 2024-25 EA
      { year: 2025, wage: 3.6 }, // 2024-25 EA
      { year: 2026, wage: 3.2 }, // Projected
      { year: 2027, wage: 3.0 }, // Projected
      { year: 2028, wage: 2.8 }, // Projected
      { year: 2029, wage: 2.6 }, // Projected
      { year: 2030, wage: 2.6 }  // Projected
    ]
  }
};

// ABS CPI data for June quarter
export const CPIData = {
  2015: { value: 1.5, isProjected: false },
  2016: { value: 1.0, isProjected: false },
  2017: { value: 1.9, isProjected: false },
  2018: { value: 2.1, isProjected: false },
  2019: { value: 1.6, isProjected: false },
  2020: { value: -0.3, isProjected: false },
  2021: { value: 3.8, isProjected: false },
  2022: { value: 6.1, isProjected: false },
  2023: { value: 6.0, isProjected: false },
  2024: { value: 3.8, isProjected: false },
  2025: { value: 2.8, isProjected: true },
  2026: { value: 2.5, isProjected: true },
  2027: { value: 2.5, isProjected: true },
  2028: { value: 2.5, isProjected: true },
  2029: { value: 2.5, isProjected: true },
  2030: { value: 2.5, isProjected: true }
}; 