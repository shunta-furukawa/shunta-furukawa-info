// Small celebratory effects for the pop theme. Purely decorative: skipped when motion is reduced.
const COLORS=['var(--accent,#ff3b8d)','#ffffff','var(--accent,#ff3b8d)','#ffffff80'];
export const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('world-motion-off');
// Throw confetti outward from the centre of an element. Lives in the open dialog so it stays in the top layer.
export function burst(el,count=30){if(!el||calm())return;const r=el.getBoundingClientRect(),home=el.closest('dialog[open]')||document.body,x=r.left+r.width/2,y=r.top+r.height*.45;
 for(let i=0;i<count;i++){const bit=document.createElement('i'),angle=Math.random()*Math.PI*2,reach=120+Math.random()*260;bit.className='pop-confetti';bit.setAttribute('aria-hidden','true');
  bit.style.cssText=`left:${x}px;top:${y}px;background:${COLORS[i%COLORS.length]};width:${5+i%3*3}px;height:${5+i%3*3}px;--dx:${Math.cos(angle)*reach}px;--dy:${Math.sin(angle)*reach+180}px;--rot:${(Math.random()*4-2)*360}deg;--dur:${.9+Math.random()*.7}s`;
  bit.addEventListener('animationend',()=>bit.remove());home.append(bit);}}
// Replay a one-shot CSS animation class on an element.
export function replay(el,name){if(!el)return;el.classList.remove(name);void el.offsetWidth;el.classList.add(name);}
