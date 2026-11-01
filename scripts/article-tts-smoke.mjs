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
  if(!sessionStorage.getItem('tts-test-started')){localStorage.removeItem('clc-tts-lang');sessionStorage.setItem('tts-test-started','1');}
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
 const toolbar=await page.$eval('#clc-article-tts',el=>!!el.closest('#clc-reader .reader-inner'));
 if(!toolbar)throw Error('Audio player must be beside Reading Mode');
 await page.screenshot({path:'reports/article-tts/'+lang+'-'+width+'.png',fullPage:false});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
 if(overflow)throw Error(lang+width+' horizontal overflow');
 const position=()=>page.evaluate(()=>{const r=document.querySelector('#clc-tts-play').getBoundingClientRect();const t=document.querySelector('#clc-reader').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,toolbarHeight:t.height,scroll:document.documentElement.scrollWidth,viewport:innerWidth};});
 const before=await position();
 const initial=await page.$eval('#clc-tts-language',e=>e.value);
 if(initial!==lang)throw Error('Wrong default language: '+initial);
 await page.click('#clc-tts-play');
 await page.waitForFunction(()=>window.__utterances.length>0);
 const spoken=await page.evaluate(()=>window.__utterances[0]);
 if(spoken.lang!==(lang==='hi'?'hi-IN':'en-IN'))throw Error('Wrong spoken language');
 const playingPosition=await position();
 await page.click('#clc-tts-play'); // pause
 const paused=await page.$eval('#clc-tts-status',e=>e.textContent);
 if(!paused)throw Error('Pause not announced');
 const pausedPosition=await position();
 await page.click('#clc-tts-play'); // resume
 const resumedPosition=await position();
 const positions=[before,playingPosition,pausedPosition,resumedPosition];
 if(positions.some(p=>Math.abs(p.x-before.x)>1||Math.abs(p.y-before.y)>1||Math.abs(p.w-before.w)>1||Math.abs(p.toolbarHeight-before.toolbarHeight)>1||p.scroll>p.viewport))throw Error('Audio controls shift on '+lang+' '+width+': '+JSON.stringify(positions));
 await page.click('#clc-tts-stop');
 const stopped=await page.$eval('#clc-tts-status',e=>e.textContent);
 if(!stopped)throw Error('Stop not announced');
 const other=lang==='hi'?'en':'hi';
 // In the local HTTP test server, point production hreflang URLs at the same local origin.
 await page.evaluate(()=>document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link=>{
  const target=new URL(link.href);if(target.hostname==='clclegal.in')link.href=location.origin+target.pathname;
 }));
 await page.click('.reader-toggle');
 await page.select('#clc-tts-language',other);
 await page.waitForFunction(expected=>location.pathname.startsWith(expected),{},other==='hi'?'/hi/insights/':'/insights/');
 await page.waitForSelector('#clc-tts-language');
 const visible=await page.evaluate(()=>({
  lang:document.documentElement.lang,
  selection:document.querySelector('#clc-tts-language')?.value,
  title:document.querySelector('h1')?.textContent,
  reading:document.documentElement.classList.contains('clc-reading'),
  stored:localStorage.getItem('clc-tts-lang')
 }));
 if(!visible.lang.startsWith(other)||visible.selection!==other||!visible.reading||visible.stored!==other)throw Error('Visible article language/reading mode mismatch '+JSON.stringify(visible));
 if(errors.length)throw Error('Article navigation page errors '+errors.join('; '));
 await page.click('#clc-tts-play');
 await page.waitForFunction(()=>window.__utterances.length>0);
 const alternate=await page.evaluate(()=>window.__utterances.at(-1));
 if(alternate.lang!==(other==='hi'?'hi-IN':'en-IN'))throw Error('New article speech language wrong');
 await page.click('#clc-tts-stop');
 if(errors.length)throw Error(lang+width+' console errors: '+errors.join('; '));
 console.log(lang,width,'pass',spoken.lang,alternate.lang,'overflow',overflow);
 await page.close();
}
await browser.close();
