import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const browser=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
fs.mkdirSync('reports/article-tts',{recursive:true});
for(const lang of ['en','hi'])for(const width of [390,1440]){
 const page=await browser.newPage();
 await page.setViewport({width,height:850,deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.evaluateOnNewDocument(()=>{
  sessionStorage.setItem('clc-gate','1');
  localStorage.setItem('clc-ga4-consent-v1','no');
  window.__utterances=[];
  const fake={
   paused:false,
   getVoices:()=>[{name:'Test English',lang:'en-IN'},{name:'Test Hindi',lang:'hi-IN'}],
   speak:u=>{window.__utterances.push({text:u.text,lang:u.lang});},
   cancel:()=>{fake.paused=false;},
   pause:()=>{fake.paused=true;},
   resume:()=>{fake.paused=false;},
   addEventListener:()=>{}
  };
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:fake});
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
 });
 const url='http://127.0.0.1:8765/'+(lang==='hi'?'hi/':'')+'insights/dakhil-kharij-appeal-dclr-bihar/';
 const res=await page.goto(url,{waitUntil:'load'});
 if(res.status()!==200)throw Error(url+': HTTP '+res.status());
 await page.waitForSelector('#clc-tts-play:not([disabled])');
 await page.screenshot({path:'reports/article-tts/'+lang+'-'+width+'.png',fullPage:false});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
 if(overflow)throw Error(lang+width+' horizontal overflow');
 const initial=await page.$eval('#clc-tts-language',e=>e.value);
 if(initial!==lang)throw Error('Wrong default language: '+initial);
 await page.click('#clc-tts-play');
 await page.waitForFunction(()=>window.__utterances.length>0);
 const spoken=await page.evaluate(()=>window.__utterances[0]);
 if(spoken.lang!==(lang==='hi'?'hi-IN':'en-IN'))throw Error('Wrong spoken language');
 await page.click('#clc-tts-play'); // pause
 const paused=await page.$eval('#clc-tts-status',e=>e.textContent);
 if(!paused)throw Error('Pause not announced');
 await page.click('#clc-tts-play'); // resume
 await page.click('#clc-tts-stop');
 const stopped=await page.$eval('#clc-tts-status',e=>e.textContent);
 if(!stopped)throw Error('Stop not announced');
 const other=lang==='hi'?'en':'hi';
 await page.select('#clc-tts-language',other);
 await page.click('#clc-tts-play');
 await page.waitForFunction(()=>window.__utterances.length>1);
 const alternate=await page.evaluate(()=>window.__utterances.at(-1));
 if(alternate.lang!==(other==='hi'?'hi-IN':'en-IN'))throw Error('Alternate language not spoken');
 const local=await page.evaluate(()=>localStorage.getItem('clc-tts-lang'));
 if(local!==other)throw Error('Language choice not saved');
 await page.click('#clc-tts-stop');
 if(errors.length)throw Error(lang+width+' console errors: '+errors.join('; '));
 console.log(lang,width,'pass',spoken.lang,alternate.lang,'overflow',overflow);
 await page.close();
}
await browser.close();
