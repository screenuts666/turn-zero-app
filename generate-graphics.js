const sharp = require('sharp');
async function generate() {
  try {
    // 512x512 Play Store Icon
    await sharp('assets/icon.svg')
      .resize(512, 512)
      .png()
      .toFile('playstore-icon.png');
    console.log('playstore-icon.png created (512x512)');

    // 1024x500 Feature Graphic
    await sharp({
      create: {
        width: 1024,
        height: 500,
        channels: 4,
        background: { r: 17, g: 24, b: 39, alpha: 1 } // #111827 (dark bg)
      }
    })
    .composite([{ input: 'assets/icon.svg', gravity: 'center' }])
    .png()
    .toFile('playstore-feature.png');
    console.log('playstore-feature.png created (1024x500)');

  } catch (err) {
    console.error('Error generating images:', err);
  }
}
generate();
