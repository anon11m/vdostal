/* VDOSTAL — Creative Content Agency | main.js */
(function(){
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== i18n — EN / UK language switch ===== */
  var I18N_META={
    en:{title:'Creative Content Agency for Brands & Experts — VDOSTAL',desc:'VDOSTAL is a creative content agency producing video editing, motion design, social media visuals and AI content for businesses, experts and personal brands.'},
    uk:{title:'Креативна контент-агенція для брендів та експертів — VDOSTAL',desc:'VDOSTAL — креативна контент-агенція: відеомонтаж, моушн-дизайн, візуали для соцмереж та AI-контент для бізнесів, експертів і персональних брендів.'}
  };
  function setLang(lang){
    if(lang!=='uk')lang='en';
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-en]').forEach(function(el){
      var v=el.getAttribute('data-'+lang);if(v!=null)el.innerHTML=v;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){
      var v=el.getAttribute('data-'+lang+'-ph');if(v!=null)el.setAttribute('placeholder',v);
    });
    var m=I18N_META[lang];
    if(m){document.title=m.title;var md=document.querySelector('meta[name="description"]');if(md)md.setAttribute('content',m.desc);}
    document.querySelectorAll('.lang-btn').forEach(function(b){
      var on=b.getAttribute('data-lang')===lang;
      b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');
    });
    try{localStorage.setItem('lang',lang);}catch(e){}
    try{document.dispatchEvent(new CustomEvent('langchange'));}catch(e){}
  }
  var savedLang;try{savedLang=localStorage.getItem('lang');}catch(e){}
  if(!savedLang)savedLang=(navigator.language&&/^uk/i.test(navigator.language))?'uk':'en';
  setLang(savedLang);
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'));});
  });

  /* header scroll */
  var header=document.getElementById('header');
  var onScroll=function(){header.classList.toggle('scrolled',window.scrollY>30);};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});

  /* mobile menu */
  var burger=document.getElementById('burger'),mobile=document.getElementById('mobile');
  burger.addEventListener('click',function(){
    var open=mobile.classList.toggle('open');burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    document.body.style.overflow=open?'hidden':'';
  });
  mobile.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
    mobile.classList.remove('open');burger.classList.remove('open');burger.setAttribute('aria-expanded',false);document.body.style.overflow='';
  });});

  /* reveal — replays every time the element enters the viewport */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');}
      else if(!RM){e.target.classList.remove('in');}
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  /* counters — rolling-digit odometer, replays each time it scrolls into view */
  function fmt(n,sep){return sep?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,','):String(n);}
  var SPINS=2; /* extra full 0–9 rotations before settling */
  function roll(el){
    var t=+el.dataset.target,sep=el.dataset.sep,str=fmt(t,sep),chars=str.split('');
    el.classList.add('odo');el.textContent='';
    var reels=[];
    chars.forEach(function(ch,i){
      if(ch>='0'&&ch<='9'){
        var d=+ch,box=document.createElement('span');box.className='odo-d';
        var reel=document.createElement('span');reel.className='odo-reel';
        var total=SPINS*10+d,html='';
        for(var k=0;k<=total;k++)html+='<span>'+(k%10)+'</span>';
        reel.innerHTML=html;box.appendChild(reel);el.appendChild(box);
        reels.push({reel:reel,total:total,i:i});
      }else{
        var sp=document.createElement('span');sp.className='odo-sep';sp.textContent=ch;el.appendChild(sp);
      }
    });
    /* start at 0, then release to final digit with a gentle left→right cascade */
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      reels.forEach(function(r){
        r.reel.style.transitionDelay=(r.i*0.05)+'s';
        r.reel.style.transform='translateY(-'+r.total+'em)';
      });
    });});
  }
  var cio=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var el=e.target,sep=el.dataset.sep;
      if(!e.isIntersecting){if(!RM){el.classList.remove('odo');el.textContent=fmt(0,sep);}return;}
      if(RM){el.classList.remove('odo');el.textContent=fmt(+el.dataset.target,sep);return;}
      roll(el);
    });
  },{threshold:.6});
  document.querySelectorAll('.counter').forEach(function(el){cio.observe(el);});

  /* parallax hero frames (subtle) */
  if(!RM){
    var frames=document.querySelectorAll('.hf');
    window.addEventListener('scroll',function(){
      var y=window.scrollY;
      frames.forEach(function(f,i){var d=(i%2===0?-1:1)*(y*0.02);f.style.transform='translateY('+d+'px)';});
    },{passive:true});
  }

  /* faq */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){
      var open=item.classList.toggle('open');q.setAttribute('aria-expanded',open);
      a.style.maxHeight=open?a.scrollHeight+'px':0;
    });
  });

  /* package -> form prefill */
  document.querySelectorAll('.pkg-cta').forEach(function(el){
    el.addEventListener('click',function(e){
      e.preventDefault();
      var p=el.dataset.pkg;
      /* preselect the plan in the left dropdown */
      var plan=document.getElementById('planSelect');
      if(plan&&plan.selectValue)plan.selectValue(p);
      document.getElementById('contact').scrollIntoView({behavior:RM?'auto':'smooth'});
      /* nudge the user toward picking the service on the right */
      setTimeout(function(){var b=document.getElementById('f-need-btn');if(b)b.focus({preventScroll:true});},RM?0:600);
    });
  });

  /* custom on-brand dropdowns (.cselect) */
  document.querySelectorAll('.cselect').forEach(function(sel){
    var trigger=sel.querySelector('.cselect-trigger'),
        valueEl=sel.querySelector('.cselect-value'),
        hidden=sel.querySelector('input[type="hidden"]'),
        options=[].slice.call(sel.querySelectorAll('.cselect-option')),
        activeIdx=-1;
    function setActive(i){options.forEach(function(o){o.classList.remove('active');});activeIdx=i;if(i>=0&&i<options.length)options[i].classList.add('active');}
    function open(){sel.classList.add('open');trigger.setAttribute('aria-expanded','true');
      var sIdx=options.findIndex(function(o){return o.getAttribute('aria-selected')==='true';});setActive(sIdx);}
    function close(){sel.classList.remove('open');trigger.setAttribute('aria-expanded','false');setActive(-1);}
    function toggle(){sel.classList.contains('open')?close():open();}
    function apply(opt){
      options.forEach(function(o){o.setAttribute('aria-selected','false');});
      opt.setAttribute('aria-selected','true');
      valueEl.textContent=opt.textContent;
      trigger.classList.remove('is-placeholder');
      hidden.value=opt.getAttribute('data-value');
      sel.classList.remove('invalid');
    }
    function choose(opt){apply(opt);close();trigger.focus();}
    /* programmatic set (e.g. from the package buttons), no focus/scroll */
    sel.selectValue=function(val){
      var opt=options.filter(function(o){return o.getAttribute('data-value')===val;})[0];
      if(opt){apply(opt);return true;}return false;
    };
    trigger.addEventListener('click',function(e){e.stopPropagation();toggle();});
    options.forEach(function(opt,i){
      opt.addEventListener('click',function(e){e.stopPropagation();choose(opt);});
      opt.addEventListener('mousemove',function(){setActive(i);});
    });
    trigger.addEventListener('keydown',function(e){
      var k=e.key;
      if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();
        if(!sel.classList.contains('open')){open();return;}
        var n=activeIdx+(k==='ArrowDown'?1:-1);if(n<0)n=options.length-1;if(n>=options.length)n=0;setActive(n);
      }else if(k==='Enter'||k===' '){e.preventDefault();
        if(!sel.classList.contains('open'))open();else if(activeIdx>=0)choose(options[activeIdx]);
      }else if(k==='Escape'){close();}
    });
    document.addEventListener('click',function(e){if(!sel.contains(e.target))close();});
  });

  /* form submit — sends to Google Forms via the hidden iframe, keeps the success screen */
  var leadForm=document.getElementById('leadForm');
  /* clear the invalid highlight once the user starts fixing a field */
  ['f-name','f-brand','f-link','f-email','f-msg'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('input',function(){el.classList.remove('invalid');});
  });
  leadForm.addEventListener('submit',function(e){
    /* the Google Form marks Name, Brand, Telegram/WhatsApp, Email and "What do you need"
       as required — validate them here so incomplete leads aren't silently dropped */
    var firstBad=null;
    ['f-name','f-brand','f-link','f-email'].forEach(function(id){
      var el=document.getElementById(id);
      if(el&&!el.value.trim()){el.classList.add('invalid');if(!firstBad)firstBad=el;}
    });
    var email=document.getElementById('f-email');
    if(email&&email.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
      email.classList.add('invalid');if(!firstBad)firstBad=email;
    }
    var need=document.getElementById('f-need');
    if(need&&!need.value.trim()){
      var ns=document.getElementById('needSelect');if(ns)ns.classList.add('invalid');
      if(!firstBad)firstBad=document.getElementById('f-need-btn');
    }
    if(firstBad){e.preventDefault();try{firstBad.focus();}catch(_){}return;}
    /* valid — let the native POST reach the hidden iframe, then show the success screen */
    this.style.display='none';
    var s=document.getElementById('formSuccess');s.classList.add('show');
    s.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  });

  /* prevent placeholder (#) links from jumping to top */
  document.querySelectorAll('a[href="#"]').forEach(function(a){
    a.addEventListener('click',function(e){e.preventDefault();});
  });

  /* hero frame videos + lightbox */
  (function(){
    var box=document.getElementById('vbox');
    if(!box)return;
    var boxVid=document.getElementById('vboxVideo'),boxClose=document.getElementById('vboxClose');
    /* muted looping previews — kick them off (browsers allow muted autoplay) */
    document.querySelectorAll('.hf-vid').forEach(function(v){
      v.muted=true;
      var p=v.play();if(p&&p.catch)p.catch(function(){});
    });
    /* work-section videos are heavy — play only while in view, pause otherwise */
    if('IntersectionObserver' in window){
      var wvIo=new IntersectionObserver(function(es){
        es.forEach(function(e){var v=e.target;
          if(e.isIntersecting){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){});}
          else{try{v.pause();}catch(_){}}
        });
      },{threshold:.25});
      document.querySelectorAll('.work-vid').forEach(function(v){wvIo.observe(v);});
    }
    function openBox(src){
      boxVid.src=src;boxVid.muted=false;boxVid.currentTime=0;
      box.classList.add('open');box.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      var p=boxVid.play();if(p&&p.catch)p.catch(function(){});
    }
    function closeBox(){
      box.classList.remove('open');box.setAttribute('aria-hidden','true');
      try{boxVid.pause();}catch(e){}
      boxVid.removeAttribute('src');boxVid.load();
      document.body.style.overflow='';
    }
    document.querySelectorAll('[data-video]').forEach(function(f){
      f.addEventListener('click',function(){openBox(f.getAttribute('data-video'));});
    });
    boxClose.addEventListener('click',closeBox);
    box.addEventListener('click',function(e){if(e.target===box)closeBox();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('open'))closeBox();});
  })();

  /* testimonials — show "read more" only when the quote is actually clamped */
  (function(){
    var cards=[].slice.call(document.querySelectorAll('.tst'));
    if(!cards.length)return;
    function checkClamp(){
      cards.forEach(function(card){
        if(card.classList.contains('expanded'))return;
        var p=card.querySelector('.tst-q p');
        if(!p)return;
        card.classList.toggle('has-more',p.scrollHeight-p.clientHeight>2);
      });
    }
    cards.forEach(function(card){
      var btn=card.querySelector('.tst-more');
      if(!btn)return;
      btn.addEventListener('click',function(){
        var exp=card.classList.toggle('expanded');
        btn.setAttribute('aria-expanded',exp?'true':'false');
      });
    });
    checkClamp();
    window.addEventListener('load',checkClamp);
    window.addEventListener('resize',checkClamp,{passive:true});
    document.addEventListener('langchange',function(){setTimeout(checkClamp,30);});
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(checkClamp);}
  })();

  /* Telegram round video reviews — silent loop in view; click = restart with sound, revert on end */
  (function(){
    var notes=[].slice.call(document.querySelectorAll('.tg-note'));
    if(!notes.length)return;
    function revert(note,v){
      note.classList.remove('sound');
      v.muted=true;v.loop=true;try{v.currentTime=0;}catch(_){}
      var p=v.play();if(p&&p.catch)p.catch(function(){});
    }
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){var v=e.target.querySelector('.tg-vid');if(!v)return;
          if(e.isIntersecting){if(!e.target.classList.contains('sound')){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){});}}
          else{if(!e.target.classList.contains('sound')){try{v.pause();}catch(_){}}}
        });
      },{threshold:.3});
      notes.forEach(function(n){io.observe(n);});
    }
    notes.forEach(function(note){
      var v=note.querySelector('.tg-vid');
      note.addEventListener('click',function(){
        if(note.classList.contains('sound')){revert(note,v);return;}
        note.classList.add('sound');
        v.loop=false;v.muted=false;try{v.currentTime=0;}catch(_){}
        var p=v.play();if(p&&p.catch)p.catch(function(){});
      });
      v.addEventListener('ended',function(){revert(note,v);});
    });
  })();

  /* year */
  document.getElementById('year').textContent=new Date().getFullYear();
})();
