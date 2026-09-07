import { selectEncounter } from './encounter-model.js';
const journey = document.getElementById('journey');
if (journey) {
  const beats = [...journey.querySelectorAll('[data-beat]')];
  const nav = [...journey.querySelectorAll('.journey-nav a')];
  const backdrops = [...journey.querySelectorAll('[data-backdrop]')];
  const labels = ['BEYOND THE SIGNAL','UNDERSTAND THE CONTEXT','A MEANINGFUL ENCOUNTER','ENGINEER THE INVISIBLE','THE NEXT CONNECTION'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('journey-motion');
  let motionOff = reduced.matches, scene, loading=false, scrollFrame=0, active=-1, offsets=[];
  let openDialog = null;
  function progress() {
    const y = window.scrollY;
    let i=0;
    while(i<offsets.length-1 && y>=offsets[i+1]) i++;
    return Math.min(4,i+(i<4?(y-offsets[i])/Math.max(1,offsets[i+1]-offsets[i]):0));
  }
  function update() {
    scrollFrame=0;
    const p=Math.max(0,progress()), next=Math.min(4,Math.round(p));
    if(next!==active) {
      active=next;
      beats.forEach((beat,i)=>{
        beat.classList.toggle('is-active',i===active);
        const content=beat.querySelector('.chapter-content');
        content.inert=i!==active;
        content.setAttribute('aria-hidden',String(i!==active));
      });
      nav.forEach((link,i)=>{ if(i===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current'); });
      document.getElementById('journey-scene-label').textContent=labels[active];
      document.getElementById('journey-count').textContent=String(active+1).padStart(2,'0');
      const imageIndex=active===1?1:active===2||active===4?2:0;
      backdrops.forEach((img,i)=>img.classList.toggle('is-current',i===imageIndex));
    }
    beats[active].querySelector('.chapter-content').style.opacity=motionOff?'1':String(Math.max(0,1-Math.abs(p-active)*2.9));
    document.getElementById('journey-progress-bar').style.transform=`scaleX(${p/4})`;
    scene?.setProgress(p);
  }
  function schedule(){ if(!scrollFrame)scrollFrame=requestAnimationFrame(update); }
  function measure(){ offsets=beats.map(el=>el.getBoundingClientRect().top+window.scrollY);schedule(); }
  function refreshMotion(){
    document.body.classList.toggle('journey-reduced',motionOff);
    toggle.textContent=motionOff?'MOTION OFF':'MOTION ON';
    toggle.setAttribute('aria-pressed',String(motionOff));
    toggle.setAttribute('aria-label',motionOff?'3Dの動きを有効にする':'3Dの動きを止める');
    scene?.setPaused(motionOff || Boolean(openDialog));
    if(!motionOff)loadScene();
    schedule();
  }
  async function loadScene(){
    if(scene||loading)return;
    loading=true;
    try {
      const module=await import(journey.dataset.scene);
      scene=await module.createJourneyScene(document.getElementById('journey-canvas'));
      scene.setProgress(progress());
      scene.setPaused(motionOff||Boolean(openDialog));
      document.body.classList.add('world-rendered');
    } catch(error) {
      document.body.classList.remove('world-rendered');
      document.getElementById('journey-canvas').replaceChildren();
      toggle.hidden=true;
      console.warn('Spatial rendering unavailable; using cinematic stills.',error.message);
    } finally {loading=false;}
  }
  journey.querySelectorAll('[data-open-panel]').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',()=>{
      const dialog=document.getElementById(button.dataset.openPanel);
      if(!dialog)return;
      openDialog=dialog;dialog.showModal();document.documentElement.style.overflow='hidden';scene?.setPaused(true);
    });
  });
  document.querySelectorAll('.journey-panel').forEach(dialog=>{
    dialog.querySelector('[data-close-panel]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('close',()=>{openDialog=null;document.documentElement.style.overflow='';scene?.setPaused(motionOff);measure();});
  });
  const contextButtons=[...document.querySelectorAll('[data-context]')];
  const cap=document.getElementById('respect-frequency');
  let context='travel';
  function updateMatch(){
    const {selected,candidates,reason}=selectEncounter(context,cap.checked);
    const heading=document.createElement('h3');heading.className='match-selected';heading.textContent=selected.name;
    const explanation=document.createElement('p');explanation.className='match-reason';explanation.textContent=reason;
    const list=document.createElement('ul');list.className='candidate-list';
    candidates.forEach(ad=>{const li=document.createElement('li'),name=document.createElement('strong'),note=document.createElement('span');name.textContent=ad.name;note.textContent=(ad===selected?'選定':cap.checked&&ad.seen>=3?'頻度で除外':'候補')+' / 表示済み '+ad.seen+'回';if(ad===selected)li.className='chosen';li.append(name,note);list.append(li);});
    document.getElementById('match-result').replaceChildren(heading,explanation,list);
    contextButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.context===context)));
  }
  contextButtons.forEach(button=>button.addEventListener('click',()=>{context=button.dataset.context;updateMatch();}));
  cap.addEventListener('change',updateMatch);updateMatch();
  // Native scroll remains the source of truth; no wheel/touch interception.
  document.body.classList.add('journey-ready');
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('hashchange',()=>requestAnimationFrame(measure));
  toggle.hidden=false;toggle.addEventListener('click',()=>{motionOff=!motionOff;refreshMotion();});
  reduced.addEventListener('change',event=>{motionOff=event.matches;refreshMotion();});
  measure();refreshMotion();
}
