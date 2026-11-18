// Navigation, transitions, reveal animations and small interactive details
(() => {
  const pages = [...document.querySelectorAll('[data-page]')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const nav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  const routeNames = new Set(pages.map(page => page.dataset.page));

  function showPage(name, updateHistory = true) {
    const target = routeNames.has(name) ? name : 'home';
    pages.forEach(page => page.classList.toggle('active', page.dataset.page === target));
    navLinks.forEach(link => {
      const active = link.dataset.route === target;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    if (updateHistory && location.hash !== `#${target}`) history.pushState({ page: target }, '', `#${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(observeReveals);
  }

  function routeFromHash() {
    const name = location.hash.replace('#', '') || 'home';
    showPage(name, false);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const name = link.getAttribute('href').slice(1);
      if (!routeNames.has(name)) return;
      event.preventDefault();
      showPage(name);
    });
  });
  window.addEventListener('popstate', routeFromHash);
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  // Wish cards open one at a time for a tidy mobile layout.
  document.querySelectorAll('.wish-item').forEach(item => {
    item.addEventListener('click', () => {
      const willOpen = item.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.wish-item').forEach(other => other.setAttribute('aria-expanded', 'false'));
      item.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Gentle pointer tilt on desktop cards.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(850px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Intersection reveal, re-run whenever a page becomes active.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  function observeReveals() {
    document.querySelectorAll('.page.active .reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  }

  // Small floating decorative stars.
  const sparkleLayer = document.getElementById('sparkleLayer');
  const symbols = ['✦', '✧', '·', '♡'];
  for (let i = 0; i < 17; i++) {
    const star = document.createElement('span');
    star.className = 'sparkle-dot';
    star.textContent = symbols[i % symbols.length];
    star.style.left = `${(i * 37 + 8) % 97}%`;
    star.style.top = `${(i * 53 + 11) % 94}%`;
    star.style.fontSize = `${8 + (i % 4) * 4}px`;
    star.style.animationDelay = `${-(i % 7)}s`;
    sparkleLayer.appendChild(star);
  }

  // Replay takes the visitor back to the beginning.
  document.getElementById('replayButton').addEventListener('click', () => showPage('home'));

  routeFromHash();
  observeReveals();
})();
