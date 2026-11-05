
/**
 * 智研学途 v2 · ReactBits-inspired vanilla effect adapters.
 * Source concepts: SpotlightCard / Magnet / ClickSpark / DotGrid / Stepper / FadeContent.
 * ReactBits is a React collection; this site intentionally stays no-build static.
 * No remote scripts, dependencies, network requests or data uploads.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const mobileLite = matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)");
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disabled = false;
  try { disabled = localStorage.getItem('zyxt_motion_off') === '1'; } catch {}
  const motionOff = () => disabled || reduced.matches;
  const toggle = document.getElementById('rbMotionToggle');
  const applyMotion = () => {
    root.classList.toggle('rb-motion-off', motionOff());
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(!motionOff()));
      toggle.setAttribute('aria-label', motionOff() ? '开启页面装饰动效' : '关闭页面装饰动效');
      toggle.title = motionOff() ? '开启装饰动效' : '关闭装饰动效';
      toggle.innerHTML = motionOff() ? '✳ <span>已静止</span>' : '✦ <span>动效</span>';
    }
  };
  applyMotion();
  toggle?.addEventListener('click', () => {
    disabled = !disabled;
    try { localStorage.setItem('zyxt_motion_off', disabled ? '1' : '0'); } catch {}
    applyMotion();
  });
  reduced.addEventListener?.('change', applyMotion);

  // SpotlightCard: per-card pointer coordinates, with no extra RAF or network scripts.
  const cards = [...document.querySelectorAll('.rb-spotlight')];
  cards.forEach(card => {
    const move = e => {
      if (motionOff() || e.pointerType === 'touch') return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--rb-x', `${e.clientX - box.left}px`);
      card.style.setProperty('--rb-y', `${e.clientY - box.top}px`);
      card.style.setProperty('--rb-opacity', '1');
    };
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', () => card.style.setProperty('--rb-opacity', '0'));
    card.addEventListener('focusin', () => {
      if (!motionOff()) {
        card.style.setProperty('--rb-x', '50%');
        card.style.setProperty('--rb-y', '50%');
        card.style.setProperty('--rb-opacity', '.6');
      }
    });
    card.addEventListener('focusout', () => card.style.setProperty('--rb-opacity', '0'));
  });

  // Magnet: gentle CTA attraction only when the pointer is precise.
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.hero-cta .btn, .cta-actions .btn, .header-actions .btn, .approach-left .btn, .growth-copy .btn').forEach(el => {
      el.classList.add('rb-magnet');
      el.addEventListener('pointermove', e => {
        if (motionOff()) return;
        const r = el.getBoundingClientRect();
        const x = Math.max(-7, Math.min(7, (e.clientX - r.left - r.width / 2) * .10));
        const y = Math.max(-5, Math.min(5, (e.clientY - r.top - r.height / 2) * .15));
        el.style.setProperty('--rb-mx', `${x.toFixed(1)}px`);
        el.style.setProperty('--rb-my', `${y.toFixed(1)}px`);
      }, { passive:true });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rb-mx', '0px');
        el.style.setProperty('--rb-my', '0px');
      });
    });
  }

  // DotGrid: subdued parallax that keeps headings unobstructed.
  const hero = document.querySelector('.hero');
  const grid = document.querySelector('.rb-dot-grid');
  hero?.addEventListener('pointermove', e => {
    if (motionOff() || !grid || e.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width - .5;
    const dy = (e.clientY - rect.top) / rect.height - .5;
    grid.style.setProperty('--rb-grid-x', `${(dx * 13).toFixed(1)}px`);
    grid.style.setProperty('--rb-grid-y', `${(dy * 10).toFixed(1)}px`);
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => {
    if (!grid) return;
    grid.style.setProperty('--rb-grid-x', '0px');
    grid.style.setProperty('--rb-grid-y', '0px');
  });

  // Tool category filter: meaningful UI control (not decorative).
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const tools = [...document.querySelectorAll('.tool-card[data-category]')];
  const toolGrid = document.querySelector('.tool-grid');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.filter;
    filterButtons.forEach(b => {
      const on = b === button;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    let visible = 0;
    tools.forEach(card => {
      const show = type === 'all' || card.dataset.category === type;
      card.classList.toggle('rb-is-filtered', !show);
      if (show) visible++;
    });
    toolGrid?.classList.toggle('rb-single-card', visible === 1);
  }));

  // Stepper: educational service stages are selectable, without implying real matching.
  const stepDescriptions = [
    '从兴趣出发，让学习迈出第一步。',
    '描述学段、科目和具体困难，形成清晰的需求草稿。',
    '未来服务环节：教员资料审核后，再进行人工复核与推荐。',
    '目前可追踪本机练习；正式课堂反馈与确认仍在规划中。'
  ];
  const steps = [...document.querySelectorAll('.approach-steps .step')];
  const progress = document.getElementById('rbPathProgress');
  const index = document.getElementById('rbStepIndex');
  const caption = document.getElementById('rbStepCaption');
  const setStep = (i) => {
    steps.forEach((s, j) => {
      s.classList.toggle('is-active', i === j);
      s.setAttribute('aria-pressed', String(i === j));
    });
    if (index) index.textContent = `${String(i + 1).padStart(2, '0')} / 04`;
    if (progress) progress.style.width = `${(i + 1) * 25}%`;
    if (caption) caption.textContent = stepDescriptions[i];
  };
  steps.forEach((s, i) => {
    s.addEventListener('click', () => setStep(i));
    s.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();setStep(i); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault();const n=(i + 1)%steps.length;steps[n].focus();setStep(n); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault();const n=(i + steps.length - 1)%steps.length;steps[n].focus();setStep(n); }
    });
  });

  // Nav feedback: section-based scroll state.
  const header = document.querySelector('.header');
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  let scrollQueued = false;
  const updateScroll = () => {
    scrollQueued = false;
    header?.classList.toggle('rb-scrolled', window.scrollY > 18);
    const line = innerHeight * .27;
    const current = [...document.querySelectorAll('main section[id]')]
      .filter(sec => sec.getBoundingClientRect().top <= line).at(-1)?.id || '';
    navLinks.forEach(a => a.classList.toggle('rb-current', a.hash === `#${current}`));
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {scrollQueued = true;requestAnimationFrame(updateScroll);}
  }, { passive:true });
  updateScroll();

  // ClickSpark: canvas radial bursts after primary interactive actions.
  // Adapted from ReactBits' easing-out / radiating-sparks concept.
  const canvas = document.createElement('canvas');
  canvas.className = 'rb-sparks';
  canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  let sparks = [], frame = 0, last = 0, ratio = 1;
  function resize() {
    if(mobileLite.matches){canvas.width=1;canvas.height=1;return;}
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  mobileLite.addEventListener?.('change', resize);
  const easeOut = t => 1 - (1 - t) ** 3;
  function draw(now) {
    frame = 0;
    const elapsed = last ? Math.min(now - last, 36) : 16;
    last = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    sparks = sparks.filter(s => {
      s.age += elapsed;
      if (s.age >= s.duration) return false;
      const p = Math.min(1, s.age/s.duration);
      const distance = 5 + easeOut(p) * s.range;
      const fade = 1 - p*p;
      const x = s.x + Math.cos(s.angle) * distance;
      const y = s.y + Math.sin(s.angle) * distance;
      const len = 6*(1-p) + 1.5;
      ctx.globalAlpha = fade;
      ctx.lineWidth = 1.5;      ctx.lineCap = 'round';
      ctx.strokeStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x + Math.cos(s.angle)*len,y + Math.sin(s.angle)*len);
      ctx.stroke();
      return true;
    });
    ctx.globalAlpha = 1;
    if (sparks.length) frame = requestAnimationFrame(draw);
    else last = 0;
  }
  function spark(x, y, color = '#348962') {
    if (mobileLite.matches || motionOff() || !ctx) return;
    const count = 8;
    for (let i=0;i<count;i++) sparks.push({
      x, y, angle:i*Math.PI*2/count + (Math.random()-.5)*.15,
      range:22 + Math.random()*12, age:0, duration:380 + Math.random()*110,
      color: i%3===0 ? '#cfe76c' : color
    });
    sparks=sparks.slice(-40);
    if (!frame) frame=requestAnimationFrame(draw);
  }
  document.addEventListener('click', e => {
    const target = e.target.closest('button,a,.step');
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
    const rect = target.getBoundingClientRect();
    const x = e.detail ? e.clientX : rect.left + rect.width/2;
    const y = e.detail ? e.clientY : rect.top + rect.height/2;
    const color = target.closest('.tool-history') ? '#e58d60' : target.closest('.tool-english') ? '#7e6cbd' : '#348962';
    spark(x,y,color);
  }, { passive:true });
  window.ZYXTVisualEffects = Object.freeze({ spark });
})();

