const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => {
    if (msg.text().includes('CLS shift:')) {
      console.log(msg.text());
    }
  });

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('load', () => {
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log('CLS shift: ' + entry.value + ' | Elements: ' + JSON.stringify(entry.sources?.map(s => s.node?.className || s.node?.tagName)));
            }
        }).observe({type: 'layout-shift', buffered: true});
    });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
  process.exit(0);
})();
