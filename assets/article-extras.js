/* CLC article extras: table of contents + share (EN/HI). No tracking, no external calls. */
(()=>{
  const art=document.querySelector('article.artc');
  if(!art)return;
  const hi=(document.documentElement.lang||'').startsWith('hi');
  const T=hi?{toc:'इस लेख में',share:'यह जानकारी परिवार या मित्रों को भेजें',wa:'WhatsApp पर भेजें',copy:'लिंक कॉपी करें',copied:'लिंक कॉपी हो गया',more:'और तरीके से भेजें'}
            :{toc:'In this article',share:'Share this guide with family or friends',wa:'Share on WhatsApp',copy:'Copy link',copied:'Link copied',more:'More ways to share'};
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
  // 2) Share box
  if(!art.querySelector('.artc-share')){
    const url=location.origin+location.pathname,title=(document.querySelector('h1')||{}).textContent||document.title;
    const wa='https://wa.me/?text='+encodeURIComponent(title.trim()+'\n'+url);
    const box=document.createElement('div');
    box.className='artc-rel artc-share';
    box.innerHTML=`<p><b>${T.share}</b></p><div class="artc-share-b"><a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">${T.wa}</a><button type="button" class="btn btn-outline" data-act="copy">${T.copy}</button>${navigator.share?`<button type="button" class="btn btn-outline" data-act="native">${T.more}</button>`:''}</div>`;
    const disc=art.querySelector('.artc-disc');
    art.insertBefore(box,disc||null);
    box.addEventListener('click',async e=>{
      const b=e.target.closest('button[data-act]');if(!b)return;
      if(b.dataset.act==='native'){try{await navigator.share({title:title.trim(),url});}catch(_){}return;}
      try{await navigator.clipboard.writeText(url);}catch(_){const i=document.createElement('input');i.value=url;document.body.appendChild(i);i.select();try{document.execCommand('copy')}catch(__){}i.remove();}
      b.textContent=T.copied;setTimeout(()=>{b.textContent=T.copy},1800);
    });
  }
})();
