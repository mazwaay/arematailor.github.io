// ===== Header shadow on scroll =====
const header = document.getElementById('siteHeader');
function setScrolled(){
  if (!header) return;
  const sc = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle('is-scrolled', sc > 4);
}
setScrolled();
window.addEventListener('scroll', setScrolled, { passive: true });

// ===== Mobile panel =====
const burger = document.getElementById('hBurger');
const panel  = document.getElementById('hMobileMenu');

function openPanel(){
  if(!panel) return;
  panel.classList.add('show');
  panel.setAttribute('aria-hidden','false');
  burger?.setAttribute('aria-expanded','true');
  document.body.classList.add('h-no-scroll');
  const firstLink = panel.querySelector('a');
  firstLink && firstLink.focus();
}
function closePanel(){
  if(!panel) return;
  panel.classList.remove('show');
  panel.setAttribute('aria-hidden','true');
  burger?.setAttribute('aria-expanded','false');
  document.body.classList.remove('h-no-scroll');
  burger?.focus();
}
burger?.addEventListener('click', () => {
  if(panel?.classList.contains('show')) closePanel();
  else openPanel();
});
panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', closePanel));
window.addEventListener('resize', () => { if (window.innerWidth > 900) closePanel(); });

// ===== Testimonials Auto Slider =====
(function(){
  const slider = document.getElementById('reviewSlider');
  const track = slider?.querySelector('.slides');
  const cards = Array.from(track?.children || []);
  if(!slider || !track || cards.length === 0) return;

  let index = 0;
  const gap = 12;
  const cardWidth = () => cards[0].getBoundingClientRect().width + gap;
  let timer;

  function goTo(i){
    index = i;
    const dx = -index * cardWidth();
    track.style.transform = `translateX(${dx}px)`;
  }
  function visibleCount(){ return Math.ceil(slider.clientWidth / cardWidth()); }
  function next(){
    const visible = visibleCount();
    if(index >= cards.length - visible){ index = 0; }
    else { index += 1; }
    goTo(index);
  }
  function prev(){
    const visible = visibleCount();
    if(index <= 0){ index = Math.max(0, cards.length - visible); }
    else { index -= 1; }
    goTo(index);
  }
  function start(){ stop(); timer = setInterval(next, 3500); }
  function stop(){ if(timer) clearInterval(timer); }

  document.getElementById('nextBtn')?.addEventListener('click', () => { next(); start(); });
  document.getElementById('prevBtn')?.addEventListener('click', () => { prev(); start(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // drag/swipe
  let isDown = false, startX = 0, startTx = 0;
  slider.addEventListener('pointerdown', e => {
    isDown = true; startX = e.clientX; startTx = -index * cardWidth();
    track.style.transition = 'none';
    slider.setPointerCapture(e.pointerId);
    stop();
  });
  slider.addEventListener('pointermove', e => {
    if(!isDown) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${startTx + dx}px)`;
  });
  function endDrag(e){
    if(!isDown) return;
    isDown = false;
    track.style.transition = '';
    const dx = e.clientX - startX;
    if(Math.abs(dx) > cardWidth()/4){ if(dx < 0) next(); else prev(); }
    else { goTo(index); }
    start();
  }
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);
  slider.addEventListener('pointerleave', endDrag);

  window.addEventListener('resize', () => goTo(index));
  goTo(0);
  start();
})();

// ===== Footer reveal on scroll =====
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if ('IntersectionObserver' in window){
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

// ===== FAQ accordion: smooth open/close (with fixed collapse) =====
(function(){
  const root = document.getElementById('pertanyaan-umum');
  if(!root) return;
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll('details').forEach(setupDetails);

  function setupDetails(d){
    let body = d.querySelector('.faq-body');
    if(!body){
      body = document.createElement('div');
      body.className = 'faq-body';
      const frag = document.createDocumentFragment();
      Array.from(d.children).forEach(ch => {
        if(ch.tagName?.toLowerCase() !== 'summary') frag.appendChild(ch);
      });
      body.appendChild(frag);
      d.appendChild(body);
    }
    if(d.open){ body.style.height = 'auto'; body.style.opacity = '1'; }
    d.addEventListener('toggle', () => animateToggle(d, body), { passive: true });
  }

  function animateToggle(details, body){
    if(reduce()){
      body.style.height = 'auto';
      body.style.opacity = '1';
      return;
    }
    function onEnd(e){
      if(e.propertyName !== 'height') return;
      body.style.transition = '';
      if(details.open){ body.style.height = 'auto'; }
      body.removeEventListener('transitionend', onEnd);
    }

    if(details.open){
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
      // close: lock current height -> 0 (smooth)
      const start = body.scrollHeight + 'px';
      body.style.transition = '';
      body.style.height = start;
      body.style.opacity = '1';
      void body.offsetHeight; // force reflow
      body.style.transition = 'height .32s ease, opacity .32s ease';
      requestAnimationFrame(() => {
        body.style.height = '0px';
        body.style.opacity = '0';
      });
      body.addEventListener('transitionend', onEnd);
    }
  }
})();
