
/** 智研学途 · clickable orbiting star. Zero dependencies. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const off = () => reduce.matches || document.documentElement.classList.contains('rb-motion-off');
  document.querySelectorAll('[data-orbit-logo]').forEach(button => {
    let cleanup = 0;
    const stop = () => {button.classList.remove('is-orbiting');button.removeAttribute('aria-busy');};
    button.addEventListener('click', () => {
      clearTimeout(cleanup);
      stop();
      if (off()) {
        button.animate([{filter:'brightness(1)'},{filter:'brightness(1.35)'},{filter:'brightness(1)'}],{duration:380,iterations:1});
        return;
      }
      // A forced reflow is deliberate: every click restarts the rapid orbit, including midflight.
      void button.offsetWidth;
      button.classList.add('is-orbiting');
      button.setAttribute('aria-busy','true');
      cleanup = setTimeout(stop, 3700);
    });
    button.addEventListener('animationend', e => {if(e.target.classList.contains('orbit-satellite') && e.animationName==='zyxtStarOrbit')stop();});
    reduce.addEventListener?.('change',()=>{if(off())stop()});
    const obs = new MutationObserver(()=>{if(off())stop()});
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  });
})();

