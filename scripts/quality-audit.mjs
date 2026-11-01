#!/usr/bin/env node
// Static site health checks: zero runtime dependencies, no client data.
import fs from 'node:fs';
import path from 'node:path';
const walk=(root)=>fs.readdirSync(root,{withFileTypes:true}).flatMap(d=>{
 const p=path.join(root,d.name);
 if(['.git','node_modules','reports'].includes(d.name))return [];
 return d.isDirectory()?walk(p):[p];
});
const exists=p=>fs.existsSync(path.resolve(process.cwd(),p));
const pages=walk('.').filter(p=>p.endsWith('.html'));
const results=[];
for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 const problems=[];
 if(!/<html\b[^>]*lang="(?:en|hi)(?:-[A-Z]+)?"/i.test(html))problems.push('missing-html-lang');
 if(!/<title>[^<]+<\/title>/i.test(html))problems.push('missing-title');
 if(!/<h1\b/i.test(html))problems.push('missing-h1');
 if(!/<link\b[^>]*rel="canonical"/i.test(html))problems.push('missing-canonical');
 // Validate all embedded schema.org JSON-LD instead of trusting string substitutions.
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try {JSON.parse(m[1]);} catch {problems.push('invalid-json-ld');}
 }
 const buttons=[...html.matchAll(/<button\b[^>]*id="([^"]+)"[^>]*>/gi)];
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
 for(const m of buttons){
  const controls=(m[0].match(/\baria-controls="([^"]+)"/)||[])[1];
  if(controls && !ids.has(controls))problems.push('aria-controls-missing-target:'+controls);
 }
 for(const m of html.matchAll(/<img\b[^>]*>/gi)){
  if(!/\balt\s*=/.test(m[0]))problems.push('image-without-alt');
 }
 for(const m of html.matchAll(/<a\b[^>]*>/gi)){
  const tag=m[0],href=(tag.match(/\bhref="([^"]*)"/)||[])[1];
  if(/target="_blank"/.test(tag)&&!/rel="[^"]*noopener/.test(tag))problems.push('new-window-without-noopener');
  if(!href||!href.startsWith('/')||href.startsWith('//'))continue;
  const loc=href.split(/[?#]/,1)[0];if(!loc)continue;
  const target=decodeURIComponent(loc).replace(/^\//,'');
  const targetFile=loc.endsWith('/')?path.join(target,'index.html'):target;
  if(!exists(targetFile))problems.push('missing-link:'+loc);
 }
 results.push({file,issues:[...new Set(problems)]});
}
// Technical article SEO: canonical language and bilingual alternate coverage.
for(const file of pages.filter(p=>/(^|\\/)(?:hi\\/)?insights\\/[^/]+\\/index\\.html$/.test(p.replaceAll('\\\\','/')))){
 const html=fs.readFileSync(file,'utf8');
 const match=html.match(/<html\\b[^>]*lang="(en|hi)(?:-[A-Z]+)?"/i);
 const lang=match?.[1];
 const expected=lang==='hi'?'hi-IN':'en-IN';
 const missing=['en-IN','hi-IN'].filter(code=>!new RegExp('<link\\\\b[^>]*rel="alternate"[^>]*hreflang="'+code+'"','i').test(html));
 const canonical=(html.match(/<link\\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)||[])[1];
 if(missing.length || !canonical || !(lang==='hi'?canonical.includes('/hi/insights/'):canonical.includes('/insights/')&&!canonical.includes('/hi/insights/'))){
  const entry=results.find(x=>x.file===file);
  if(entry)entry.issues.push('article-hreflang-or-canonical-mismatch');
 }
}
const reviewTerms=[
 ['english-solicitation',/book a consultation|why clients choose|counsel you can rely on/gi],
 ['hindi-solicitation',/परामर्श हेतु समय लें|मुवक्किल चैम्बर्स को क्यों चुनते हैं|विश्वसनीय विधिक परामर्श/gi],
 ['promotional-claims',/best lawyer|top lawyer|guaranteed success|100% success/gi]
];
const complianceReview=pages.flatMap(file=>{
 const html=fs.readFileSync(file,'utf8');
 return reviewTerms.flatMap(([type,regex])=>{
  const matches=[...html.matchAll(regex)];
  return matches.length?[{file,type,count:matches.length}]:[];
 });
});
const summary={
 date:new Date().toISOString(),pages:pages.length,complianceReview,
 issues:results.filter(r=>r.issues.length),counts:{},
 largestAssets:walk('assets').filter(x=>fs.statSync(x).isFile()).map(x=>({file:x,bytes:fs.statSync(x).size})).sort((a,b)=>b.bytes-a.bytes).slice(0,12)
};
for(const p of results)for(const x of p.issues){const key=x.startsWith('missing-link:')?'missing-link':x;summary.counts[key]=(summary.counts[key]||0)+1;}
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/static-audit.json',JSON.stringify(summary,null,2));
console.log('HTML pages checked:',summary.pages);
console.log('Issues:',JSON.stringify(summary.counts));
for(const x of summary.issues.slice(0,15))console.log(x.file+': '+x.issues.join(', '));
if(summary.counts['missing-link'])process.exitCode=1;
