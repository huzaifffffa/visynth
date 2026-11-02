import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try {
for(const mode of process.argv[2] ? [Number(process.argv[2])] : [0,1,2]) {
 const mobile=mode>0;
 console.log('Testing', mobile ? 'mobile' : 'desktop');
 const context=await browser.newContext({viewport:{width:mobile?375:1440,height:mobile?812:900},hasTouch:mobile,isMobile:mobile,reducedMotion:mode===2?'reduce':'no-preference'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3110/',{waitUntil:'load'});
 await page.waitForFunction(()=>document.documentElement.classList.contains('visynth-preloaded'));
 await page.waitForFunction(()=>document.documentElement.scrollHeight>innerHeight*3);
 await page.evaluate(()=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.51));
 await page.waitForTimeout(1600);
 const card=page.locator('.works-wheel-card[aria-hidden="false"]').first();
 await card.hover({force:true});
 assert.equal(await page.locator('.project-editorial-backdrop[data-open="true"]').count(),0,'Hover must not open a preview');
 const initial=await card.evaluate(e=>({width:e.offsetWidth,height:e.offsetHeight,face:getComputedStyle(e.firstElementChild).transform}));
 await page.mouse.wheel(0,40);await page.waitForTimeout(1800);
 assert.equal(await page.locator('.project-editorial-backdrop[data-open="true"]').count(),0,'Wheel must not open a preview');
 for(let i=0;i<4;i++) {
  const current=page.locator('.works-wheel-card[aria-hidden="false"]').first();
  await current.focus();await current.press('Enter');
  console.log('open',mobile,i,await page.evaluate(()=>({scrollY,active:document.activeElement?.getAttribute('aria-label'),preview:document.querySelector('.project-editorial-backdrop')?.getAttribute('data-open')})));
  await page.locator('.project-editorial-backdrop[data-open="true"]').waitFor({state:'visible'});
  try { await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Close project preview',{timeout:5000}); }
  catch(error) { console.log('focus diagnostics',await page.evaluate(()=>{const b=document.querySelector('.project-editorial-close');return {inert:b?.closest('[inert]')?.outerHTML.slice(0,300),visibility:b&&getComputedStyle(b).visibility,rect:b?.getBoundingClientRect().toJSON(),dialog:document.querySelector('.project-editorial-backdrop')?.outerHTML.slice(0,500),active:document.activeElement?.outerHTML.slice(0,300)}}));throw error; }
  assert.equal(await page.locator('.project-editorial-backdrop[data-open="true"]').count(),1);
  await page.getByRole('button',{name:'Close project preview'}).press('Escape');
  await page.locator('.project-editorial-backdrop[data-open="true"]').waitFor({state:'hidden'});
  await page.waitForFunction(()=>!document.querySelector('.project-editorial-backdrop')?.open);
 }
 const point=await page.evaluate(()=>{for(let y=160;y<innerHeight-100;y+=10)for(let x=Math.floor(innerWidth*.4);x<innerWidth*.7;x+=10){const e=document.elementFromPoint(x,y);const card=e?.closest('.works-wheel-card');if(card&&!e.closest('button,a'))return {x,y,index:Array.from(document.querySelectorAll('.works-wheel-card')).indexOf(card)}}return null});
 assert.ok(point,'A carousel card must have a real clickable surface');
 const current=page.locator('.works-wheel-card').nth(point.index);
 await page.mouse.click(point.x,point.y);
 await page.locator('.project-editorial-backdrop[data-open="true"]').waitFor({state:'visible'});
 await page.screenshot({path:`performance/work-open-${mobile?'mobile':'desktop'}.png`});
 await page.getByRole('button',{name:'Close project preview'}).click();
 await page.waitForTimeout(350);
 await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+35,point.y+12,{steps:5});await page.mouse.up();
 assert.equal(await page.locator('.project-editorial-backdrop[data-open="true"]').count(),0,'Drag must not enlarge');
 if(mobile) await page.touchscreen.tap(point.x,point.y); else await page.mouse.click(point.x,point.y);
 await page.locator('.project-editorial-backdrop[data-open="true"]').waitFor({state:'visible'});
 await page.mouse.click(2,110);
 await page.locator('.project-editorial-backdrop[data-open="true"]').waitFor({state:'hidden'});
 const final=await current.evaluate(e=>({width:e.offsetWidth,height:e.offsetHeight,face:getComputedStyle(e.firstElementChild).transform}));
 assert.deepEqual(final,initial,'Card dimensions/face scale must remain stable');
 results.push({mobile,reducedMotion:mode===2,initial,final,errors,hoverClosed:true,wheelClosed:true,repeatedKeyboardCycles:4,clickAndClose:true,dragRejected:true,outsideCloses:true,touchTap:mobile});
 await context.close();
}
writeFileSync('performance/work-interaction-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close()}
