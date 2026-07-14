import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      // The legacy course sites are the migration source, not our code.
      'websites/**',
      'product-development-framework-with-ai/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
