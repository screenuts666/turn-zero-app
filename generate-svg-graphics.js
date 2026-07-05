const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  try {
    const iconSvgContent = fs.readFileSync('assets/icon.svg', 'utf8');
    
    // Extract the inner elements of the icon (remove <svg> tag and background)
    // The logo is roughly x=176 to 336, y=80 to 320. 
    // We can just embed the entire original SVG within an <svg> wrapper or <g> using nested <svg>
    
    // --- 1. 512x512 ICON WITH TEXT ---
    const iconWithTextSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <rect width="512" height="512" fill="#0d0e12" rx="90" />
        <svg x="96" y="20" width="320" height="320">
          <g transform="translate(-96, -40)">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect x="176" y="80" width="160" height="240" rx="12" fill="none" stroke="#374151" stroke-width="4"/>
            <circle cx="256" cy="200" r="18" fill="#ffffff" filter="url(#glow)"/>
            <circle cx="256" cy="200" r="45" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4"/>
            <circle cx="256" cy="200" r="70" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
          </g>
        </svg>
        <text x="256" y="380" font-family="sans-serif" font-weight="bold" font-size="52" fill="white" text-anchor="middle" letter-spacing="4">TURN ZERO</text>
        <text x="256" y="430" font-family="sans-serif" font-weight="300" font-size="20" fill="#9CA3AF" text-anchor="middle" letter-spacing="4">WHO GOES FIRST?</text>
      </svg>
    `;

    await sharp(Buffer.from(iconWithTextSvg))
      .png()
      .toFile('playstore-icon.png');
    console.log('playstore-icon.png created (512x512 with text)');

    // --- 2. 1024x500 FEATURE GRAPHIC ---
    const featureSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
        <rect width="1024" height="500" fill="#111827" />
        
        <svg x="200" y="50" width="400" height="400">
          <g transform="translate(-96, -40)">
            <defs>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect x="176" y="80" width="160" height="240" rx="12" fill="none" stroke="#374151" stroke-width="4"/>
            <circle cx="256" cy="200" r="18" fill="#ffffff" filter="url(#glow2)"/>
            <circle cx="256" cy="200" r="45" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.4"/>
            <circle cx="256" cy="200" r="70" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2"/>
          </g>
        </svg>

        <text x="750" y="240" font-family="sans-serif" font-weight="bold" font-size="64" fill="white" text-anchor="middle" letter-spacing="6">TURN ZERO</text>
        <text x="750" y="300" font-family="sans-serif" font-weight="300" font-size="28" fill="#9CA3AF" text-anchor="middle" letter-spacing="4">WHO GOES FIRST?</text>
      </svg>
    `;

    await sharp(Buffer.from(featureSvg))
      .png()
      .toFile('playstore-feature.png');
    console.log('playstore-feature.png created (1024x500 with text)');

  } catch (err) {
    console.error('Error:', err);
  }
}
generate();
