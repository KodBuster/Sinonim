import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3456';
const chrome = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const browser = await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox']});
const report = {run: new Date().toISOString(), pages:[], issues:[]};
await mkdir('qa/screenshots',{recursive:true});
function problem(route,width,type,detail){report.issues.push({route,width,type,detail});}
async function run(route,width,screenshot){
 const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:'no-preference'});
 const errors=[]; const failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push({status:r.status(),url:r.url().slice(base.length)});});
 const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:40000});
 await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all(Array.from(document.images).map(img=>img.decode().catch(()=>{})));});
 const data=await page.evaluate(()=>{
  const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;const b=el.getBoundingClientRect();return {left:Math.round(b.left),top:Math.round(b.top),width:Math.round(b.width),height:Math.round(b.height)};};
  const imgs=[...document.images];
  const outside=[...document.querySelectorAll('.sn-root *')].filter(e=>{if(e.closest('.sn-drawer,.sn-category-pills,.sn-best-sellers-viewport,.sn-best-sellers-skeleton,.sn-social-viewport,.sn-collection-chips'))return false;const b=e.getBoundingClientRect();const css=getComputedStyle(e);return b.width>0&&b.height>0&&css.position!=='fixed'&&(b.left < -3||b.right>innerWidth+3);}).slice(0,12).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className.slice(0,70):'',right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left)}));
  const clipped=[...document.querySelectorAll('.sn-hero-slide.is-active h2,.sn-category>span,.sn-logo,.sn-navigation,.sn-heading')].filter(e=>e.scrollWidth>e.clientWidth+3).map(e=>({tag:e.tagName,className:e.className,scroll:e.scrollWidth,client:e.clientWidth}));
  return {docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,docHeight:document.documentElement.scrollHeight,logo:rect('.sn-logo'),header:rect('.sn-header'),hero:rect('.sn-single-hero'),slideCount:document.querySelectorAll('.sn-hero-slide').length,activeSlides:document.querySelectorAll('.sn-hero-slide.is-active').length,mainSectionOrder:[...document.querySelector('main')?.children||[]].map(e=>typeof e.className==='string'?e.className:''),categories:rect('.sn-category-grid'),promos:rect('.sn-promo-grid'),journal:rect('.sn-journal-grid'),brokenImages:imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),imageCount:imgs.length,outside,clipped,video:[...document.querySelectorAll('.sn-hero-video')].map(e=>({readyState:e.readyState,error:e.error?.message||null,src:e.querySelector('source')?.getAttribute('src')}))};
 });
 report.pages.push({route,width,status:response.status(),data,failed,errors});
 if(data.docWidth>width+2||data.bodyWidth>width+2)problem(route,width,'overflow',String(data.docWidth)+'/'+String(data.bodyWidth));
 if(data.brokenImages.length)problem(route,width,'brokenImages',data.brokenImages);
 if(data.outside.length)problem(route,width,'outsideViewport',data.outside);
 if(data.clipped.length)problem(route,width,'clippedText',data.clipped);
 if(errors.length)problem(route,width,'jsErrors',errors);
 if(failed.length)problem(route,width,'failedRequests',failed);
 if(route==='/redesign-preview'){
  if(data.slideCount!==3||data.activeSlides!==1||!data.hero)problem(route,width,'heroCarousel',{slideCount:data.slideCount,activeSlides:data.activeSlides,hero:data.hero});
  const expected=['sn-single-hero','sn-category-grid','sn-best-sellers','sn-promo-grid','sn-trust','sn-social','sn-container sn-journal'];
  for(const [index,cls] of expected.entries()){
    if(data.mainSectionOrder[index]!==cls)problem(route,width,'sectionOrder',{position:index+1,expected:cls,actual:data.mainSectionOrder[index]});
  }
}
 if(route.startsWith('/redesign-preview/collections/')){
  const names={necklaces:'Колье',rings:'Кольца',bracelets:'Браслеты',earrings:'Серьги'};
  const slug=route.split('/').at(-1);
  const heading=await page.locator('.sn-collection-head h1').innerText().catch(()=>null);
  if(heading?.toLocaleLowerCase('ru-RU')!==names[slug]?.toLocaleLowerCase('ru-RU'))problem(route,width,'categoryTitle',{expected:names[slug],actual:heading});
  for(const selector of ['.sn-collection-crumbs','.sn-collection-chips','.sn-collection-toolbar','.sn-collection-results','.sn-collection-spotlight','.sn-collection-editorial','.sn-collection-faq']){
    if(await page.locator(selector).count()!==1)problem(route,width,'collectionMissingSection',selector);
  }
  const caption=await page.locator('.sn-collection-head>p').innerText().catch(()=>'');
  if(caption.length<20)problem(route,width,'categoryDescriptionMissing',null);
  if(width===390){
    const trigger=page.locator('.sn-collection-toggle');
    await trigger.click();
    if(!await page.locator('.sn-collection-sheet[role="dialog"]').isVisible())problem(route,width,'mobileFilterDrawer','does not open');
    await page.getByRole('button',{name:'Закрыть фильтры'}).click();
    if(await page.locator('.sn-collection-sheet').count()>0)problem(route,width,'mobileFilterDrawer','does not close');
  }
 }
 if(screenshot){const file='qa/screenshots/'+(route.includes('catalog')?'catalog':route.includes('product')?'product':'home')+'-'+width+'.png';await page.screenshot({path:file,fullPage:true,animations:'disabled'});}
 if(route==='/redesign-preview'&&width===390){
  const before=await page.locator('.sn-hero-slide.is-active h2').innerText();
  await page.getByRole('button',{name:'Следующий баннер'}).click();
  const after=await page.locator('.sn-hero-slide.is-active h2').innerText();
  if(before===after)problem(route,width,'heroNextClick','slide did not change');
  const indicators=await page.locator('.sn-hero-dot').count();
  if(indicators!==3)problem(route,width,'heroPaginationCount',indicators);
  await page.locator('.sn-social').scrollIntoViewIfNeeded();
  try {
    await page.waitForFunction(() => {
      const el = document.querySelector('.sn-social-item.is-central video');
      return el && !el.paused && el.readyState >= 2;
    }, null, {timeout:12000});
  } catch {
    const state = await page.locator('.sn-social-item').evaluateAll(nodes =>
      nodes.map(node => ({id:node.getAttribute('data-clip-id'),central:node.classList.contains('is-central'),paused:node.querySelector('video')?.paused,readyState:node.querySelector('video')?.readyState,error:node.querySelector('video')?.error?.message})));
    problem(route,width,'centerVideoAutoplay',state);
  }
  const videosBefore = await page.locator('.sn-social-item').evaluateAll(nodes =>
    nodes.map(node=>({id:node.getAttribute('data-clip-id'),central:node.classList.contains('is-central'),paused:node.querySelector('video')?.paused,muted:node.querySelector('video')?.muted})));
  if(videosBefore.filter(v=>v.paused===false).length!==1 || videosBefore.some(v=>v.paused===false && (!v.central || !v.muted))) problem(route,width,'centerVideoOnlyPlaying',videosBefore);
  const social=page.locator('.sn-social-viewport');
  const prevSocial=await social.evaluate(el=>el.scrollLeft);
  await page.getByRole('button',{name:'Следующие видео'}).click();
  await page.waitForTimeout(500);
  const nextSocial=await social.evaluate(el=>el.scrollLeft);
  if(nextSocial<=prevSocial)problem(route,width,'socialScroll','did not scroll horizontally');
  try {
    await page.waitForFunction(previous => {
      const active = document.querySelector('.sn-social-item.is-central');
      const v = active?.querySelector('video');
      return active?.getAttribute('data-clip-id') !== previous && v && !v.paused && v.readyState >= 2;
    }, videosBefore.find(v=>v.central)?.id, {timeout:12000});
  } catch {
    const state = await page.locator('.sn-social-item').evaluateAll(nodes =>
      nodes.map(node=>({id:node.getAttribute('data-clip-id'),central:node.classList.contains('is-central'),paused:node.querySelector('video')?.paused,readyState:node.querySelector('video')?.readyState})));
    problem(route,width,'autoplayOnCarouselScroll',state);
  }

  await page.getByRole('button',{name:'Открыть меню'}).click();if(!await page.getByRole('navigation',{name:'Мобильное меню'}).isVisible())problem(route,width,'menuOpen','failed');await page.keyboard.press('Escape');if(await page.getByRole('navigation',{name:'Мобильное меню'}).count()>0)problem(route,width,'menuClose','failed');}
 console.log('SN_VISUAL_QA '+JSON.stringify({route,width,status:response.status(),docWidth:data.docWidth,hero:data.hero,sections:data.mainSectionOrder,brokenImages:data.brokenImages,video:data.video,outside:data.outside,clipped:data.clipped,failed,errors}));
 await page.close();
}
try{for(const width of [360,390,768,820,1024,1440,1920])await run('/redesign-preview',width,[390,820,1440].includes(width));for(const width of [390,820,1440])await run('/redesign-preview/catalog',width,[390,1440].includes(width));for(const width of [390,1440])await run('/redesign-preview/product/test-unknown',width,false);for(const category of ['necklaces','rings','bracelets','earrings'])for(const width of [390,820,1440])await run('/redesign-preview/collections/'+category,width,[390,1440].includes(width));}finally{await browser.close();}
await writeFile('qa/report.json',JSON.stringify(report,null,2));
console.log('SN_VISUAL_QA_ISSUES '+JSON.stringify(report.issues));
if(report.issues.length)process.exitCode=1;
