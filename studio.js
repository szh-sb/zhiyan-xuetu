
/** 智研学途 3D-style interactive hero; no external dependencies. */
(() => {
  'use strict';
  const stage = document.getElementById('studioHero');
  const rig = document.getElementById('studioAvatar');
  const video = document.getElementById('studioVideo');
  if (!stage || !rig) return;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLite = window.matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)');
  const motionOff = () => root.classList.contains('rb-motion-off') || reduce.matches || mobileLite.matches;
  const pupilL = rig.querySelector('.studio-pupil-left');
  const pupilR = rig.querySelector('.studio-pupil-right');
  const speech = document.getElementById('studioBubbleText');
  let px = 0, py = 0, tx = 0, ty = 0, currentX = 0, currentY = 0;
  let frameId = 0, looking = false;
  const bubbleText = ['嘿！你在看哪里？','一起探索新知识吧！','发现什么有趣的了吗？','今天也要保持好奇！'];
  const moveAvatar = () => {
    frameId = 0;
    if (motionOff()) return;
    px += (tx - px) * .09;
    py += (ty - py) * .09;
    const eyeTravel = rig.getBoundingClientRect().width * .0118;
    const dx = `${(px * eyeTravel).toFixed(2)}px`;
    const dy = `${(py * eyeTravel * .75).toFixed(2)}px`;
    [pupilL, pupilR].forEach(el => {
      if (!el) return;
      el.style.setProperty('--gaze-x', dx);
      el.style.setProperty('--gaze-y', dy);
    });
    rig.style.setProperty('--head-y', `${(px * 5.8).toFixed(2)}deg`);
    rig.style.setProperty('--head-x', `${(-py * 3.2).toFixed(2)}deg`);
    if(Math.abs(px-tx)>.002 || Math.abs(py-ty)>.002) frameId = requestAnimationFrame(moveAvatar);
  };
  const pointerMove = e => {
    if (motionOff() || e.pointerType === 'touch') return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - .54) * 2.5;
    const y = ((e.clientY - r.top) / r.height - .46) * 2.7;
    tx = Math.max(-1,Math.min(1,x));ty = Math.max(-1,Math.min(1,y));
    if(!frameId) frameId=requestAnimationFrame(moveAvatar);
    if(!looking){ looking=true;setTimeout(()=>{if(speech && !motionOff()) speech.textContent=bubbleText[1]},900);}
  };
  stage.addEventListener('pointermove',pointerMove,{passive:true});
  stage.addEventListener('pointerdown',e => {
    if(e.pointerType !== 'touch' || motionOff()) return;
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
    ty = Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
    if(!frameId)frameId=requestAnimationFrame(moveAvatar);
    setTimeout(()=>{tx=ty=0;if(!frameId && !motionOff())frameId=requestAnimationFrame(moveAvatar)},1400);
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{tx=0;ty=0;if(speech)speech.textContent=bubbleText[0];if(!frameId && !motionOff())frameId=requestAnimationFrame(moveAvatar);});
  // Narrated text acts as a real typewriter; keeps one stable fallback sentence for reduced motion.
  const phrases = ['今天，从认识一个新单词开始。','猜猜这位历史人物是谁？','一起观察化学反应的奇妙。','数学思考，也能很好玩。'];
  const typed = document.getElementById('studioTyped');
  let pi=0, ci=0, deleting=false, typingTimer=0;
  const tick = () => {
    if(!typed || motionOff()) return;
    const phrase=phrases[pi];
    if(!deleting){ci=Math.min(phrase.length,ci+1);typed.textContent=phrase.slice(0,ci);
      if(ci===phrase.length){deleting=true;typingTimer=setTimeout(tick,2400);return;}}
    else{ci=Math.max(0,ci-1);typed.textContent=phrase.slice(0,ci);
      if(ci===0){deleting=false;pi=(pi+1)%phrases.length;typingTimer=setTimeout(tick,450);return;}}
    typingTimer=setTimeout(tick,deleting?40:88);
  };
  if(typed){typed.textContent='';typingTimer=setTimeout(tick,850)}
  let heroVisible = true;
  const syncVideo = () => {
    if(!video)return;
    if(motionOff() || document.hidden || !heroVisible){
      video.pause();
      if(motionOff() && typed){clearTimeout(typingTimer);typingTimer=0;typed.textContent=phrases[0];}
    } else {
      const source=video.querySelector('source[data-src]');
      if(source){source.src=source.dataset.src;source.removeAttribute('data-src');video.load();}
      video.play().catch(()=>{});
      if(typed && !typingTimer){typed.textContent='';ci=0;deleting=false;typingTimer=setTimeout(tick,650)}
    }
  };
  if('IntersectionObserver' in window){
    const visibility=new IntersectionObserver(entries=>{heroVisible=entries[0]?.isIntersecting??true;syncVideo();},{threshold:0});
    visibility.observe(stage);
  }
  mobileLite.addEventListener?.('change',syncVideo);
  // Existing ReactBits motion switch changes html class; watch it rather than changing existing event handlers.
  const observer = new MutationObserver(()=>{
    const off=motionOff();syncVideo();
    if(off){cancelAnimationFrame(frameId);frameId=0;tx=py=px=ty=0;rig.style.setProperty('--head-x','0deg');rig.style.setProperty('--head-y','0deg');[pupilL,pupilR].forEach(e=>{e?.style.setProperty('--gaze-x','0px');e?.style.setProperty('--gaze-y','0px')});}
  });
  observer.observe(root,{attributes:true,attributeFilter:['class']});
  reduce.addEventListener?.('change',syncVideo);
  const header=document.querySelector('.header');
  const onScroll=()=>header?.classList.toggle('studio-header-light',window.scrollY > Math.max(460,stage.getBoundingClientRect().height-150));
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video?.pause();else syncVideo()});
  syncVideo();
})();

