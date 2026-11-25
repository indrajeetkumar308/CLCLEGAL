/* Insights page: "Which guide fits my situation?" finder + article search (EN/HI). Information only, no advice, no tracking. */
(()=>{
  const groups=[...document.querySelectorAll('section.clc-category-group')];
  if(!groups.length)return;
  const hi=(document.documentElement.lang||'').startsWith('hi');
  const P=hi?'/hi/insights/':'/insights/';
  const L=hi?{
    fH:'कौन-सी जानकारी आपके काम की है?',fS:'2–3 सवालों के जवाब चुनें। यह सिर्फ़ सही लेख तक पहुँचाता है, यह विधिक सलाह नहीं है।',
    back:'← पीछे',again:'फिर से शुरू करें',read:'यह लेख पढ़ें →',
    sPh:'लेख खोजें, जैसे जमानत, दाखिल-खारिज, FIR',sNo:'कोई लेख नहीं मिला। दूसरा शब्द लिखकर देखें।',sCount:n=>n+' लेख मिले'
  }:{
    fH:'Which guide fits your situation?',fS:'Pick 2–3 answers. This only points you to the right guide; it is not legal advice.',
    back:'← Back',again:'Start again',read:'Read this guide →',
    sPh:'Search guides, e.g. bail, mutation, FIR',sNo:'No guide found. Try another word.',sCount:n=>n+' guides found'
  };
  const T=(en,h)=>hi?h:en;
  // Decision tree: node = {q, o:[[label, next]]}; leaf = slug string
  const tree={q:T('What is your problem about?','आपकी समस्या किस बारे में है?'),o:[
    [T('A police case / FIR / complaint case','पुलिस केस / FIR / परिवाद'),{q:T('What is the situation?','स्थिति क्या है?'),o:[
      [T('Got a police notice to appear','पुलिस का हाज़िरी नोटिस मिला'),'police-notice-section-35-bnss-arrest-7-years'],
      [T('I fear arrest, not arrested yet','गिरफ्तारी का डर है, अभी गिरफ्तार नहीं'),'anticipatory-bail-patna-high-court'],
      [T('Warrant, ishtehar or kurki issued','वारंट, इश्तेहार या कुर्की जारी'),'warrant-ishtehar-kurki-proclamation-patna-high-court'],
      [T('Already arrested, bail needed','गिरफ्तार हो चुके हैं, जमानत चाहिए'),'bail-rejected-sessions-court-patna-high-court'],
      [T('In jail, chargesheet not filed in 60/90 days','जेल में हैं, 60/90 दिन में चार्जशीट नहीं आई'),'default-bail-chargesheet-not-filed-60-90-days-bnss'],
      [T('The FIR or complaint is false / baseless','FIR या परिवाद झूठा / बेबुनियाद है'),'fir-quashing-section-528-bnss-patna-high-court'],
      [T('498A case, and we have settled','498A का मामला, समझौता हो गया है'),'498a-compromise-quashing-patna-high-court'],
      [T('Police are not registering my FIR','पुलिस मेरी FIR दर्ज नहीं कर रही'),'police-not-registering-fir-bihar'],
      [T('Convicted by the Sessions Court','सेशन कोर्ट से सज़ा हो गई'),'criminal-appeal-conviction-patna-high-court'],
      [T('Family member held by police without any order','परिवार के सदस्य को बिना आदेश पुलिस ने पकड़ रखा है'),'habeas-corpus-illegal-detention-patna-high-court'],
      [T('Vehicle or house seized in a liquor case','शराब केस में गाड़ी या मकान ज़ब्त'),'liquor-case-vehicle-house-seized-release-bihar'],
      [T('Ganja / smack / cough syrup (NDPS) case','गांजा / स्मैक / कफ सिरप (NDPS) केस'),'ndps-bail-section-37-patna-high-court'],
      [T('Online / cyber fraud','ऑनलाइन / साइबर ठगी'),'cyber-fraud-complaint-india-1930']]}],
    [T('A government job, salary or pension','सरकारी नौकरी, वेतन या पेंशन'),{q:T('What happened?','क्या हुआ?'),o:[
      [T('Parent died in government job: compassionate appointment','सरकारी नौकरी में माता-पिता की मृत्यु: अनुकंपा नियुक्ति'),'compassionate-appointment-bihar-patna-high-court'],
      [T('Recruitment exam / result / selection problem','भर्ती परीक्षा / रिज़ल्ट / चयन में दिक्कत'),'recruitment-exam-result-writ-patna-high-court'],
      [T('Suspended or dismissed','निलंबित या बर्खास्त'),'suspended-dismissed-government-job-writ-patna-high-court'],
      [T('Salary or pension stopped','वेतन या पेंशन रुकी'),'salary-pension-stopped-writ-patna-high-court'],
      [T('Won in High Court, but the order is not followed','हाईकोर्ट में जीते, पर आदेश नहीं माना जा रहा'),'contempt-petition-court-order-not-followed-patna-high-court'],
      [T('Other order of a government office','सरकारी दफ़्तर का कोई और आदेश'),'writ-petition-patna-high-court']]}],
    [T('Land or property','ज़मीन या संपत्ति'),{q:T('What do you need?','आपको क्या चाहिए?'),o:[
      [T('I want to buy land','ज़मीन खरीदनी है'),'buy-land-patna-bihar-simple-guide'],
      [T('Apply for mutation (dakhil-kharij)','दाखिल-खारिज के लिए आवेदन'),'dakhil-kharij-online-apply-bihar'],
      [T('Mutation rejected','दाखिल-खारिज खारिज हो गया'),'dakhil-kharij-appeal-dclr-bihar'],
      [T('Brother / uncle removed my name from jamabandi','भाई / चाचा ने जमाबंदी से मेरा नाम हटाया'),'ancestral-land-share-name-removed-jamabandi-supreme-court'],
      [T('Mutation in someone else\'s name: is my land gone?','किसी और के नाम दाखिल-खारिज: क्या ज़मीन गई?'),'dakhil-kharij-not-proof-of-ownership-supreme-court'],
      [T('CO / DCLR / Commissioner order against me','CO / DCLR / आयुक्त का आदेश मेरे विरुद्ध'),'land-co-dclr-order-patna-high-court-writ-tribunal'],
      [T('Wrong entry in jamabandi','जमाबंदी में गलत प्रविष्टि'),'jamabandi-correction-parimarjan-bihar'],
      [T('Land survey objection','भूमि सर्वे पर आपत्ति'),'bihar-land-survey-objection-appeal'],
      [T('Got an encroachment notice','अतिक्रमण नोटिस मिला'),'encroachment-notice-bihar-what-to-do']]}],
    [T('Divorce or family','तलाक या परिवार'),{q:T('What do you need?','आपको क्या चाहिए?'),o:[
      [T('Divorce','तलाक'),'mutual-consent-vs-contested-divorce-india'],
      [T('Maintenance (monthly support) for wife, children or parents','पत्नी, बच्चों या माता-पिता का भरण-पोषण'),'maintenance-wife-children-parents-section-144-bnss']]}],
    [T('Check my case status','अपने केस का स्टेटस देखना'),'case-status-patna-high-court-district-court-bihar']]};
  const cardOf=slug=>document.querySelector(`a.artcard[href="${P}${slug}/"]`);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // ---- Finder
  const fb=document.createElement('section');fb.className='clc-finder';fb.setAttribute('aria-labelledby','clc-finder-h');
  fb.innerHTML=`<h2 id="clc-finder-h">${L.fH}</h2><p class="clc-finder-sub">${L.fS}</p><div class="clc-finder-body" aria-live="polite"></div>`;
  const body=fb.querySelector('.clc-finder-body');const path=[];
  const render=()=>{
    const node=path.reduce((n,i)=>n.o[i][1],tree);
    const nav=path.length?`<div class="clc-finder-nav"><button type="button" class="clc-finder-link" data-back>${L.back}</button><button type="button" class="clc-finder-link" data-reset>${L.again}</button></div>`:'';
    if(typeof node==='string'){
      const c=cardOf(node),t=c?(c.querySelector('h3')||c).textContent.trim():node,d=c&&c.querySelector('p')?c.querySelector('p').textContent.trim():'';
      body.innerHTML=`<a class="clc-finder-result" href="${P}${node}/"><b>${esc(t)}</b>${d?`<span>${esc(d)}</span>`:''}<em>${L.read}</em></a>${nav}`;return;
    }
    body.innerHTML=`<p class="clc-finder-q">${esc(node.q)}</p><div class="clc-finder-opts">${node.o.map((o,i)=>`<button type="button" class="clc-finder-opt" data-i="${i}">${esc(o[0])}</button>`).join('')}</div>${nav}`;
  };
  body.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.i!=null)path.push(+b.dataset.i);else if('back' in b.dataset)path.pop();else if('reset' in b.dataset)path.length=0;
    render();const f=body.querySelector('button,a');if(f)f.focus({preventScroll:true});});
  render();
  // ---- Search
  const sb=document.createElement('div');sb.className='clc-search';
  sb.innerHTML=`<label class="clc-sr" for="clc-q">${L.sPh}</label><input id="clc-q" type="search" placeholder="${L.sPh}" autocomplete="off"><p class="clc-search-msg" aria-live="polite"></p>`;
  const first=groups[0];first.parentNode.insertBefore(fb,first);first.parentNode.insertBefore(sb,first);
  const q=sb.querySelector('input'),msg=sb.querySelector('.clc-search-msg');
  const norm=s=>s.toLowerCase().normalize('NFC').replace(/[-–—]/g,' ');
  q.addEventListener('input',()=>{
    const words=norm(q.value).split(/\s+/).filter(Boolean);let n=0;
    groups.forEach(g=>{let any=false;
      g.querySelectorAll('a.artcard').forEach(c=>{const ok=!words.length||words.every(w=>norm(c.textContent).includes(w));c.hidden=!ok;if(ok){any=true;n++;}});
      g.querySelectorAll('div[style*="height:16px"]').forEach(d=>d.hidden=!!words.length);
      g.hidden=!any;});
    fb.hidden=!!words.length;
    msg.textContent=words.length?(n?L.sCount(n):L.sNo):'';
  });
})();
