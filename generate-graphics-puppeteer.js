const puppeteer = require('puppeteer');
const fs = require('fs');

async function generate() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create an HTML file with the exact styling we need
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500;700&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #111827; /* Dark background */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Montserrat', sans-serif;
      }
      .logo-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .logo-svg {
        /* We will inject SVG content here */
      }
      .title {
        font-weight: 700;
        font-size: 64px;
        letter-spacing: 0.1em;
        margin: 20px 0 0 0;
        text-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
      }
      .subtitle {
        font-weight: 300;
        font-size: 24px;
        letter-spacing: 0.2em;
        color: #9CA3AF;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="logo-container">
      ${fs.readFileSync('assets/icon.svg', 'utf8')}
    </div>
    <div class="title">TURN ZERO</div>
    <div class="subtitle">WHO GOES FIRST?</div>
  </body>
  </html>
  `;
  
  // Set content and wait for fonts to load
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  // --- Generate 512x512 Icon ---
  // Adjust sizing for a 512x512 square
  await page.setViewport({ width: 512, height: 512 });
  await page.addStyleTag({
    content: `
      .logo-container svg { width: 250px; height: 250px; }
      .title { font-size: 42px; margin-top: 10px; }
      .subtitle { font-size: 16px; margin-top: 5px; }
    `
  });
  await page.screenshot({ path: 'playstore-icon.png' });
  console.log('playstore-icon.png generated (512x512 with text)');

  // --- Generate 1024x500 Feature Graphic ---
  // Adjust sizing for 1024x500 landscape
  await page.setViewport({ width: 1024, height: 500 });
  await page.addStyleTag({
    content: `
      body { flex-direction: row; gap: 60px; }
      .logo-container svg { width: 350px; height: 350px; }
      .text-container { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
      .title { font-size: 72px; margin: 0; }
      .subtitle { font-size: 32px; margin-top: 15px; }
    `
  });
  // Wrap text in a container for the landscape layout
  await page.evaluate(() => {
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const container = document.createElement('div');
    container.className = 'text-container';
    document.body.appendChild(container);
    container.appendChild(title);
    container.appendChild(subtitle);
  });
  
  await page.screenshot({ path: 'playstore-feature.png' });
  console.log('playstore-feature.png generated (1024x500 with text)');

  await browser.close();
}
generate().catch(console.error);
