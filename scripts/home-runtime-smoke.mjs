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
 // Escape closes both menus and restores focus to the disclosure trigger.
 await page.click('#menu');
 await page.click('#dd-btn');
 await page.focus('#dd-btn');
 await page.keyboard.press('Escape');
 const keyboard=await page.evaluate(()=>({
  focus:document.activeElement?.id,
  expanded:document.getElementById('dd-btn').getAttribute('aria-expanded'),
  controls:document.getElementById('dd-btn').getAttribute('aria-controls'),
  hasPopup:document.getElementById('dd-btn').hasAttribute('aria-haspopup'),
  closed:!document.getElementById('links').classList.contains('open')
 }));
 if(keyboard.focus!=='dd-btn'||keyboard.expanded!=='false'||keyboard.controls!=='dd-menu'||keyboard.hasPopup||!keyboard.closed)throw Error(lang+' Escape/disclosure semantics failed '+JSON.stringify(keyboard));
 await page.type('#q-name','Test Citizen');
 await page.type('#q-phone','9999999999');
 await page.click('#q-ack');
 await page.$eval('#intake',form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 if(!(await page.$('#q-done')))throw Error(lang+' form broken');
 if(errs.length)throw Error(lang+' JS errors '+errs.join(';'));
 console.log(lang||'en/','passes gate, menu, submenu, outside tap, contact form');
 await page.close();
}

for(const path of ['criminal-defence-lawyer-patna/','hi/criminal-defence-lawyer-patna/','citizen-guides/','hi/citizen-guides/']){
 const page=await browser.newPage();
 await page.setViewport({width:390,height:844,isMobile:true,deviceScaleFactor:2,hasTouch:true});
 await page.evaluateOnNewDocument(()=>{
  sessionStorage.setItem('clc-gate','1');
  localStorage.setItem('clc-ga4-consent-v1','no');
 });
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const res=await page.goto('http://127.0.0.1:8765/'+path,{waitUntil:'load'});
 if(res?.status()!==200)throw Error(path+' unexpected HTTP '+res?.status());
 await page.click('#menu');
 await page.click('#dd-btn');
 await page.focus('#dd-btn');
 await page.keyboard.press('Escape');
 const result=await page.evaluate(()=>({
  trigger:document.activeElement?.id,
  expanded:document.querySelector('#dd-btn')?.getAttribute('aria-expanded'),
  controls:document.querySelector('#dd-btn')?.getAttribute('aria-controls'),
  hasPopup:document.querySelector('#dd-btn')?.hasAttribute('aria-haspopup'),
  menuClosed:!document.querySelector('#links')?.classList.contains('open')
 }));
 if(result.trigger!=='dd-btn'||result.expanded!=='false'||result.controls!=='dd-menu'||result.hasPopup||!result.menuClosed||errors.length)throw Error(path+' inner-page nav failed '+JSON.stringify({result,errors}));
 console.log(path,'passes disclosure keyboard navigation');
 await page.close();
}

await browser.close();
