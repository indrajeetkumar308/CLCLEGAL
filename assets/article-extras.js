/* CLC article extras: table of contents + share (EN/HI). No tracking, no external calls. */
(()=>{
  const art=document.querySelector('article.artc');
  if(!art)return;
  const hi=(document.documentElement.lang||'').startsWith('hi');
  const T=hi?{toc:'इस लेख में',share:'यह जानकारी परिवार या मित्रों को भेजें',wa:'शेयर करें',copy:'लिंक कॉपी करें',copied:'लिंक कॉपी हो गया',more:'और तरीके से भेजें'}
            :{toc:'In this article',share:'Share this guide with family or friends',wa:'Share',copy:'Copy link',copied:'Link copied',more:'More ways to share'};
  const slug=s=>s.toLowerCase().replace(/[^\wऀ-ॿ]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'s';
  // 1) Table of contents (only when the article has 4+ sections)
  const hs=[...art.querySelectorAll(':scope > h2')];
  if(hs.length>=4&&!art.querySelector('.artc-toc')){
    const used=new Set();
    const items=hs.map(h=>{let id=h.id||slug(h.textContent);while(used.has(id))id+='-2';used.add(id);h.id=id;return `<li><a href="#${id}">${h.textContent.trim()}</a></li>`;}).join('');
    const nav=document.createElement('nav');
    nav.className='artc-toc';nav.setAttribute('aria-label',T.toc);
    nav.innerHTML=`<details open><summary>${T.toc}</summary><ol>${items}</ol></details>`;
    const first=art.querySelector(':scope > p');
    (first?first:art.firstChild)&&art.insertBefore(nav,first?first.nextSibling:art.firstChild);
    nav.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+t.id);});
  }
  // 2) Share: one icon button (native share sheet, else WhatsApp)
  if(!art.querySelector('.artc-share')){
    const url=location.origin+location.pathname,title=((document.querySelector('h1')||{}).textContent||document.title).trim();
    const box=document.createElement('div');
    box.className='artc-share';
    box.innerHTML=`<button type="button" class="share-ic" aria-label="${T.wa.replace(/WhatsApp/,'').trim()||'Share'}" title="${hi?'शेयर करें':'Share'}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></button>`;
    const place=(tries)=>{
      const tg=document.querySelector('.reader-inner .reader-toggle');
      if(tg){const w=document.createElement('div');w.className='reader-start';tg.parentNode.insertBefore(w,tg);w.appendChild(tg);w.appendChild(box);box.className='artc-share';return;}
      if(tries>0)return setTimeout(()=>place(tries-1),150);
      art.insertBefore(box,art.firstChild);
    };
    place(15);
    box.querySelector('button').addEventListener('click',async()=>{
      if(navigator.share){try{await navigator.share({title,url});}catch(_){}return;}
      window.open('https://wa.me/?text='+encodeURIComponent(title+'\n'+url),'_blank','noopener');
    });
  }
  // 3) Read next: up to 3 guides from the same topic group on the Insights page
  (async()=>{
    try{
      const base=hi?'/hi/insights/':'/insights/',me=location.pathname.replace(/index\.html$/,'');
      const html=await (await fetch(base,{credentials:'same-origin'})).text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const mine=[...doc.querySelectorAll('a.artcard')].find(a=>a.getAttribute('href')===me);
      const grp=mine&&mine.closest('section');if(!grp)return;
      const picks=[...grp.querySelectorAll('a.artcard')].filter(a=>a.getAttribute('href')!==me).slice(0,3);
      if(!picks.length||art.querySelector('.artc-next'))return;
      const box=document.createElement('nav');box.className='artc-next';box.setAttribute('aria-label',hi?'आगे पढ़ें':'Read next');
      box.innerHTML=`<h2>${hi?'आगे पढ़ें':'Read next'}</h2><div class="artc-next-g">`+picks.map(a=>{const h=a.querySelector('h3'),p=a.querySelector('p');const e=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));return `<a class="artcard" href="${e(a.getAttribute('href'))}"><h3>${e(h?h.textContent.trim():'')}</h3><p>${e(p?p.textContent.trim():'')}</p></a>`}).join('')+'</div>';
      const share=art.querySelector('.artc-share'),disc=art.querySelector('.artc-disc');
      art.insertBefore(box,disc||null);
    }catch(_){}
  })();
})();
