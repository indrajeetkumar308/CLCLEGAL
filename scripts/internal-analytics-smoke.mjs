// Browser regression checks for optional GA4 and internal device opt-out.
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
const origin='http://127.0.0.1:8765';
try {
 for(const width of [390,1440]) for(const route of ['/','/hi/','/property-lawyer-patna/','/hi/property-lawyer-patna/']){
  const page=await browser.newPage();
  await page.setViewport({width,height:850});
  const errors=[],ga=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setRequestInterception(true);
  page.on('request',req=>{
   if(/(?:googletagmanager\.com|google-analytics\.com)/.test(req.url())){ga.push(req.url());req.abort();}
   else req.continue();
  });
  const load=async suffix=>{await page.goto(origin+route+suffix,{waitUntil:'networkidle0'});await page.evaluate(()=>{sessionStorage.setItem('clc-gate','1')});};
  await load('');
  await page.reload({waitUntil:'networkidle0'});
  assert.equal(ga.length,0,'GA before consent '+route);
  const initial=await page.$('#clc-analytics-consent');
  assert.ok(initial,'Consent panel missing '+route);
  await page.evaluate(()=>document.querySelector('#clc-analytics-consent button:last-child').click());
  assert.equal(ga.length,0,'GA after decline');
  await page.evaluate(()=>document.querySelector('#clc-analytics-settings').click());
  await page.evaluate(()=>document.querySelector('#clc-analytics-consent button:first-of-type').click());
  await page.waitForFunction(()=>window.__clcGa4Started===true);
  assert.ok(ga.length>0,'GA not loaded after accept '+route);
  ga.length=0;
  await load('?internal=1&keep=yes#anchor');
  assert.equal(new URL(page.url()).searchParams.has('internal'),false,'Parameter not removed');
  assert.equal(new URL(page.url()).searchParams.get('keep'),'yes');
  assert.ok(await page.$('#clc-internal-note'),'Footer internal note missing');
  assert.equal(ga.length,0,'GA on internal device '+route);
  await page.evaluate(()=>document.querySelector('#clc-analytics-settings').click());
  await page.evaluate(()=>document.querySelector('#clc-analytics-consent button:first-of-type').click());
  assert.equal(ga.length,0,'GA after internal accept');
  await load('?internal=0');
  assert.equal(await page.evaluate(()=>localStorage.getItem('clc-internal')),null);
  assert.ok(ga.length>0,'GA did not resume on opt-in device '+route);
  assert.deepEqual(errors,[],'Browser errors '+route+' '+width);
  await page.close();
  console.log('PASS',route,width);
 }
} finally {await browser.close();}
