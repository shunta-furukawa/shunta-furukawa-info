import { selectEncounter } from './encounter-model.js';
const buttons = [...document.querySelectorAll('[data-context]')];
const cap = document.querySelector('#respect-frequency');
const output = document.querySelector('#match-result');
let context = 'travel';
function update() {
  const {candidates, selected, reason} = selectEncounter(context, cap.checked);
  const heading = document.createElement('h3'); heading.className = 'match-selected'; heading.textContent = selected.name;
  const paragraph = document.createElement('p'); paragraph.className = 'match-reason'; paragraph.textContent = reason;
  const list = document.createElement('ul'); list.className = 'candidate-list';
  candidates.forEach(ad => {
    const li = document.createElement('li');
    const name = document.createElement('strong'); name.textContent = ad.name;
    const note = document.createElement('span');
    note.textContent = ad === selected ? '選定 / 表示済み ' + ad.seen + '回' : cap.checked && ad.seen >= 3 ? '対象外 / 表示済み ' + ad.seen + '回' : '候補 / 表示済み ' + ad.seen + '回';
    if(ad === selected) li.className = 'chosen';
    li.append(name,note); list.append(li);
  });
  output.replaceChildren(heading, paragraph, list);
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.context === context)));
}
if (output && cap) {
  buttons.forEach(button => button.addEventListener('click', () => { context = button.dataset.context; update(); }));
  cap.addEventListener('change',update); update();
}
const stage = document.querySelector('#signal-stage');
const toggle = document.querySelector('#motion-toggle');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let scene, loading = false, paused = reduced.matches;
function updateToggle() { toggle.textContent = paused ? '動きを再生する' : '動きを止める'; toggle.setAttribute('aria-pressed',String(paused)); }
async function loadScene() {
  if (loading || scene || !stage?.dataset.scene) return;
  loading = true;
  try {
    const module = await import(stage.dataset.scene);
    scene = module.createSignalScene(stage);
    scene.setPaused(paused);
  } catch (_) {
    stage.classList.remove('is-rendered');
    stage.querySelector('canvas')?.remove();
    toggle.hidden = true;
  } finally { loading = false; }
}
if(stage && toggle) {
  toggle.hidden = false; updateToggle();
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); if(!scene) loadScene(); else scene.setPaused(paused); });
  reduced.addEventListener('change', e => { paused = e.matches; updateToggle(); if(scene) scene.setPaused(paused); else if(!paused) loadScene(); });
  // Keep readable HTML first; reduced-motion visitors need no 3D download.
  if(!paused) { if('requestIdleCallback' in window) requestIdleCallback(loadScene, {timeout:1500}); else setTimeout(loadScene, 100); }
}
