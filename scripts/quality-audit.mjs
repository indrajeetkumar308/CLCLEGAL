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
const summary={
 date:new Date().toISOString(),pages:pages.length,
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
