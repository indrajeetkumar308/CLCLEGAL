import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
let failed=false;
for(const lang of ['','hi/']){
 const page=await browser.newPage();
 await page.setViewport({width:390,height:844,isMobile:true,deviceScaleFactor:2,hasTouch:true});
 const errs=[];page.on('pageerror',e=>errs.push(String(e)));
 await page.evaluateOnNewDocument(()=>localStorage.setItem('clc-ga4-consent-v1','no'));
 const response=await page.goto('http://127.0.0.1:8765/'+lang,{waitUntil:'load'});
 console.log('LOAD',lang,response?.status(),page.url(),(await page.content()).slice(0,240));
 const data=await page.evaluate(()=>{
  const gate=document.querySelector('#gate'),ck=document.querySelector('#gate-ck');
  return {gateShown:gate?!gate.hidden:null,focused:document.activeElement===ck,menu:!!document.querySelector('#menu'),style:document.querySelector('#hdr')?getComputedStyle(document.querySelector('#hdr')).display:null,hasGateHtml:document.documentElement.outerHTML.includes('id="gate"'),bodyStart:document.body?.outerHTML.slice(0,400)};
 });
 console.log('DOM',JSON.stringify(data));
 if(!data.gateShown||!data.focused||!data.menu)throw Error(lang+' gate broken '+JSON.stringify(data));
 await page.click('#gate-ck');await page.click('#gate-go');
 console.log('AFTER ACCEPT',page.url(),(await page.content()).slice(0,200));
 const accepted=await page.evaluate(()=>document.querySelector('#gate').hidden&&document.querySelector('#app').inert===false);
 if(!accepted)throw Error(lang+' consent not accepted');
 await page.click('#menu');
 if(!(await page.$eval('#links',el=>el.classList.contains('open'))))throw Error(lang+' menu broken');
 await page.click('#dd-btn');
 if(!(await page.$eval('#dd',el=>el.classList.contains('open'))))throw Error(lang+' submenu broken');
 await page.evaluate(()=>document.querySelector('#app').click());
 if(await page.$eval('#links',el=>el.classList.contains('open')))throw Error(lang+' outside click broken');
 await page.type('#q-name','Test Citizen');
 await page.type('#q-phone','9999999999');
 await page.click('#q-ack');
 await page.$eval('#intake',form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 if(!(await page.$('#q-done')))throw Error(lang+' form broken');
 if(errs.length)throw Error(lang+' JS errors '+errs.join(';'));
 console.log(lang||'en/','passes gate, menu, submenu, outside tap, contact form');
 await page.close();
}
await browser.close();
