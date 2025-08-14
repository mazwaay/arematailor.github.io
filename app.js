// app.js (cleaned)
// Strict mode for safer JS
'use strict';

/* ===== Header shadow on scroll ===== */
(() => {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const setScrolled = () => {
    const sc = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', sc > 4);
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });
})();

/* ===== Mobile panel ===== */
(() => {
  const burger = document.getElementById('hBurger');
  const panel  = document.getElementById('hMobileMenu');
  if (!burger || !panel) return;

  const openPanel = () => {
    panel.classList.add('show');
    panel.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('h-no-scroll');
    const firstLink = panel.querySelector('a');
    if (firstLink) firstLink.focus();
  };
  const closePanel = () => {
    panel.classList.remove('show');
    panel.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('h-no-scroll');
    burger.focus();
  };

  burger.addEventListener('click', () => {
    if (panel.classList.contains('show')) closePanel();
    else openPanel();
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closePanel));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closePanel(); }, { passive: true });
})();

/* ===== Testimonials Auto Slider ===== */
(() => {
  const slider = document.getElementById('reviewSlider');
  const track  = slider?.querySelector('.slides');
  const cards  = Array.from(track?.children || []);
  if (!slider || !track || cards.length === 0) return;

  let index = 0;
  const gap = 12;
  const cardWidth = () => cards[0].getBoundingClientRect().width + gap;
  let timer;

  const goTo = (i) => {
    index = i;
    const dx = -index * cardWidth();
    track.style.transform = `translateX(${dx}px)`;
  };
  const visibleCount = () => Math.ceil(slider.clientWidth / cardWidth());
  const next = () => {
    const visible = visibleCount();
    index = (index >= cards.length - visible) ? 0 : index + 1;
    goTo(index);
  };
  const prev = () => {
    const visible = visibleCount();
    index = (index <= 0) ? Math.max(0, cards.length - visible) : index - 1;
    goTo(index);
  };
  const start = () => { stop(); timer = setInterval(next, 3500); };
  const stop  = () => { if (timer) clearInterval(timer); };

  document.getElementById('nextBtn')?.addEventListener('click', () => { next(); start(); });
  document.getElementById('prevBtn')?.addEventListener('click', () => { prev(); start(); });

  ['mouseenter', 'focusin'].forEach(ev => slider.addEventListener(ev, stop));
  ['mouseleave', 'focusout'].forEach(ev => slider.addEventListener(ev, start));

  // drag/swipe
  let isDown = false, startX = 0, startTx = 0;
  slider.addEventListener('pointerdown', e => {
    isDown = true; startX = e.clientX; startTx = -index * cardWidth();
    track.style.transition = 'none';
    slider.setPointerCapture(e.pointerId);
    stop();
  });
  const endDrag = (e) => {
    if (!isDown) return;
    isDown = false;
    track.style.transition = '';
    const dx = e.clientX - startX;
    if (Math.abs(dx) > cardWidth() / 4) { if (dx < 0) next(); else prev(); }
    else { goTo(index); }
    start();
  };
  slider.addEventListener('pointermove', e => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${startTx + dx}px)`;
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev => slider.addEventListener(ev, endDrag));

  window.addEventListener('resize', () => goTo(index), { passive: true });
  goTo(0);
  start();
})();

/* ===== Footer reveal on scroll ===== */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }
})();

/* ===== FAQ accordion: smooth open/close ===== */
(() => {
  const root = document.getElementById('pertanyaan-umum');
  if (!root) return;
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateToggle = (details, body) => {
    if (reduce()){
      body.style.height = 'auto';
      body.style.opacity = '1';
      return;
    }
    const onEnd = (e) => {
      if (e.propertyName !== 'height') return;
      body.style.transition = '';
      if (details.open){ body.style.height = 'auto'; }
      body.removeEventListener('transitionend', onEnd);
    };

    if (details.open){
      // open
      body.style.display = 'block';
      const target = body.scrollHeight + 'px';
      body.style.transition = '';
      body.style.height = '0px';
      body.style.opacity = '0';
      requestAnimationFrame(() => {
        body.style.transition = 'height .36s ease, opacity .36s ease';
        body.style.height = target;
        body.style.opacity = '1';
      });
      body.addEventListener('transitionend', onEnd);
    } else {
      // close
      const start = body.scrollHeight + 'px';
      body.style.transition = '';
      body.style.height = start;
      body.style.opacity = '1';
      void body.offsetHeight;
      body.style.transition = 'height .32s ease, opacity .32s ease';
      requestAnimationFrame(() => {
        body.style.height = '0px';
        body.style.opacity = '0';
      });
      body.addEventListener('transitionend', onEnd);
    }
  };

  const setupDetails = (d) => {
    let body = d.querySelector('.faq-body');
    if (!body){
      body = document.createElement('div');
      body.className = 'faq-body';
      const frag = document.createDocumentFragment();
      Array.from(d.children).forEach(ch => {
        if (ch.tagName?.toLowerCase() !== 'summary') frag.appendChild(ch);
      });
      body.appendChild(frag);
      d.appendChild(body);
    }
    if (d.open){ body.style.height = 'auto'; body.style.opacity = '1'; }
    d.addEventListener('toggle', () => animateToggle(d, body), { passive: true });
  };

  root.querySelectorAll('details').forEach(setupDetails);
})();

/* ==== Gallery jiggle + Lightbox ==== */
(() => {
  const imgs = Array.from(document.querySelectorAll('.gallery .item img'));
  if (!imgs.length) return;

  // randomize small jiggle animation + enable zoom
  const open = (i) => {
    idx = i;
    lbImg.src = imgs[idx].currentSrc || imgs[idx].src;
    lbImg.alt = imgs[idx].alt || 'Pratinjau';
    lb.classList.add('show');
    lb.setAttribute('aria-hidden','false');
    document.body.classList.add('h-no-scroll');
    lbClose.focus();
  };

  imgs.forEach((img, i) => {
    const dx    = (Math.random()*10 + 4) * (Math.random()<.5 ? -1 : 1);
    const dy    = (Math.random()*10 + 6) * (Math.random()<.5 ? -1 : 1);
    const rot   = (Math.random()*1.2 + 0.2) * (Math.random()<.5 ? -1 : 1);
    const dur   = (Math.random()*4 + 6).toFixed(2);
    const delay = (Math.random()*2).toFixed(2);
    img.style.setProperty('--dx', `${dx}px`);
    img.style.setProperty('--dy', `${dy}px`);
    img.style.setProperty('--rot', `${rot}deg`);
    img.style.setProperty('--dur', `${dur}s`);
    img.style.setProperty('--delay', `${delay}s`);
    img.setAttribute('tabindex','0');
    img.style.cursor = 'zoom-in';
    img.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }});
    img.addEventListener('click', () => open(i));
  });

  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lbImg');
  const lbClose= document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  if (!lb || !lbImg || !lbClose || !lbPrev || !lbNext) return;

  let idx = 0;

  const close = () => {
    lb.classList.remove('show');
    lb.setAttribute('aria-hidden','true');
    document.body.classList.remove('h-no-scroll');
  };
  const nav = (delta) => {
    idx = (idx + delta + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].currentSrc || imgs[idx].src;
    lbImg.alt = imgs[idx].alt || 'Pratinjau';
  };

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', ()=>nav(-1));
  lbNext.addEventListener('click', ()=>nav(1));
  lb.addEventListener('click', (e)=>{ if (e.target === lb) close(); });

  document.addEventListener('keydown', (e)=>{
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') nav(1);
    else if (e.key === 'ArrowLeft') nav(-1);
  });

  // swipe on mobile
  let startX=0, swiping=false;
  lbImg.addEventListener('pointerdown', e=>{ swiping=true; startX=e.clientX; lbImg.setPointerCapture(e.pointerId); });
  lbImg.addEventListener('pointerup', e=>{
    if (!swiping) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) nav(dx<0 ? 1 : -1);
    swiping=false;
  });
})();

/* ===== Catalog controls: filter + sort + mobile chips slider ===== */
(() => {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll('.item'));

  // refs desktop
  const catChipsDesk = document.getElementById('catChips');
  const sortDesk     = document.getElementById('sortBy');

  // refs mobile
  const catChipsMob  = document.getElementById('catChipsMobile');
  const sortMob      = document.getElementById('sortByMobile');
  const leftBtn      = document.querySelector('.scroll-arrow.left');
  const rightBtn     = document.querySelector('.scroll-arrow.right');

  // state
  const state = { cat: 'all', sort: 'newest' };

  // filter & sort
  const applyFilter = () => {
    const { cat } = state;
    items.forEach(it => {
      const show = (cat === 'all') || (it.dataset.cat === cat);
      it.classList.toggle('is-hidden', !show);
    });
  };
  const applySort = () => {
    const { sort } = state;
    const cmp = sort === 'popular'
      ? (a,b) => Number(b.dataset.pop) - Number(a.dataset.pop)
      : (a,b) => new Date(b.dataset.date) - new Date(a.dataset.date);
    const visible = items.filter(it => !it.classList.contains('is-hidden'));
    visible.sort(cmp).forEach(n => grid.appendChild(n));
  };
  const render = () => { applyFilter(); applySort(); };

  const syncDesktopUI = () => {
    catChipsDesk?.querySelectorAll('.chip').forEach(ch => {
      const active = ch.dataset.cat === state.cat || (state.cat==='all' && ch.dataset.cat==='all');
      ch.classList.toggle('is-active', active);
    });
    if (sortDesk) sortDesk.value = state.sort;
  };
  const syncMobileUI = () => {
    catChipsMob?.querySelectorAll('.chip').forEach(ch => {
      const active = ch.dataset.cat === state.cat || (state.cat==='all' && ch.dataset.cat==='all');
      ch.classList.toggle('is-active', active);
    });
    if (sortMob) sortMob.value = state.sort;
  };

  // events desktop
  catChipsDesk?.addEventListener('click', e=>{
    const btn = e.target.closest('.chip'); if(!btn) return;
    state.cat = btn.dataset.cat || 'all';
    syncDesktopUI(); syncMobileUI(); render();
  });
  sortDesk?.addEventListener('change', e=>{
    state.sort = e.target.value || 'newest';
    if (sortMob) sortMob.value = state.sort;
    render();
  });

  // events mobile
  catChipsMob?.addEventListener('click', e=>{
    const btn = e.target.closest('.chip'); if(!btn) return;
    state.cat = btn.dataset.cat || 'all';
    syncDesktopUI(); syncMobileUI(); render();
  });
  sortMob?.addEventListener('change', e=>{
    state.sort = e.target.value || 'newest';
    if (sortDesk) sortDesk.value = state.sort;
    render();
  });

  // mobile chips: arrows + drag
  (() => {
    const scroller = catChipsMob;
    if (!scroller || !leftBtn || !rightBtn) return;

    const updateArrows = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const atStart = scroller.scrollLeft <= 1;
      const atEnd   = scroller.scrollLeft >= max - 1;
      leftBtn.hidden  = (max <= 0) || atStart;
      rightBtn.hidden = (max <= 0) || atEnd;
    };
    const scrollStep = (dir) => {
      const step = Math.max(120, scroller.clientWidth * 0.6);
      scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
    };
    leftBtn.addEventListener('click',  ()=> scrollStep(-1));
    rightBtn.addEventListener('click', ()=> scrollStep(1));
    scroller.addEventListener('scroll', updateArrows, { passive:true });
    window.addEventListener('resize', updateArrows, { passive:true });

    // drag-to-scroll (touch/desktop)
    let down=false, startX=0, startL=0;
    scroller.addEventListener('pointerdown', e=>{
      down=true; startX=e.clientX; startL=scroller.scrollLeft; scroller.setPointerCapture(e.pointerId);
    });
    scroller.addEventListener('pointermove', e=>{
      if(!down) return; scroller.scrollLeft = startL - (e.clientX - startX);
    });
    ['pointerup','pointercancel','mouseleave'].forEach(ev=> scroller.addEventListener(ev, ()=> down=false));

    updateArrows();
  })();

  // init
  syncDesktopUI(); syncMobileUI(); render();
})();

/* ===== Global Lazy Loader (img / iframe / video poster) ===== */
(() => {
  const supportsNative = 'loading' in HTMLImageElement.prototype;

  const markLazy = () => {
    document.querySelectorAll('img:not([data-eager])').forEach(img=>{
      if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      if(!img.classList.contains('lazy-fade')) img.classList.add('lazy-fade','lazy-blur');
      if(!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority','low');
    });
    document.querySelectorAll('iframe:not([data-eager])').forEach(ifr=>{
      if(!ifr.hasAttribute('loading')) ifr.setAttribute('loading','lazy');
    });
    document.querySelectorAll('video[data-poster]').forEach(v=>{
      v.poster = '';
      if(!v.classList.contains('lazy-fade')) v.classList.add('lazy-fade','lazy-blur');
    });
  };

  const swapSrc = (el) => {
    if (el.dataset.src){
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    }
    if (el.dataset.srcset){
      el.srcset = el.dataset.srcset;
      el.removeAttribute('data-srcset');
    }
    if (el.tagName === 'VIDEO' && el.dataset.poster){
      el.poster = el.dataset.poster;
      el.removeAttribute('data-poster');
    }
  };

  const loadNow = (el) => {
    swapSrc(el);
    if ('decode' in el){
      el.decode().catch(()=>{}).finally(()=> el.classList.add('is-loaded'));
    } else {
      el.addEventListener('load', ()=> el.classList.add('is-loaded'), { once:true });
      el.addEventListener('error', ()=> el.classList.add('is-loaded'), { once:true });
    }
  };

  const initObserver = () => {
    if (!('IntersectionObserver' in window)){
      document.querySelectorAll('img,iframe,video').forEach(loadNow);
      return;
    }
    const io = new IntersectionObserver((entries,obs)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);
        loadNow(el);
      });
    }, { root:null, rootMargin: '200px 0px', threshold: 0.01 });

    document.querySelectorAll('img,iframe,video').forEach(el=>{
      if (el.hasAttribute('data-eager')) {
        el.classList.add('is-loaded');
        return;
      }
      if (supportsNative && el.loading === 'lazy'){
        el.addEventListener('load',  ()=> el.classList.add('is-loaded'), { once:true });
        el.addEventListener('error', ()=> el.classList.add('is-loaded'), { once:true });
      }
      io.observe(el);
    });
  };

  markLazy();
  initObserver();
})();
