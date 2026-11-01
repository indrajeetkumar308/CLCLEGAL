(() => {
  'use strict';
  const mount=document.getElementById('clc-article-tts');
  const article=document.querySelector('article.artc');
  if (!mount || !article) return;
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    mount.hidden=true;
    return;
  }
  const synth=window.speechSynthesis;
  const pageLang=document.documentElement.lang.toLowerCase().startsWith('hi')?'hi':'en';
  const words={
    en:{heading:'Listen to this article',language:'Language',play:'Play',pause:'Pause',resume:'Resume',stop:'Stop',playing:'Playing',paused:'Paused',stopped:'Stopped',loading:'Loading article',error:'Article audio is unavailable',missing:{hi:'Hindi voice not available on this device',en:'English voice not available on this device'}},
    hi:{heading:'यह लेख सुनें',language:'भाषा',play:'सुनें',pause:'रोकें',resume:'जारी रखें',stop:'बंद करें',playing:'चल रहा है',paused:'रुका हुआ है',stopped:'बंद',loading:'लेख खोला जा रहा है',error:'लेख सुनना उपलब्ध नहीं है',missing:{hi:'इस डिवाइस पर हिन्दी आवाज़ उपलब्ध नहीं है',en:'इस डिवाइस पर अंग्रेज़ी आवाज़ उपलब्ध नहीं है'}}
  }[pageLang];
  let selected=pageLang;
  try {const saved=localStorage.getItem('clc-tts-lang');if(saved==='en'||saved==='hi')selected=saved;} catch(_) {}
  mount.innerHTML='<div class="clc-tts-heading"><span aria-hidden="true">🔊</span> '+words.heading+'</div><div class="clc-tts-controls"><label for="clc-tts-language">'+words.language+'</label><select id="clc-tts-language"><option value="en">English</option><option value="hi">हिन्दी</option></select><button type="button" id="clc-tts-play" disabled>'+words.play+'</button><button type="button" id="clc-tts-stop" disabled>'+words.stop+'</button></div><p id="clc-tts-status" role="status" aria-live="polite"></p>';
  const select=mount.querySelector('select'),play=mount.querySelector('#clc-tts-play'),stop=mount.querySelector('#clc-tts-stop'),status=mount.querySelector('#clc-tts-status');
  select.value=selected;
  play.setAttribute('aria-label',words.play);
  stop.setAttribute('aria-label',words.stop);
  let voices=[],voiceCheckComplete=false,active=false,paused=false,run=0,index=0,chunks=[],voice=null;
  function voiceFor(lang){const matches=voices.filter(v=>v.lang.toLowerCase().startsWith(lang+'-')||v.lang.toLowerCase()===lang);return matches.find(v=>v.lang.toLowerCase()===lang+'-in')||matches[0]||null;}
  function reset(message=''){
    active=false;paused=false;chunks=[];index=0;voice=null;play.textContent=words.play;play.setAttribute('aria-label',words.play);stop.disabled=true;status.textContent=message;
  }
  function stopSpeech(message=''){
    ++run;synth.cancel();reset(message);
  }
  function refreshVoices(){
    const loaded=synth.getVoices();
    if(loaded.length) voices=loaded;
    for(const lang of ['en','hi']) {
      const option=select.querySelector('option[value="'+lang+'"]');
      option.disabled=(voices.length>0 || voiceCheckComplete)&&!voiceFor(lang);
    }
    play.disabled=!voices.length||!voiceFor(select.value);
    if((voices.length || voiceCheckComplete)&&!voiceFor(select.value)){
      status.textContent=words.missing[select.value];
      stopSpeech(words.missing[select.value]);
    } else if(!active)status.textContent='';
  }
  const onVoices=()=>refreshVoices();
  synth.addEventListener?.('voiceschanged',onVoices);
  refreshVoices();
  // Some engines expose their voice list after DOM ready, without firing voiceschanged.
  if(!voices.length) {
    const retry=setInterval(()=>{refreshVoices();if(voices.length)clearInterval(retry);},300);
    setTimeout(()=>{clearInterval(retry);voiceCheckComplete=true;refreshVoices();},4500);
  }
  function readingText(doc){
    const main=doc.querySelector('article.artc'),heading=doc.querySelector('h1');
    if(!main||!heading)throw new Error('Missing published article');
    const items=[heading.textContent.trim()];
    const walker=doc.createTreeWalker(main,NodeFilter.SHOW_ELEMENT);
    let el;
    while((el=walker.nextNode())){
      if(el.matches('p.artc-rel, .artc-rel, script, style, nav, .clc-tts')) continue;
      if(!el.matches('h2,h3,h4,h5,h6,p,li,summary'))continue;
      if(el.closest('.artc-rel')||el.closest('p.artc-rel'))continue;
      if(el.matches('p')&&el.closest('li'))continue;
      if(el.matches('p')&&el.closest('details')&&!el.closest('details[open]')) {
        // The text of closed FAQ answers is still included.
      }
      if(el.matches('li')&&el.querySelector('li'))continue;
      if(el.matches('p')&&el.querySelector('a')&&!el.textContent.replace(/\s+/g,' ').trim().replace(el.querySelector('a')?.textContent.trim()||'','').trim())continue;
      const text=el.textContent.replace(/\s+/g,' ').trim();
      if(text)items.push(text);
    }
    return items.join('\n');
  }
  function sentences(text){
    return (text.match(/[^.!?।\n]+[.!?।]?/g)||[]).map(t=>t.trim()).filter(Boolean).flatMap(t=>{
      if(t.length<=210)return[t];
      const words=t.split(/\s+/),out=[];let part='';
      for(const word of words){if((part+' '+word).length>180&&part){out.push(part);part='';}part+=(part?' ':'')+word;}
      if(part)out.push(part);return out;
    });
  }
  async function sourceFor(lang){
    if(lang===pageLang)return document;
    const alt=document.querySelector('link[rel="alternate"][hreflang="'+lang+'-IN"]');
    if(!alt)throw new Error('No published alternate');
    const url=new URL(alt.href,location.href);
    if(url.origin!==location.origin)throw new Error('Cross-origin alternate');
    const response=await fetch(url.href,{credentials:'same-origin'});
    if(!response.ok)throw new Error('Alternate unavailable');
    return new DOMParser().parseFromString(await response.text(),'text/html');
  }
  function next(token){
    if(token!==run||!active||paused)return;
    if(index>=chunks.length){reset(words.stopped);return;}
    const utterance=new SpeechSynthesisUtterance(chunks[index++]);
    utterance.lang=selected==='hi'?'hi-IN':'en-IN';
    utterance.voice=voice;
    utterance.rate=1;
    utterance.onend=()=>next(token);
    utterance.onerror=e=>{if(token!==run||!active)return;if(e.error==='interrupted'||e.error==='canceled')return;stopSpeech(words.error);};
    synth.speak(utterance);
  }
  select.addEventListener('change',()=>{
    stopSpeech();
    selected=select.value;
    try{localStorage.setItem('clc-tts-lang',selected);}catch(_){}
    refreshVoices();
  });
  play.addEventListener('click',async()=>{
    if(active){
      if(paused){paused=false;synth.resume();play.textContent=words.pause;play.setAttribute('aria-label',words.pause);status.textContent=words.playing;}
      else{paused=true;synth.pause();play.textContent=words.resume;play.setAttribute('aria-label',words.resume);status.textContent=words.paused;}
      return;
    }
    voice=voiceFor(selected);
    if(!voice){status.textContent=words.missing[selected];return;}
    const token=++run;
    play.disabled=true;status.textContent=words.loading;
    try{
      const doc=await sourceFor(selected);
      if(token!==run)return;
      chunks=sentences(readingText(doc));
      if(!chunks.length)throw new Error('Empty article');
      active=true;paused=false;index=0;
      play.textContent=words.pause;play.setAttribute('aria-label',words.pause);
      play.disabled=false;stop.disabled=false;status.textContent=words.playing;
      next(token);
    }catch(_){if(token===run){reset(words.error);refreshVoices();status.textContent=words.error;}}
  });
  stop.addEventListener('click',()=>stopSpeech(words.stopped));
  addEventListener('pagehide',()=>stopSpeech(),{once:true});
})();