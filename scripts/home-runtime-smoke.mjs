import puppeteer from 'puppeteer-core';
const browser=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
let failed=false;
for(const lang of ['','hi/']){
 const page=await browser.newPage();
 await page.setViewport({width:390,height:844,isMobile:true,deviceScaleFactor:2,hasTouch:true});
 const errs=[];page.on('pageerror',e=>errs.push(String(e)));
 await page.goto('http://localhost:8765/'+lang,{waitUntil:'load'});
 const data=await page.evaluate(()=>{
  const gate=document.querySelector('#gate'),ck=document.querySelector('#gate-ck');
  return {gateShown:!gate.hidden,focused:document.activeElement===ck,menu:!!document.querySelector('#menu'),style:getComputedStyle(document.querySelector('#hdr')).display};
 });
 if(!data.gateShown||!data.focused||!data.menu)throw Error(lang+' gate broken '+JSON.stringify(data));
 await page.click('#gate-ck');await page.click('#gate-go');
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
