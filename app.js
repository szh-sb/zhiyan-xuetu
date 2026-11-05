
/* 智研学途 · 本地可运行交互原型（不连接任何后端或 AI 接口） */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const modal = $('#mainModal');
  const pane = $('#modalContent');
  const baseWords = [
    {en:'curiosity',zh:'好奇心'}, {en:'explore',zh:'探索'}, {en:'improve',zh:'提高'},
    {en:'discover',zh:'发现'}, {en:'patient',zh:'有耐心的'}, {en:'progress',zh:'进步'}
  ];
  const figures = [
    {name:'李白',aliases:['李太白'],clues:['我是唐代诗人，以浪漫主义诗风闻名。','后人常称我为“诗仙”。','我的名篇包括《静夜思》。'],fact:'李白（701—762），字太白，是唐代著名诗人。代表作品包括《静夜思》《将进酒》。',tag:'唐代 · 诗歌'},
    {name:'孔子',aliases:['孔丘','仲尼'],clues:['我生活在中国春秋时期。','我提倡“仁”，重视教育。','后世把《论语》视作研究我和弟子言行的重要典籍。'],fact:'孔子（前551—前479），名丘，字仲尼，春秋末期思想家、教育家。',tag:'春秋 · 思想'},
    {name:'秦始皇',aliases:['嬴政','秦王政'],clues:['我生活在战国末期至秦朝初年。','我完成六国统一，并推行郡县制。','我是秦朝第一位皇帝，名为嬴政。'],fact:'秦始皇（前259—前210），名嬴政，公元前221年完成统一，建立秦朝。',tag:'秦朝 · 统一'},
    {name:'武则天',aliases:['武曌'],clues:['我生活在唐代。','我曾改国号为周。','我通常被认为是中国历史上唯一的正统女皇帝。'],fact:'武则天（624—705），于690年称帝，建立武周政权。',tag:'唐 / 武周 · 政治'},
    {name:'郑和',aliases:['三宝太监'],clues:['我生活在明朝前期。','我曾多次率领大型船队远航。','我的远航通常被称为“下西洋”。'],fact:'郑和（1371?—1433?），明代航海家，1405年至1433年间多次率船队远航。',tag:'明代 · 航海'},
    {name:'王安石',aliases:['王介甫'],clues:['我生活在北宋。','我既是政治家，也是文学家。','我主持过著名的“熙宁变法”。'],fact:'王安石（1021—1086），字介甫，北宋政治家、文学家，主持熙宁变法。',tag:'北宋 · 改革'}
  ];
  const mathQuestions=[
    {q:'方程 x² − 5x + 6 = 0 的两个解是？',options:['1 和 6','2 和 3','−2 和 −3','3 和 4'],correct:1,explain:'把二次式分解为 (x−2)(x−3)=0，所以 x=2 或 x=3。'},
    {q:'若 y = 2x + 1，当 x = 3 时，y 等于？',options:['5','6','7','8'],correct:2,explain:'把 x=3 代入 y=2x+1，得到 y=2×3+1=7。'},
    {q:'三个连续奇数的和是 45，中间的数是？',options:['13','15','17','19'],correct:1,explain:'设中间的奇数为 n，另外两个是 n−2 和 n+2，三数之和为 3n=45，故 n=15。'}
  ];
  function load(){
    try{const raw=JSON.parse(localStorage.getItem('zyxt_v1')||'null'); if(raw&&typeof raw==='object')return {
      words:Array.isArray(raw.words)?raw.words.slice(0,200):baseWords,
      stats:{attempts:0,correct:0,historyWins:0,chemComplete:0,mathCorrect:0,...(raw.stats||{})},
      records:Array.isArray(raw.records)?raw.records.slice(0,50):[],drafts:Array.isArray(raw.drafts)?raw.drafts.slice(0,10):[]
    };}catch(e){}
    return {words:baseWords.map(w=>({...w})),stats:{attempts:0,correct:0,historyWins:0,chemComplete:0,mathCorrect:0},records:[],drafts:[]};
  }
  const data=load();
  const active={page:'',wordTab:'quiz',wordMode:'en-zh',wordIndex:0,answered:false,historyIndex:0,clue:0,historyDone:false,chemStep:0,chemMessage:'',mathIndex:0,mathDone:false};
  let previousFocus=null,toastTimer=null;
  const esc=str=>String(str??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const norm=str=>String(str??'').trim().toLowerCase().replace(/\s+/g,'').replace(/[，,；;。.!！?？]/g,'');
  const save=()=>{try{localStorage.setItem('zyxt_v1',JSON.stringify(data));}catch(e){}};
  const icon=id=>`<svg class="ico"><use href="#ic-${id}"></use></svg>`;
  const intro=(kicker,title,desc)=>`<div class="modal-intro"><div class="modal-kicker">${kicker}</div><h2 class="modal-title" id="modalTitle">${title}</h2><p class="modal-description">${desc}</p></div>`;
  const demoNote=`<div class="demo-notice"><b>体验版提示：</b>这是本机交互演示，不连接 AI、真实教员或服务器；练习数据保存在当前浏览器中。</div>`;
  function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}
  function record(kind,title,success){data.records.unshift({kind,title,success,at:new Date().toLocaleString('zh-CN',{hour12:false})});data.records=data.records.slice(0,50);save();syncCounters()}
  function syncCounters(){const a=$('#heroPracticeCount'),b=$('#heroCorrectCount'),c=$('#heroWordCount');if(a)a.textContent=String(data.stats.attempts);if(b)b.textContent=String(data.stats.correct);if(c)c.textContent=String(data.words.length)}
  function open(page){active.page=page;if(page==='words'){active.wordTab='quiz';active.answered=false;}previousFocus=document.activeElement;modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';render();modal.querySelector('.modal-close').focus()}
  function close(){modal.setAttribute('aria-hidden','true');document.body.style.overflow='';pane.innerHTML='';if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus()}
  function render(){const map={words:renderWords,history:renderHistory,chem:renderChem,math:renderMath,match:renderMatch,teacher:renderTeacher,growth:renderGrowth,privacy:renderPrivacy};(map[active.page]||renderPrivacy)()}
  document.addEventListener('click',e=>{
    const op=e.target.closest('[data-open]');if(op){e.preventDefault();open(op.dataset.open);return}
    const cl=e.target.closest('[data-close="modal"]');if(cl){close();return}
    const action=e.target.closest('[data-action]');if(action){handleAction(action.dataset.action,action);return}
    if(e.target.closest('.mobile-nav a')){$('#mobileNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.getAttribute('aria-hidden')==='false')close();if(e.key==='Tab'&&modal.getAttribute('aria-hidden')==='false'){const f=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(x=>x.offsetParent!==null);if(!f.length)return;let first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  $('#menuToggle').addEventListener('click',()=>{const m=$('#mobileNav'),x=m.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(x))});
  document.addEventListener('submit',e=>{
    if(e.target.id==='quizForm'){e.preventDefault();gradeWord()}
    if(e.target.id==='wordAddForm'){e.preventDefault();addWord()}
    if(e.target.id==='historyForm'){e.preventDefault();gradeHistory()}
    if(e.target.id==='matchForm'){e.preventDefault();submitMatch(e.target)}
    if(e.target.id==='teacherForm'){e.preventDefault();submitTeacher(e.target)}
  });
  const io=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in-view');io.unobserve(en.target)}}),{threshold:.1}):null;
  document.querySelectorAll('.reveal').forEach((x,i)=>{if(io)io.observe(x);else x.classList.add('in-view')});
  const dashboard=$('#heroDashboard');
  if(dashboard && window.matchMedia('(pointer:fine) and (min-width:1161px)').matches&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    dashboard.parentElement.addEventListener('pointermove',e=>{const r=dashboard.parentElement.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;dashboard.style.transform=`rotate(2deg) rotateY(${x*6}deg) rotateX(${-y*6}deg)`});
    dashboard.parentElement.addEventListener('pointerleave',()=>dashboard.style.transform='rotate(2deg)');
  }
  syncCounters();
  /* English words */
  function renderWords(){
    const quiz=active.wordTab==='quiz';
    pane.innerHTML=intro('01 / LANGUAGE LAB','让单词，不再转头就忘。','把单词变成可反复挑战的小游戏。支持中英互译、单词发音、添加词条和批量导入。')+
      `<div class="pillbar"><button class="pill ${quiz?'active':''}" data-action="word-quiz">词汇闯关</button><button class="pill ${!quiz?'active':''}" data-action="word-bank">我的词库 (${data.words.length})</button></div>`+
      (quiz?renderWordQuiz():renderWordBank())+demoNote;
  }
  function getWord(){if(!data.words.length)return null;active.wordIndex%=data.words.length;return data.words[active.wordIndex]}
  function renderWordQuiz(){const w=getWord();if(!w)return `<div class="outcome"><h3>你的词库还是空的</h3><p>先到“我的词库”添加至少一个单词，就可以开始测验。</p><button class="mini-btn" data-action="word-bank">去添加</button></div>`;
    const en=active.wordMode==='en-zh';
    return `<div class="pillbar"><button class="pill ${en?'active':''}" data-action="mode-en">英译汉</button><button class="pill ${!en?'active':''}" data-action="mode-zh">汉译英</button></div><div class="demo-grid"><div class="practice-card"><div class="practice-caption">CHALLENGE / ${active.wordIndex+1} OF ${data.words.length}</div><div class="practice-question" id="wordQuestion">${esc(en?w.en:w.zh)}</div><div class="practice-subtitle">${en?'写出这个单词的中文意思':'请输入对应的英文单词'}</div><div style="margin-top:17px"><button class="mini-btn alt" data-action="speak">${icon('sound')} 听单词发音</button></div><form id="quizForm" class="input-row"><input id="quizAnswer" class="field" autocomplete="off" aria-label="测验答案" placeholder="在这里输入答案…" required/><button class="mini-btn" type="submit">提交答案 →</button></form><div class="feedback" id="quizFeedback" aria-live="polite"></div><div class="history-controls"><button class="mini-btn alt" data-action="next-word">换一题 ↻</button></div></div><aside class="side-card"><h4>我的练习快照</h4><div class="stat-list"><div class="stat-tile"><b>${data.stats.attempts}</b><span>累计作答</span></div><div class="stat-tile"><b>${data.stats.attempts?Math.round(data.stats.correct/data.stats.attempts*100):0}%</b><span>累计正确率</span></div></div><p><b>学习提示：</b>遇到忘记的单词，不必着急。先回想意思，再结合例句或词根加深记忆。</p><div class="tool-divider"></div><p>当前词库：${data.words.length} 个词条。测验记录将用于本机成长档案。</p></aside></div>`;
  }
  function gradeWord(){if(active.answered)return;const w=getWord();if(!w)return;const input=$('#quizAnswer');let answer=input.value.trim();if(!answer)return;let correct=false;
    if(active.wordMode==='en-zh'){correct=w.zh.split(/[、/，,；;]/).some(t=>norm(t)===norm(answer)||((norm(answer).length>=2)&&norm(t).includes(norm(answer))))}
    else correct=norm(answer)===norm(w.en);
    data.stats.attempts++;if(correct)data.stats.correct++;
    const fb=$('#quizFeedback');fb.className='feedback '+(correct?'good':'bad');fb.textContent=correct?'✓ 回答正确！继续保持这份好奇心。':`还差一点，正确答案是：${active.wordMode==='en-zh'?w.zh:w.en}`;
    active.answered=true;input.disabled=true;$('#quizForm button[type=submit]').disabled=true;record('words',`${w.en} · ${correct?'正确':'需巩固'}`,correct);
    const btn=pane.querySelector('[data-action="next-word"]');btn.textContent='下一题 →';
  }
  function renderWordBank(){return `<div class="demo-grid"><div class="practice-card"><h3 style="font-size:17px">添加一个想学的词</h3><p class="helper-line" style="margin:10px 0 17px">支持逐个添加，也支持批量粘贴。词库在当前浏览器中保存。</p><form id="wordAddForm"><div class="input-row"><input class="field" name="en" placeholder="英文，如 explore" aria-label="英文词条" maxlength="64" required/><input class="field" name="zh" placeholder="中文，如 探索" aria-label="中文释义" maxlength="80" required/><button class="mini-btn" type="submit">添加</button></div></form><div class="tool-divider"></div><label class="area-label" for="wordImport">批量导入（每行一组）</label><textarea id="wordImport" class="textarea-field" placeholder="apple, 苹果&#10;learn : 学习&#10;curious[TAB]好奇的"></textarea><p class="form-caption">支持逗号、冒号或 Tab 分隔；会自动跳过重复的英文词条。最多 200 条。</p><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:12px"><button class="mini-btn" data-action="word-import">导入词库</button><button class="mini-btn alt" data-action="word-reset">恢复示例词库</button></div></div><aside class="side-card"><h4>我的单词 · ${data.words.length} 个</h4><p>点击 × 删除。资料在此浏览器本地保存。</p><div class="wordbank-list">${data.words.length?data.words.map((w,i)=>`<span class="wordchip">${esc(w.en)} · ${esc(w.zh)} <button aria-label="删除${esc(w.en)}" data-action="del-word" data-index="${i}">×</button></span>`).join(''):'<p>暂无单词，添加后可开始练习。</p>'}</div></aside></div>`}
  function addWord(){const form=$('#wordAddForm');const en=form.elements.en.value.trim(),zh=form.elements.zh.value.trim();if(!en||!zh)return;if(data.words.length>=200)return toast('词库最多保存200条');if(data.words.some(w=>norm(w.en)===norm(en)))return toast('这个单词已经在词库中');data.words.push({en,zh});save();active.wordIndex=0;renderWords();toast('已添加到我的词库')}
  function importWords(){let txt=$('#wordImport')?.value||'';let count=0;txt.split(/\r?\n/).forEach(line=>{if(data.words.length>=200)return;let parts=line.trim().split(/\t|,|，|:|：/).map(s=>s.trim());if(parts.length<2)return;const en=parts.shift().slice(0,64),zh=parts.join('，').slice(0,80);if(!en||!zh||data.words.some(w=>norm(w.en)===norm(en)))return;data.words.push({en,zh});count++});save();renderWords();toast(`成功导入 ${count} 个新单词`)}
  function speak(){const w=getWord();if(!w)return;if(!('speechSynthesis'in window))return toast('当前浏览器不支持语音朗读');speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(w.en);utter.lang='en-US';utter.rate=.82;speechSynthesis.speak(utter)}
  /* History */
  function renderHistory(){let f=figures[active.historyIndex];const done=active.historyDone;
    pane.innerHTML=intro('02 / HISTORY LAB','历史人物 · 时空猜猜猜','根据线索猜出历史人物，逐步解锁提示。人物资料为教学知识卡，不包含伪造的历史人物原话。')+`<div class="history-stage"><div class="history-emoji">📜</div><div class="clue-title">TIME TRAVEL / 线索 ${active.clue+1} OF ${f.clues.length}</div><div class="history-clue-text">“${esc(f.clues[active.clue])}”</div>${!done?`<form id="historyForm" class="history-answer"><input id="historyAnswer" class="field" maxlength="40" placeholder="猜一猜：TA 是谁？" aria-label="历史人物姓名" required autocomplete="off"/><button class="mini-btn" type="submit">确认答案</button></form><div class="feedback" id="historyFeedback" aria-live="polite"></div>`:`<div class="history-reveal"><h4>🎉 揭晓：${esc(f.name)} <small>｜ ${esc(f.tag)}</small></h4><p>${esc(f.fact)}</p></div>`}<div class="history-hint">${active.clue===0?'不知道答案？可以逐步解锁更多线索。':'思考这条线索中最关键的时间、事件或身份信息。'}</div></div><div class="history-controls">${!done?`<button class="mini-btn alt" data-action="history-hint" ${active.clue===f.clues.length-1?'disabled':''}>再给我一点提示 ✦</button><button class="mini-btn alt" data-action="history-reveal">查看答案</button>`:''}<button class="mini-btn" data-action="history-next">换一位人物 →</button></div>${demoNote}`;
  }
  function gradeHistory(){let answer=$('#historyAnswer').value.trim(),f=figures[active.historyIndex];if(!answer)return;let good=[f.name,...f.aliases].some(a=>norm(a)===norm(answer));if(good){if(!active.historyDone){data.stats.historyWins++;record('history',`认识 ${f.name}`,true)}active.historyDone=true;renderHistory();toast('猜对了！开启新的历史知识卡')}else{const fb=$('#historyFeedback');fb.className='feedback bad';fb.textContent='还不是这位人物。可以再想想，或解锁下一条线索。'}}
  /* Chemistry */
  const chemTasks=[
    {title:'选择实验装置',desc:'要观察碳酸钙与稀盐酸反应生成的气体，并将气体导向检验液，应优先选择哪类器材？',opts:['试管、带导管的塞子与检验容器','只准备一只敞口量筒'],answer:0,ok:'装置准备完成。导管可以把生成的气体通向检验液。',bad:'敞口量筒无法稳定地将气体导入检验液。'},
    {title:'选择反应物',desc:'实验中哪组反应物能生成二氧化碳？',opts:['大理石（CaCO₃）与稀盐酸','食盐与水'],answer:0,ok:'正确！CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。',bad:'食盐溶于水不产生二氧化碳。'},
    {title:'选择检验方法',desc:'要验证生成的气体是二氧化碳，适合将其通入什么溶液？',opts:['澄清石灰水','酚酞溶液'],answer:0,ok:'正确。CO₂ 可以使澄清石灰水变浑浊。',bad:'在这个教学演示中，酚酞不是检验 CO₂ 的合适首选试剂。'},
    {title:'观察实验现象',desc:'持续向澄清石灰水通入适量二氧化碳，通常会观察到什么？',opts:['溶液先变浑浊','溶液突然变成鲜蓝色'],answer:0,ok:'实验完成！产生碳酸钙沉淀使石灰水变浑浊。',bad:'不会出现鲜蓝色现象。适量 CO₂ 会使澄清石灰水变浑浊。'}
  ];
  function renderChem(){const step=active.chemStep,t=chemTasks[Math.min(step,3)],done=step>=4;
    pane.innerHTML=intro('03 / SCIENCE LAB','九年级 · 虚拟化学小实验','实验主题：二氧化碳的制取与检验。通过四步选择，理解装置、反应与现象。')+
      `<div class="chem-progress">${chemTasks.map((_,i)=>`<span class="${i<=step?'active':''}"></span>`).join('')}</div><div class="chem-playground"><div class="chem-scene"><div class="lab-vessel ${step>=2?(step>=4?'is-milky':'is-reacting'):''}"><div class="lab-liquid"></div><i class="lab-bubble"></i><i class="lab-bubble"></i><i class="lab-bubble"></i></div><div class="lab-scene-caption">教学仿真示意 · 不代表真实操作步骤图</div></div><div class="chem-details"><span>VIRTUAL EXPERIMENT · ${done?'COMPLETE':`STEP 0${step+1}`}</span><h3>${done?'实验挑战完成！':esc(t.title)}</h3><p>${done?'你已经完成装置选择、反应物判断与二氧化碳检验的基础知识探索。':esc(t.desc)}</p></div></div>${!done?`<div class="chem-options">${t.opts.map((o,i)=>`<button class="option-btn" data-action="chem-answer" data-index="${i}">${i===0?'A':'B'}. ${esc(o)}</button>`).join('')}</div>`:`<div class="outcome" style="margin-top:16px"><h3>化学方程式</h3><p>CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑</p><p>CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O</p></div>`}<div id="chemFeedback" class="feedback ${active.chemMessage.startsWith('✓')?'good':'bad'}" aria-live="polite">${esc(active.chemMessage)}</div><div class="history-controls"><button class="mini-btn alt" data-action="chem-reset">重新做一次 ↻</button></div><div class="demo-notice"><b>安全与准确性说明：</b>仅为初中化学概念教学模拟，不提供真实实验的完整安全操作指导；危险化学品须在合格实验室由老师指导使用。</div>`;
  }
  function gradeChem(i){if(active.chemStep>=4)return;const t=chemTasks[active.chemStep];if(i===t.answer){active.chemStep++;active.chemMessage='✓ '+t.ok;if(active.chemStep>=4){data.stats.chemComplete++;record('chem','完成 CO₂ 制取与检验小实验',true)}renderChem()}else{active.chemMessage='提示：'+t.bad;$('#chemFeedback').className='feedback bad';$('#chemFeedback').textContent=active.chemMessage;toast('再试一次，观察实验条件与目标') }}
  /* Math */
  function renderMath(){const q=mathQuestions[active.mathIndex],done=active.mathDone;
    pane.innerHTML=intro('04 / THINKING LAB','数学思维 · 三分钟小挑战','不追求做得快，试着说清楚为什么。三个基础问题，边答边理解。')+`<div class="math-stage"><div class="practice-caption">THINKING CHALLENGE / ${active.mathIndex+1} OF ${mathQuestions.length}</div><h3>${esc(q.q)}</h3><div class="math-options">${q.options.map((o,i)=>`<button class="math-option" data-action="math-answer" data-index="${i}" ${done?'disabled':''}>${esc(o)}</button>`).join('')}</div>${done?`<div class="math-explain"><b>${active.mathCorrectAnswer?'✓ 答对了！':'答案解析'}</b><p>${esc(q.explain)}</p></div>`:''}<div class="feedback" id="mathFeedback" aria-live="polite"></div></div><div class="history-controls"><button class="mini-btn" data-action="math-next">下一道挑战 →</button></div>${demoNote}`;
  }
  function gradeMath(i){if(active.mathDone)return;const q=mathQuestions[active.mathIndex],good=q.correct===i;active.mathDone=true;active.mathCorrectAnswer=good;data.stats.attempts++;if(good){data.stats.correct++;data.stats.mathCorrect++}record('math',`数学思维第 ${active.mathIndex+1} 题 · ${good?'正确':'需巩固'}`,good);renderMath();toast(good?'回答正确！':'请看看解析，再试下一道')}
  /* Demand form */
  function renderMatch(){pane.innerHTML=intro('LEARNING NEEDS / 需求体验','为孩子描绘一张学习需求地图。','这是一个不收集姓名、手机号或学生身份信息的需求填写演示，帮助你体验后续家教匹配流程。')+
    `<form id="matchForm"><div class="form-grid"><div class="form-group"><label for="grade">学习阶段 *</label><select class="select-field" id="grade" name="grade" required><option value="">请选择</option><option>小学</option><option>初一 / 初二</option><option>初三</option><option>高一 / 高二</option><option>高三</option></select></div><div class="form-group"><label for="subject">关注的科目 *</label><select class="select-field" id="subject" name="subject" required><option value="">请选择</option><option>数学</option><option>英语</option><option>化学</option><option>物理</option><option>语文 / 历史</option><option>其他</option></select></div><div class="form-group"><label for="format">理想方式</label><select class="select-field" id="format" name="format"><option>线上互动</option><option>线下沟通（仅意向）</option><option>都可以</option></select></div><div class="form-group"><label for="time">方便的时段</label><select class="select-field" id="time" name="time"><option>周末</option><option>工作日晚间</option><option>时间灵活</option><option>需要进一步沟通</option></select></div><div class="form-group wide"><label for="goal">希望改善的学习问题 *</label><textarea class="textarea-field" id="goal" name="goal" required minlength="5" maxlength="500" placeholder="比如：函数应用题读不懂题意，想学会分步骤分析。请勿填写学生姓名、电话、地址等个人信息。"></textarea></div><div class="form-group wide"><label for="style">更喜欢哪种教学节奏</label><select class="select-field" name="style" id="style"><option>先梳理概念，再练习</option><option>从错题切入，针对性巩固</option><option>多互动提问，引导独立思考</option><option>暂时不确定</option></select></div></div><div class="form-actions"><p>不会发送到服务器，也不会自动匹配真实老师。<br/>正式服务上线前将另行完成资质、许可和隐私审查。</p><button class="btn btn-dark" type="submit">生成本机需求卡片 ${icon('arrow')}</button></div></form>`+demoNote}
  function submitMatch(form){const fd=new FormData(form);const item={type:'parent',grade:fd.get('grade'),subject:fd.get('subject'),format:fd.get('format'),time:fd.get('time'),goal:fd.get('goal').trim(),style:fd.get('style'),createdAt:new Date().toLocaleString('zh-CN',{hour12:false})};if(item.goal.length<5)return toast('请描述至少5个字的学习问题');data.drafts.unshift(item);data.drafts=data.drafts.slice(0,10);save();pane.innerHTML=intro('LOCAL DRAFT / 保存完成','你的学习需求卡片已经生成。','这只是一份留在当前浏览器中的需求草稿，尚未提交任何匹配申请。')+`<div class="outcome"><h3>✳ 学习需求 · 体验卡</h3><p><b>学习阶段：</b>${esc(item.grade)}　 <b>关注科目：</b>${esc(item.subject)}</p><p><b>理想方式：</b>${esc(item.format)}　 <b>时间：</b>${esc(item.time)}</p><p><b>希望改善：</b>${esc(item.goal)}</p><p><b>教学节奏：</b>${esc(item.style)}</p><p style="margin-top:14px"><b>下一步（拟建）</b>：平台审核需求 → 筛选合规教员 → 人工复核 → 家长自主确认。</p></div><div class="history-controls"><button class="mini-btn" data-action="match-again">再填写一份</button><button class="mini-btn alt" data-action="growth-view">查看本机档案</button></div>${demoNote}`;toast('需求体验卡已保存在本机')}
  function renderTeacher(){pane.innerHTML=intro('TUTOR PORTAL / 大学生教员','把会的知识，变成能够传递的力量。','目前仅开放教员角色意向演示。正式教员资料审核、试讲评价和服务对接功能尚未上线。')+`<div class="demo-grid"><div class="practice-card"><h3 style="font-size:19px;margin-bottom:14px">成为教员的预期流程</h3><div class="record-list"><div class="record-item"><b>01 · 提交资料</b><span>拟建</span></div><div class="record-item"><b>02 · 身份及在读资料核验</b><span>拟建</span></div><div class="record-item"><b>03 · 教学试讲与审核</b><span>拟建</span></div><div class="record-item"><b>04 · 匹配与教学反馈</b><span>拟建</span></div></div></div><div class="side-card"><h4>教员方向自测（不收集实名信息）</h4><form id="teacherForm"><div class="form-group"><label for="teacher-subject">我擅长的科目</label><select id="teacher-subject" name="subject" class="select-field"><option>数学</option><option>英语</option><option>物理</option><option>化学</option><option>语文 / 历史</option></select></div><div class="form-group" style="margin-top:12px"><label for="teacher-style">我想尝试的教学方式</label><select id="teacher-style" name="style" class="select-field"><option>概念引导型</option><option>错题分析型</option><option>趣味互动型</option></select></div><button type="submit" class="mini-btn" style="margin-top:16px">保存本机体验记录</button></form><p style="margin-top:13px">不等于注册成功，未发送到平台，也不产生教员资格。</p></div></div>${demoNote}`}
  function submitTeacher(form){const fd=new FormData(form);data.drafts.unshift({type:'teacher',subject:fd.get('subject'),style:fd.get('style'),createdAt:new Date().toLocaleString('zh-CN',{hour12:false})});data.drafts=data.drafts.slice(0,10);save();toast('已保存教员方向自测记录（仅本机）');pane.insertAdjacentHTML('beforeend','<div class="outcome" style="margin-top:14px"><h3>已记录你的方向偏好 ✓</h3><p>后续正式上线后，还需要独立完成身份核验、相关资格审查、试讲评价和服务规则确认。</p></div>')}
  /* Learning records and privacy */
  function renderGrowth(){const n=data.stats.attempts,correct=data.stats.correct,rate=n?Math.round(correct/n*100):0;
    pane.innerHTML=intro('MY LEARNING SPACE / 本机档案','每个小小的进步，都有迹可循。','这里汇总当前设备上的学习记录，没有登录账号，也没有跨设备同步。')+`<div class="stat-list" style="grid-template-columns:repeat(4,1fr)"><div class="stat-tile"><b>${n}</b><span>总答题数</span></div><div class="stat-tile"><b>${rate}%</b><span>总正确率</span></div><div class="stat-tile"><b>${data.stats.historyWins}</b><span>历史猜对</span></div><div class="stat-tile"><b>${data.stats.chemComplete}</b><span>化学实验通关</span></div></div><h3 style="margin:21px 0 15px;font-size:16px">最近练习</h3><div class="record-list">${data.records.length?data.records.slice(0,12).map(r=>`<div class="record-item"><div><b>${esc(r.title)}</b><br/><small>${esc(r.at)}</small></div><span>${r.success?'已掌握 ✓':'继续巩固 ↗'}</span></div>`).join(''):'<p class="helper-line">还没有学习记录。从词汇闯关或历史人物猜猜猜开始吧。</p>'}</div><h3 style="margin:23px 0 15px;font-size:16px">本机需求草稿</h3><div class="record-list">${data.drafts.length?data.drafts.slice(0,4).map(d=>`<div class="record-item"><div><b>${d.type==='parent'?'学习需求体验':'教员方向自测'} · ${esc(d.subject)}</b><br/><small>${esc(d.createdAt)}</small></div><span>仅本地保存</span></div>`).join(''):'<p class="helper-line">暂无需求草稿。</p>'}</div><div class="history-controls" style="margin-top:23px"><button class="mini-btn" data-action="growth-words">去做单词练习 →</button><button class="mini-btn alt" data-action="growth-export">导出本机记录 (JSON)</button><button class="mini-btn alt" data-action="growth-clear">清除本机记录</button></div>${demoNote}`}
  function renderPrivacy(){pane.innerHTML=intro('ABOUT THIS DEMO / 隐私说明','关于智研学途体验版','我们在产品原型阶段尽量减少数据收集和误导性功能承诺。')+`<div class="privacy-copy"><p><b>1. 本地存储：</b>词库、测验结果、学习记录和需求体验草稿保存在浏览器 localStorage 中。此版本没有后台服务器或用户账户；清除浏览器数据后可能丢失。</p><p><b>2. 不收集未成年人身份信息：</b>需求体验表单无需填写孩子姓名、手机号、住址或学校。请勿在自由文本中输入个人敏感信息。</p><p><b>3. 功能边界：</b>没有接入真正的 AI 模型、历史人物实时语音对话、3D 化学引擎、师资身份审核、自动派单、支付或真实家教服务。展示中的图表为设计示意，个人答题计数来自本机。</p><p><b>4. 合规优先：</b>在收费、师资推荐、组织化教学等业务开展前，应依照实际服务地区的校外培训、个人信息及未成年人保护等规定进行专项审查。</p><p><b>5. 项目用途：</b>当前版本仅用于教学展示、可用性测试与产品方向验证，不构成对真实教师或辅导效果的承诺。</p></div><div class="history-controls"><button class="mini-btn" data-action="privacy-close">我已了解</button></div>`}
  function exportData(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='智研学途_本机学习记录.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出 JSON 文件')}
  function handleAction(action,el){switch(action){
    case 'word-quiz':active.wordTab='quiz';active.answered=false;renderWords();break;
    case 'word-bank':active.wordTab='bank';renderWords();break;
    case 'mode-en':active.wordMode='en-zh';active.answered=false;renderWords();break;
    case 'mode-zh':active.wordMode='zh-en';active.answered=false;renderWords();break;
    case 'next-word':active.wordIndex=(active.wordIndex+1)%Math.max(1,data.words.length);active.answered=false;renderWords();break;
    case 'speak':speak();break;
    case 'word-import':importWords();break;
    case 'word-reset':if(confirm('用六个示例单词替换当前词库吗？此操作不会更改练习记录。')){data.words=baseWords.map(w=>({...w}));save();active.wordIndex=0;renderWords();toast('示例词库已恢复')}break;
    case 'del-word':data.words.splice(Number(el.dataset.index),1);active.wordIndex=0;save();renderWords();break;
    case 'history-hint':active.clue=Math.min(2,active.clue+1);renderHistory();break;
    case 'history-reveal':active.historyDone=true;renderHistory();break;
    case 'history-next':active.historyIndex=(active.historyIndex+1)%figures.length;active.clue=0;active.historyDone=false;renderHistory();break;
    case 'chem-answer':gradeChem(Number(el.dataset.index));break;
    case 'chem-reset':active.chemStep=0;active.chemMessage='';renderChem();break;
    case 'math-answer':gradeMath(Number(el.dataset.index));break;
    case 'math-next':active.mathIndex=(active.mathIndex+1)%mathQuestions.length;active.mathDone=false;renderMath();break;
    case 'match-again':renderMatch();break;
    case 'growth-view':case 'growth-words':active.page=action==='growth-view'?'growth':'words';render();break;
    case 'growth-export':exportData();break;
    case 'growth-clear':if(confirm('确定清除所有词库、练习、需求草稿和本地统计吗？该操作不可撤销。')){localStorage.removeItem('zyxt_v1');const initial=baseWords.map(w=>({...w}));data.words=initial;data.records=[];data.drafts=[];data.stats={attempts:0,correct:0,historyWins:0,chemComplete:0,mathCorrect:0};save();renderGrowth();syncCounters();toast('本机数据已重置')}break;
    case 'privacy-close':close();break;
  }}
})();

