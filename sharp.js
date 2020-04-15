const sharp = require('sharp');

sharp('input.svg')
  .resize(300, 200)
  .toFile('output.svg', function (err) {
    console.log('Having prob', err);
  });
