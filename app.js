// Site content lives in content.js; this file handles presentation and interaction.
const wave = [12, 22, 36, 18, 43, 27, 16, 36, 24, 12]
  .map((height, index) => `<b style="--h:${height}px;--d:${index * -0.17}s"></b>`)
  .join('');

function departmentArtwork(department) {
  if (department.id === 'cv') {
    return `<div class="vinyl"><div class="vinyl-label">CV</div></div>
      <div class="wave">${wave}</div>`;
  }
  return '<div class="cos-card"><span>✧</span></div><div class="cos-card front"><span>✦</span></div>';
}

document.querySelector('#department-list').innerHTML = content.departments
  .map(department => `
    <article class="department ${department.id} reveal">
      <div class="department-copy">
        <span class="department-index">DEPARTMENT ${department.number} / ${department.name}</span>
        <h3>${department.headline}</h3>
        <p>${department.description}</p>
        <div class="tags">${department.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      </div>
      <div class="department-art" aria-hidden="true">
        ${departmentArtwork(department)}
        <span class="art-caption">${department.id === 'cv'
          ? 'EVERY VOICE, A NEW WORLD.' : 'BRING YOUR IMAGINATION TO LIFE.'}</span>
      </div>
    </article>`)
  .join('');

// Only the sanitized public display versions are referenced or deployed.
function posterMarkup(poster) {
  return `<div class="poster-crop" style="aspect-ratio:${poster.ratio}">
    <img src="${poster.src}" alt="${poster.title}，往期海报公开展示版"
      width="${poster.width}" height="${poster.height}" loading="lazy">
  </div>`;
}

document.querySelector('#poster-list').innerHTML = content.posters
  .map((poster, index) => `
    <button class="poster-button reveal" data-poster="${index}" aria-label="放大查看：${poster.title}">
      <div class="poster-stage">${posterMarkup(poster)}</div>
      <div class="poster-caption">
        <div><small>${poster.label}</small><strong>${poster.title}</strong></div>
        <span aria-hidden="true">↗</span>
      </div>
    </button>`)
  .join('');

const dialog = document.querySelector('#poster-dialog');
let opener;

document.querySelectorAll('[data-poster]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    const poster = content.posters[Number(button.dataset.poster)];
    document.querySelector('#dialog-title').textContent = poster.title;
    document.querySelector('#dialog-image').innerHTML = posterMarkup(poster);
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
  });
});

document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) {
    dialog.close();
  }
});
// There is one interactive control in this dialog. Keep Tab and Shift+Tab on it.
// Escape remains handled by the native dialog.
dialog.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    event.preventDefault();
    dialog.querySelector('.close').focus();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  opener?.focus({ preventScroll: true });
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 699px)');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('motion');
}

let pendingFrame = false;
const orbitOne = document.querySelector('.orbit-one');
const orbitTwo = document.querySelector('.orbit-two');
function updateParallax() {
  pendingFrame = false;
  if (reducedMotion.matches || mobile.matches) {
    orbitOne.style.transform = '';
    orbitTwo.style.transform = '';
    return;
  }
  const amount = Math.min(scrollY, 700) * 0.09;
  orbitOne.style.transform = `translateY(${amount}px) rotate(-16deg)`;
  orbitTwo.style.transform = `translateY(${-amount * 0.4}px) rotate(22deg)`;
}
addEventListener('scroll', () => {
  if (pendingFrame || reducedMotion.matches || mobile.matches) return;
  pendingFrame = true;
  requestAnimationFrame(updateParallax);
}, { passive: true });
reducedMotion.addEventListener('change', updateParallax);
mobile.addEventListener('change', updateParallax);

// A passive progress indicator makes the page's length visible without changing scrolling.
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
let progressPending = false;
function updateReadingProgress() {
  progressPending = false;
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0})`;
}
function requestProgressUpdate() {
  if (!progressPending) {
    progressPending = true;
    requestAnimationFrame(updateReadingProgress);
  }
}
addEventListener('scroll', requestProgressUpdate, { passive: true });
addEventListener('resize', requestProgressUpdate);
updateReadingProgress();

// Decorative stardust stays inside the opening scene and never captures input.
const heroArt = document.querySelector('.hero-art');
const stardust = document.createElement('div');
stardust.className = 'stardust';
stardust.setAttribute('aria-hidden', 'true');
const shapes = ['✦', '♪', '✧', '·'];
for (let i = 0; i < 14; i++) {
  const particle = document.createElement('span');
  particle.textContent = shapes[i % shapes.length];
  particle.style.setProperty('--x', `${5 + ((i * 37) % 90)}%`);
  particle.style.setProperty('--duration', `${5 + (i % 5)}s`);
  particle.style.setProperty('--delay', `${-i * 0.73}s`);
  particle.style.setProperty('--drift', `${i % 2 ? 24 : -20}px`);
  stardust.append(particle);
}
heroArt.prepend(stardust);

// A short burst appears at the touch or click point, without blocking controls.
document.querySelector('.hero').addEventListener('pointerup', event => {
  if (reducedMotion.matches || event.target.closest('a, button') || event.button !== 0) return;
  const burst = document.createElement('div');
  burst.className = 'spark-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.left = `${event.clientX}px`;
  burst.style.top = `${event.clientY}px`;
  for (let i = 0; i < 6; i++) {
    const spark = document.createElement('span');
    spark.textContent = i % 2 ? '✧' : '✦';
    spark.style.setProperty('--dx', `${Math.cos(i * Math.PI / 3) * 38}px`);
    spark.style.setProperty('--dy', `${Math.sin(i * Math.PI / 3) * 38}px`);
    burst.append(spark);
  }
  document.body.append(burst);
  setTimeout(() => burst.remove(), 800);
});

// Keep the headline accessible as one stable sentence; the visual line cycles gently.
const typedPhrase = document.querySelector('#typed-phrase');
const phrases = ['在这里相遇', '在这里发光', '在这里共鸣'];
let phraseIndex = 0;
let typingTimer;
function resetTyping() {
  clearTimeout(typingTimer);
  phraseIndex = 0;
  typedPhrase.textContent = phrases[0];
  if (!reducedMotion.matches && !document.hidden) typingTimer = setTimeout(erasePhrase, 3500);
}
function erasePhrase() {
  if (reducedMotion.matches || document.hidden) return;
  if (typedPhrase.textContent.length) {
    typedPhrase.textContent = Array.from(typedPhrase.textContent).slice(0, -1).join('');
    typingTimer = setTimeout(erasePhrase, 110);
  } else {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typingTimer = setTimeout(() => typePhrase(0), 350);
  }
}
function typePhrase(index) {
  if (reducedMotion.matches || document.hidden) return;
  const characters = Array.from(phrases[phraseIndex]);
  typedPhrase.textContent = characters.slice(0, index).join('');
  typingTimer = index < characters.length
    ? setTimeout(() => typePhrase(index + 1), 180)
    : setTimeout(erasePhrase, 3500);
}
reducedMotion.addEventListener('change', resetTyping);
document.addEventListener('visibilitychange', resetTyping);
resetTyping();

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const feedback = document.querySelector('.contact-feedback');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(button.dataset.copy);
      feedback.textContent = '已复制，可以粘贴使用。';
    } catch {
      feedback.textContent = '复制不可用，请长按或选中上方号码手动复制。';
    }
  });
});
