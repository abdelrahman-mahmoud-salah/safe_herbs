const fs = require('fs');
const dirs = [
  'src/styles',
  'src/scripts',
  'src/components/navbar',
  'src/components/footer',
  'src/pages/home',
  'src/pages/our-story',
  'src/pages/farms',
  'src/pages/contact',
  'src/pages/certificates',
  'src/pages/societal',
  'src/pages/quality',
  'src/pages/safeherbs-herbs',
  'src/pages/safeherbs-certs',
  'public'
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
console.log('All directories created.');
