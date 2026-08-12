/**
 * KX Analyst Orbit Product Presentation
 * Main Script
 */

const state = {
  currentSlide: 0,
  totalSlides: 15,
  sidebarOpen: false,
  presentationMode: false,
  archLayersRevealed: 0,
  timelineStep: 0,
};

const SPEAKER_NOTES = [
  "20 sec. Just set the stage — no content yet.",
  "1.5 min. Introduce KX Analyst as a visual, browser-based interface sitting on top of kdb+. Explain that it enables both technical devs to code directly and business users to query and transform data without code.",
  "2 min. Keep this relatable — describe the pain, not the tech. This sets up why the next slide (the solution) matters.",
  "2 min. This is the 'here's what it is' slide — keep it plain-English, save technical depth for Q&A.",
  "1 min. Replace the last row with your actual team makeup — this is the one row an MD is likely to ask about directly ('who on our team uses this and how?').",
  "1.5 min. Optional slide, good if time allows — shows this isn't a narrow tool. The 'Analyst building Analyst' card is the most memorable one — mention it even if you skip the others.",
  "2 min. Mention both paths — the dev lifecycle AND the simpler data-exploration path — to show Analyst serves the whole team, not just engineers.",
  "2.5 min. This is the slide most likely to get a technical question from the MD — know the remote/IPC point cold. Backup: Analyst can connect to a completely separate kdb+ process on another machine via IPC (Remote Editors) — this means huge datasets never have to move into the Analyst environment itself; only the query result comes back.",
  "2.5 min. This slide covers what's actually inside the IDE — Q menu is where developers spend most of their time (Go to Definition and Uses/Selection make navigating a large codebase manageable). Tools menu is what makes Analyst useful beyond coding. Help menu signals product maturity — built-in docs and a real learning path.",
  "2 min. This is your most memorable slide — prioritize getting even one real screenshot here over having none. A short screen recording (30-60 sec) works even better than static images if your tool supports embedded video.",
  "1.5 min. If you don't have hard numbers yet, say so honestly — e.g. 'we're still measuring this precisely, early indication is positive.' MDs respect an honest estimate over an invented number.",
  "2 min. Emphasize the axqcoverage discovery (Card 3/4) — it shows initiative beyond the assigned ticket, not just task completion.",
  "1.5 min. This is a good 'scale of work' slide — 50+ repos is a strong number to say out loud even without much elaboration on each step.",
  "2 min. Card 4 (local build research) is not a failure — frame it as a properly-scoped investigation that surfaced a real infrastructure gap, not being stuck. The mixed statuses here are intentional honest reporting.",
  "Transition slide only — no content to present, just open the floor."
];

let animationTimers = [];

// 1. Network Canvas Background
function initCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 60;
  const CONNECTION_DISTANCE = 120;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255, 0.25)';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONNECTION_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255, ${0.06 * (1 - dist / CONNECTION_DISTANCE)})`;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// 2. Slide Navigation
function goToSlide(index) {
  if (index < 0 || index >= state.totalSlides) return;
  
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  
  const currentSlideEl = slides[state.currentSlide];
  const nextSlideEl = slides[index];
  
  const isForward = index > state.currentSlide;
  const exitClass = isForward ? 'exit-left' : 'exit-right';
  
  if (currentSlideEl && index !== state.currentSlide) {
    currentSlideEl.classList.remove('active');
    currentSlideEl.classList.add(exitClass);
  }
  
  // Clear any existing animation timers
  animationTimers.forEach(timer => clearTimeout(timer));
  animationTimers = [];
  
  setTimeout(() => {
    if (currentSlideEl) {
      currentSlideEl.classList.remove('exit-left', 'exit-right');
    }
    nextSlideEl.classList.add('active');
    
    state.currentSlide = index;
    localStorage.setItem('kx_current_slide', index);
    
    updateUI();
    onSlideEnter(index);
    updateSpeakerNotes();
  }, 50);
}

function nextSlide() {
  goToSlide(state.currentSlide + 1);
}

function prevSlide() {
  goToSlide(state.currentSlide - 1);
}

// 3. Progress Bar & Counter
function updateUI() {
  const progressBar = document.getElementById('progress-bar');
  const slideCounter = document.getElementById('slide-counter');
  
  if (progressBar) {
    const progress = (state.currentSlide / (state.totalSlides - 1)) * 100;
    progressBar.style.width = `${progress}%`;
  }
  
  if (slideCounter) {
    slideCounter.textContent = `${state.currentSlide + 1} / ${state.totalSlides}`;
  }
}

// 4. Sidebar Toggle & 5. Speaker Notes
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  state.sidebarOpen = !state.sidebarOpen;
  if (state.sidebarOpen) {
    sidebar.classList.add('open');
    updateSpeakerNotes();
  } else {
    sidebar.classList.remove('open');
  }
}

function updateSpeakerNotes() {
  const notesEl = document.getElementById('speaker-notes');
  if (notesEl && SPEAKER_NOTES[state.currentSlide]) {
    notesEl.textContent = SPEAKER_NOTES[state.currentSlide];
  }
}

// 6. Slide-Specific Animations
function onSlideEnter(index) {
  const activeSlide = document.querySelector('.slide.active');
  if (!activeSlide) return;
  
  // Reset animations
  activeSlide.querySelectorAll('.animate-in, .visible, .completed, .active').forEach(el => {
    // Only remove these classes if they are animation-related (keep .slide.active)
    if (!el.classList.contains('slide')) {
      el.classList.remove('animate-in', 'visible', 'completed', 'active');
    }
  });

  if (index === 1) { // Slide 2 - What is KX Analyst
    const items = activeSlide.querySelectorAll('.about-bullet-card');
    items.forEach((item, i) => {
      item.style.animationDelay = `${i * 0.15}s`;
      item.classList.add('animate-in');
    });
  }
  else if (index === 2) { // Slide 3 - Problem items
    const problemItems = activeSlide.querySelectorAll('.problem-item');
    problemItems.forEach((item, i) => {
      item.style.animationDelay = `${i * 0.15}s`;
      item.classList.add('animate-in');
    });
    const funnelSvg = activeSlide.querySelector('svg');
    if (funnelSvg) funnelSvg.classList.add('animate-in');

    // Reset the "How the backlog builds" demo in case a previous run was interrupted
    const reqIcons = activeSlide.querySelectorAll('.req-icon');
    reqIcons.forEach(el => el.classList.remove('flying'));
    const bottleneck = activeSlide.querySelector('#bottleneck-box');
    if (bottleneck) bottleneck.classList.remove('pulse');
    const badge = activeSlide.querySelector('#queue-badge');
    const badgeText = activeSlide.querySelector('#queue-badge-text');
    if (badge) badge.style.opacity = 0;
    if (badgeText) { badgeText.style.opacity = 0; badgeText.textContent = '0'; }
    const slowerText = activeSlide.querySelector('#slower-output-text');
    if (slowerText) slowerText.classList.remove('warning');
    const problemCaption = activeSlide.querySelector('#problem-flow-caption');
    if (problemCaption) problemCaption.textContent = 'Click "Play" to see how this backlog builds up in real teams →';
    const problemBtn = activeSlide.querySelector('#problem-play-btn');
    if (problemBtn) { problemBtn.disabled = false; problemBtn.textContent = '▶ Show How This Happens'; }
  } 
  else if (index === 3) { // Slide 4 - Solution resolve demo reset
    const chips = activeSlide.querySelectorAll('.sol-chip');
    const icons = ['📊', '📈', '❓', '📋', '📄'];
    chips.forEach((chip, i) => { chip.classList.remove('done'); chip.textContent = icons[i] || chip.textContent; });
    const analystBox = activeSlide.querySelector('#sol-analyst-box');
    if (analystBox) analystBox.classList.remove('pulse');
    const solCaption = activeSlide.querySelector('#solution-flow-caption');
    if (solCaption) solCaption.textContent = 'Click "Play" to see how Analyst handles the same 5 requests — no queue this time →';
    const solBtn = activeSlide.querySelector('#solution-play-btn');
    if (solBtn) { solBtn.disabled = false; solBtn.textContent = '▶ Show How Analyst Resolves This'; }
  }
  else if (index === 4) { // Slide 5 - User cards
    const userCards = activeSlide.querySelectorAll('.user-card');
    userCards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.15}s`;
      card.classList.add('animate-in');
    });
  }
  else if (index === 5) { // Slide 6 - Beyond Our Team (use-case cards)
    const cards = activeSlide.querySelectorAll('.usecase-card');
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.15}s`;
      card.classList.add('animate-in');
    });
  }
  else if (index === 6) { // Slide 7 - Timeline
    setupWorkflowClickHandlers(activeSlide);
    playWorkflowTimeline(activeSlide);
  }
  else if (index === 7) { // Slide 8 - Architecture
    state.archLayersRevealed = 0;
    const elements = activeSlide.querySelectorAll('.arch-layer, .arch-arrow');
    
    function revealArch() {
      if (state.archLayersRevealed < elements.length) {
        elements[state.archLayersRevealed].classList.add('visible');
        state.archLayersRevealed++;
        const timer = setTimeout(revealArch, 600);
        animationTimers.push(timer);
      }
    }
    revealArch();

    // Reset the interactive data-flow demo in case a previous run was interrupted
    const flowLayers = activeSlide.querySelectorAll('.arch-layer');
    flowLayers.forEach(l => l.classList.remove('flow-active', 'flow-visited'));
    const gitBox = activeSlide.querySelector('.arch-git-box');
    if (gitBox) gitBox.classList.remove('flow-active');
    const dot = activeSlide.querySelector('#flow-dot');
    if (dot) dot.classList.remove('active', 'returning');
    const caption = activeSlide.querySelector('#arch-flow-caption');
    if (caption) caption.textContent = 'Click "Play" to watch this query travel through Analyst, step by step →';
    const archBtn = activeSlide.querySelector('#arch-play-btn');
    if (archBtn) {
      archBtn.disabled = false;
      archBtn.textContent = '▶ Play Data Flow';
    }
  }
  else if (index === 8) { // Slide 9 - Feature columns (Q / Tools / Help)
    const cols = activeSlide.querySelectorAll('.feature-col');
    cols.forEach((col, i) => {
      col.style.animationDelay = `${i * 0.18}s`;
      col.classList.add('animate-in');
    });
  }
  else if (index === 10) { // Slide 11 - Value cards
    const valueCards = activeSlide.querySelectorAll('.value-card');
    valueCards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.15}s`;
      card.classList.add('animate-in');
    });
  }
  else if (index === 11) { // Slide 12 - Tickets Resolved: Sasmita
    const cards = activeSlide.querySelectorAll('.ticket-card');
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.12}s`;
      card.classList.add('animate-in');
    });
    const strip = activeSlide.querySelector('.ticket-highlight-strip');
    if (strip) {
      strip.style.animationDelay = `${cards.length * 0.12 + 0.1}s`;
      strip.classList.add('animate-in');
    }
  }
  else if (index === 12) { // Slide 13 - Repository Synchronization
    const stat = activeSlide.querySelector('.reposync-stat');
    if (stat) stat.classList.add('animate-in');
    const items = activeSlide.querySelectorAll('.reposync-list li');
    items.forEach((item, i) => {
      item.style.animationDelay = `${0.2 + i * 0.1}s`;
      item.classList.add('animate-in');
    });
    const skillBadges = activeSlide.querySelectorAll('.skill-badge');
    skillBadges.forEach((badge, i) => {
      badge.style.animationDelay = `${0.8 + items.length * 0.1 + i * 0.1}s`;
      badge.classList.add('animate-in');
    });
  }
  else if (index === 13) { // Slide 14 - Tickets Resolved: Sharan
    const cards = activeSlide.querySelectorAll('.ticket-card');
    cards.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.12}s`;
      card.classList.add('animate-in');
    });
    const strip = activeSlide.querySelector('.ticket-highlight-strip');
    if (strip) {
      strip.style.animationDelay = `${cards.length * 0.12 + 0.1}s`;
      strip.classList.add('animate-in');
    }
    const skillBadges = activeSlide.querySelectorAll('.skill-badge');
    skillBadges.forEach((badge, i) => {
      badge.style.animationDelay = `${cards.length * 0.12 + 0.3 + i * 0.1}s`;
      badge.classList.add('animate-in');
    });
  }
}

// Workflow Slide - Timeline Animation (extracted so the Replay button can re-trigger it)
function setupWorkflowClickHandlers(activeSlide) {
  if (activeSlide.dataset.clicksAdded) return;
  const steps = activeSlide.querySelectorAll('.timeline-step');
  const fill = activeSlide.querySelector('#timeline-track-fill');
  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      animationTimers.forEach(timer => clearTimeout(timer));
      steps.forEach((s, j) => {
        s.classList.remove('active', 'completed');
        if (j < i) s.classList.add('completed');
        else if (j === i) s.classList.add('active');
      });
      state.timelineStep = i;
      if (fill) fill.style.width = `${steps.length > 1 ? (i / (steps.length - 1)) * 100 : 0}%`;
    });
  });
  activeSlide.dataset.clicksAdded = "true";
}

function playWorkflowTimeline(activeSlide) {
  animationTimers.forEach(timer => clearTimeout(timer));
  state.timelineStep = 0;
  const steps = activeSlide.querySelectorAll('.timeline-step');
  const fill = activeSlide.querySelector('#timeline-track-fill');
  steps.forEach(s => s.classList.remove('active', 'completed'));
  if (fill) fill.style.width = '0%';

  function advanceTimeline() {
    if (state.timelineStep < steps.length) {
      steps.forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i < state.timelineStep) s.classList.add('completed');
        else if (i === state.timelineStep) s.classList.add('active');
      });
      if (fill) {
        const pct = steps.length > 1 ? (state.timelineStep / (steps.length - 1)) * 100 : 0;
        fill.style.width = `${Math.min(pct, 100)}%`;
      }
      state.timelineStep++;
      const timer = setTimeout(advanceTimeline, 1000);
      animationTimers.push(timer);
    }
  }
  advanceTimeline();
}

// Solution Slide - Animated "How Analyst Resolves the Same Requests"
function playSolutionFlow() {
  const btn = document.getElementById('solution-play-btn');
  const caption = document.getElementById('solution-flow-caption');
  const analystBox = document.getElementById('sol-analyst-box');
  const chips = [1, 2, 3, 4, 5].map(n => document.getElementById(`sol-chip-${n}`));
  if (!btn || !caption || !analystBox || chips.some(el => !el)) return;

  btn.disabled = true;
  btn.textContent = '⏳ Running…';

  const icons = ['📊', '📈', '❓', '📋', '📄'];
  chips.forEach((chip, i) => {
    chip.classList.remove('done');
    chip.textContent = icons[i];
  });
  analystBox.classList.remove('pulse');

  const messages = [
    'Business analyst opens Analyst, builds the report themselves…',
    'Quant runs the calculation directly — no ticket needed…',
    'Risk answers their own ad-hoc query in Analyst…',
    'Another team self-serves their data request…',
    'The last request is handled just as fast — nothing is waiting.'
  ];

  let i = 0;
  function resolveNext() {
    if (i >= chips.length) {
      caption.textContent = '✅ All 5 requests handled — zero backlog, no single point of failure.';
      const doneTimer = setTimeout(() => {
        chips.forEach((chip, idx) => { chip.classList.remove('done'); chip.textContent = icons[idx]; });
        analystBox.classList.remove('pulse');
        caption.textContent = 'Click "Play" to see how Analyst handles the same 5 requests — no queue this time →';
        btn.disabled = false;
        btn.textContent = '▶ Replay';
      }, 3200);
      animationTimers.push(doneTimer);
      return;
    }
    // Show the caption first, then pulse Analyst, then mark the request done
    caption.textContent = messages[i];
    const pulseTimer = setTimeout(() => {
      analystBox.classList.add('pulse');
      const arriveTimer = setTimeout(() => {
        chips[i].classList.add('done');
        chips[i].textContent = '✓';
        analystBox.classList.remove('pulse');
        i++;
        const nextTimer = setTimeout(resolveNext, 600);
        animationTimers.push(nextTimer);
      }, 700);
      animationTimers.push(arriveTimer);
    }, 700);
    animationTimers.push(pulseTimer);
  }

  resolveNext();
}


function playProblemFlow() {
  const btn = document.getElementById('problem-play-btn');
  const caption = document.getElementById('problem-flow-caption');
  const bottleneck = document.getElementById('bottleneck-box');
  const badge = document.getElementById('queue-badge');
  const badgeText = document.getElementById('queue-badge-text');
  const slowerText = document.getElementById('slower-output-text');
  if (!btn || !caption || !bottleneck || !badge || !badgeText || !slowerText) return;

  const icons = [1, 2, 3, 4, 5].map(n => document.getElementById(`req-icon-${n}`));
  if (icons.some(el => !el)) return;

  btn.disabled = true;
  btn.textContent = '⏳ Running…';

  // Reset state
  icons.forEach(el => el.classList.remove('flying'));
  bottleneck.classList.remove('pulse');
  badge.style.opacity = 0;
  badgeText.style.opacity = 0;
  badgeText.textContent = '0';
  slowerText.classList.remove('warning');

  const messages = [
    'A business analyst requests a new sales report… added to the queue.',
    'A quant asks for a custom risk calculation… also waiting.',
    'Risk needs an ad-hoc query answered… still waiting.',
    'Another team submits a data request… queue keeps growing.',
    'And another request lands… the developer hasn\'t even started #1 yet.'
  ];

  let count = 0;
  function sendIcon(i) {
    if (i >= icons.length) {
      caption.textContent = `Backlog of ${count} requests, one developer — realistically 3-5 business days before the last one even gets looked at.`;
      slowerText.classList.add('warning');
      const doneTimer = setTimeout(() => {
        icons.forEach(el => el.classList.remove('flying'));
        bottleneck.classList.remove('pulse');
        badge.style.opacity = 0;
        badgeText.style.opacity = 0;
        badgeText.textContent = '0';
        slowerText.classList.remove('warning');
        caption.textContent = 'Click "Play" to see how this backlog builds up in real teams →';
        btn.disabled = false;
        btn.textContent = '▶ Replay';
        count = 0;
      }, 3500);
      animationTimers.push(doneTimer);
      return;
    }
    const el = icons[i];
    // Show the caption first and give it a moment to be read before the icon moves
    caption.textContent = messages[i];

    const flyTimer = setTimeout(() => {
      el.style.setProperty('--dx', `${el.getAttribute('data-dx')}px`);
      el.style.setProperty('--dy', `${el.getAttribute('data-dy')}px`);
      el.classList.add('flying');

      const arriveTimer = setTimeout(() => {
        count++;
        bottleneck.classList.add('pulse');
        badge.style.opacity = 1;
        badgeText.style.opacity = 1;
        badgeText.textContent = String(count);
        badge.classList.remove('pop');
        void badge.offsetWidth; // restart pop animation
        badge.classList.add('pop');
        const nextTimer = setTimeout(() => sendIcon(i + 1), 900);
        animationTimers.push(nextTimer);
      }, 900);
      animationTimers.push(arriveTimer);
    }, 900);
    animationTimers.push(flyTimer);
  }

  sendIcon(0);
}


function playArchFlow() {
  const container = document.getElementById('arch-diagram');
  const dot = document.getElementById('flow-dot');
  const caption = document.getElementById('arch-flow-caption');
  const btn = document.getElementById('arch-play-btn');
  if (!container || !dot || !caption || !btn) return;

  const layers = Array.from(container.querySelectorAll('.arch-layer'));
  const gitBox = container.querySelector('.arch-git-box');
  if (layers.length < 5) return;

  btn.disabled = true;
  btn.textContent = '⏳ Running…';

  // Reset any previous run
  layers.forEach(l => l.classList.remove('flow-active', 'flow-visited'));
  if (gitBox) gitBox.classList.remove('flow-active');
  dot.classList.remove('active', 'returning');

  function centerOf(layerEl) {
    const containerRect = container.getBoundingClientRect();
    const layerRect = layerEl.getBoundingClientRect();
    return (layerRect.top - containerRect.top) + layerRect.height / 2;
  }

  const steps = [
    { layerIndex: 0, git: false, caption: '1. You type a query in the browser — no local install needed.' },
    { layerIndex: 1, git: false, caption: "2. KX Analyst's Web UI sends the query to the Analyst runtime." },
    { layerIndex: 2, git: true,  caption: '3. The Workspace process prepares execution — your code stays Git-tracked here.' },
    { layerIndex: 3, git: false, caption: '4. The query runs on kdb+ — locally, or on a remote process via IPC.' },
    { layerIndex: 4, git: false, caption: '5. kdb+ scans the massive dataset (real-time + historical) to compute the result.' },
  ];

  let i = 0;
  function runStep() {
    if (i > 0) {
      const prevStep = steps[i - 1];
      const prevLayer = layers[prevStep.layerIndex];
      prevLayer.classList.remove('flow-active');
      prevLayer.classList.add('flow-visited');
      if (prevStep.git && gitBox) gitBox.classList.remove('flow-active');
    }
    if (i < steps.length) {
      const step = steps[i];
      const layerEl = layers[step.layerIndex];
      layerEl.classList.add('flow-active');
      if (step.git && gitBox) gitBox.classList.add('flow-active');
      dot.style.top = `${centerOf(layerEl)}px`;
      dot.classList.add('active');
      caption.textContent = step.caption;
      i++;
      const timer = setTimeout(runStep, 1300);
      animationTimers.push(timer);
    } else {
      // Return pass — the same dot travels back up carrying the result
      caption.textContent = '6. Only the computed result travels back up — not the raw dataset.';
      dot.classList.add('returning');

      const timer2 = setTimeout(() => {
        dot.style.top = `${centerOf(layers[0])}px`;
        caption.textContent = '✅ Result delivered to the browser — query complete.';
        const timer3 = setTimeout(() => {
          layers.forEach(l => l.classList.remove('flow-active', 'flow-visited'));
          dot.classList.remove('active', 'returning');
          btn.disabled = false;
          btn.textContent = '▶ Replay Data Flow';
        }, 1600);
        animationTimers.push(timer3);
      }, 400);
      animationTimers.push(timer2);
    }
  }

  runStep();
}

// 7. Editable Placeholders
function initPlaceholders() {
  const placeholders = document.querySelectorAll('.placeholder');
  placeholders.forEach(el => {
    el.setAttribute('contenteditable', 'true');
    const key = el.getAttribute('data-key');
    
    // Restore from localStorage
    const saved = localStorage.getItem(`kx_placeholder_${key}`);
    if (saved) {
      el.textContent = saved;
    } else if (!el.textContent.trim()) {
      el.textContent = el.getAttribute('data-placeholder') || '';
    }
    
    // Save on blur
    el.addEventListener('blur', () => {
      localStorage.setItem(`kx_placeholder_${key}`, el.textContent);
    });
    
    // Clear hint on focus if it matches placeholder
    el.addEventListener('focus', () => {
      if (el.textContent.trim() === el.getAttribute('data-placeholder')) {
        el.textContent = '';
      }
    });
  });
}

// 8. Screenshot Upload
function initScreenshots() {
  const frames = document.querySelectorAll('.screenshot-frame');
  frames.forEach((frame, index) => {
    const key = `kx_screenshot_${index}`;
    
    // Restore from localStorage or use default
    const saved = localStorage.getItem(key);
    const defaultImages = [
      "images/editor.png",
      "images/query-in-progress.png",
      "images/graph.png"
    ];
    const defaultImg = defaultImages[index];
    if (saved) {
      frame.innerHTML = `<img src="${saved}" style="width: 100%; height: 100%; object-fit: cover;" alt="Screenshot">`;
    } else if (defaultImg) {
      frame.innerHTML = `<img src="${defaultImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="Screenshot">`;
    }
    
    // Drag and drop handlers
    frame.addEventListener('dragover', (e) => {
      e.preventDefault();
      frame.classList.add('drop-zone-active');
    });
    
    frame.addEventListener('dragleave', (e) => {
      e.preventDefault();
      frame.classList.remove('drop-zone-active');
    });
    
    frame.addEventListener('drop', (e) => {
      e.preventDefault();
      frame.classList.remove('drop-zone-active');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file, frame, key);
      }
    });
    
    // Click to upload
    frame.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file, frame, key);
      };
      input.click();
    });
  });
  
  function handleFile(file, frame, key) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      frame.innerHTML = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Screenshot">`;
      localStorage.setItem(key, dataUrl);
    };
    reader.readAsDataURL(file);
  }
}

// 9. Presentation Mode & 10. Fullscreen Button
function togglePresentationMode() {
  state.presentationMode = !state.presentationMode;
  
  if (state.presentationMode) {
    document.body.classList.add('presentation-mode');
    
    // Close sidebar
    if (state.sidebarOpen) toggleSidebar();
    
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("Error attempting to enable fullscreen:", err);
      });
    }
  } else {
    document.body.classList.remove('presentation-mode');
    
    // Exit fullscreen
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Fullscreen change listener in case user exits via ESC key
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && state.presentationMode) {
    state.presentationMode = false;
    document.body.classList.remove('presentation-mode');
  }
});


// Default images map for tool modals
const DEFAULT_TOOL_IMAGES = {
  editor: "images/editor.png",
  inspector: "images/visual inspector.png",
  importer: "images/importer.png",
  exporter: "images/table-exporter.png",
  transformer: "images/table-transformer.png",
  git: "images/git.png",
  qcumber: "images/axqcumber.png",
  profiler: "images/profiler.png"
};

// TOOL DETAILS DICTIONARY
const TOOL_DETAILS = {
  editor: {
    name: "q Code Editor",
    icon: "💻",
    badge: "Technical Tool",
    desc: "A high-performance browser-based IDE custom-built for vector programming in q/kdb+. Offers syntax highlighting, code auto-completion, real-time error diagnostics, and selective query evaluation directly against local or remote kdb+ processes.",
    value: "Eliminates terminal dependency and context switching. Engineers can inspect, run, and modify core analytics code within a single browser workspace without setting up command line environments."
  },
  inspector: {
    name: "Visual Inspector",
    icon: "📊",
    badge: "Business & Quant Tool",
    desc: "Interactive data visualization studio capable of plotting millions of time-series tick points into interactive charts (line graphs, candlestick, scatter, heatmaps, histograms) directly from query buffers.",
    value: "Quants and market analysts can visually identify anomalies, price slippage, and execution trends instantly without writing custom frontend chart code or exporting to external tools."
  },
  importer: {
    name: "Data Importer",
    icon: "📥",
    badge: "Data Onboarding",
    desc: "Guided visual wizard for importing external datasets (CSV, TSV, JSON, Parquet, SQL databases). Automatically detects data types, parses high-precision timestamp formats, and generates optimal kdb+ table schema declarations.",
    value: "Drastically reduces data onboarding time from days to minutes, empowering business teams to ingest new market feeds or static reference data without engineering intervention."
  },
  exporter: {
    name: "Table Exporter",
    icon: "📤",
    badge: "Data Handoff",
    desc: "Exports any q table — including the live result of a qsql query — out to CSV, JSON, Excel, or directly into another kdb+ process, without writing a custom export script.",
    value: "Lets analysts hand results to other tools, reports, or teams themselves — no need to ask engineering to write a one-off export every time."
  },
  transformer: {
    name: "Data Transformer",
    icon: "🔄",
    badge: "No-Code Analytics",
    desc: "A visual, drag-and-drop workflow tool for constructing multi-stage data pipelines. Perform joins, temporal aggregations, sliding time window operations, filtering, and calculated column derivations visually.",
    value: "Allows non-technical analysts to build sophisticated data transformation pipelines independently, bypassing the need to write complex native q queries."
  },
  git: {
    name: "Git Integration",
    icon: "🌿",
    badge: "DevOps & Governance",
    desc: "Enterprise Git version control embedded natively inside the Analyst workspace. Supports branch creation, commit history, pull/push remotes, visual diffing, and merge conflict resolution.",
    value: "Guarantees enterprise governance, audit trails, and seamless team collaboration. Ensures all analytics code changes are version-tracked before reaching production servers."
  },
  qcumber: {
    name: "QCumber Testing Framework",
    icon: "🥒",
    badge: "Quality Assurance",
    desc: "An automated BDD (Behavior-Driven Development) testing framework specifically tailored for q code. Allows writing test specifications in natural language and executing automated test suites against analytics functions.",
    value: "Prevents code regressions, enforces quality standards, and builds confidence for Managing Directors when releasing critical algorithmic updates to production."
  },

  profiler: {
    name: "Performance Profiler",
    icon: "⚡",
    badge: "Optimization Tool",
    desc: "Real-time execution profiler that analyzes q code down to line-by-line timing, function call counts, and memory allocations during heavy tick volume runs.",
    value: "Pinpoints performance bottlenecks instantly, ensuring trading analytics run at sub-millisecond speeds even during extreme market volatility."
  },

};

// TOOL MINI-ANIMATIONS — "See It In Action" per tool
let toolAnimTimers = [];

function taReveal(elements, startDelay, step) {
  elements.forEach((el, i) => {
    if (!el) return;
    const t = setTimeout(() => el.classList.add('in'), startDelay + i * step);
    toolAnimTimers.push(t);
  });
}

const TOOL_ANIMATIONS = {
  editor: (stage) => {
    stage.innerHTML = `
      <div class="ta-mono"><span id="ta-code"></span><span class="ta-caret"></span></div>
      <div class="ta-fadein" id="ta-result">→ <strong style="color:#34D399;">20</strong> &nbsp;<span class="ta-badge green">✓ executed</span></div>
    `;
    const codeEl = stage.querySelector('#ta-code');
    const resultEl = stage.querySelector('#ta-result');
    const text = '2 + 3 * 4';
    let idx = 0;
    function type() {
      codeEl.textContent = text.slice(0, idx);
      idx++;
      if (idx <= text.length) {
        toolAnimTimers.push(setTimeout(type, 90));
      } else {
        toolAnimTimers.push(setTimeout(() => resultEl.classList.add('in'), 350));
      }
    }
    type();
  },
  inspector: (stage) => {
    stage.innerHTML = `
      <div class="ta-mono" id="ta-query">select avg price by sym from trade</div>
      <div class="ta-fadein" id="ta-viz" style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:4px;">
        <div id="ta-chart-area" style="height:52px;display:flex;align-items:center;justify-content:center;"></div>
        <div class="ta-badge amber" id="ta-chart-label">Line Chart</div>
      </div>
    `;
    const vizWrap = stage.querySelector('#ta-viz');
    const chartArea = stage.querySelector('#ta-chart-area');
    const label = stage.querySelector('#ta-chart-label');
    const views = [
      { name: 'Line Chart', html: '<svg width="140" height="48" viewBox="0 0 140 48"><polyline points="0,38 30,24 60,29 90,10 120,17 140,4" fill="none" stroke="#00E5FF" stroke-width="2"/></svg>' },
      { name: 'Bar Chart', html: '<div style="display:flex;gap:6px;align-items:flex-end;height:46px;"><div style="width:14px;height:20px;background:#3B82F6;border-radius:3px 3px 0 0;"></div><div style="width:14px;height:34px;background:#3B82F6;border-radius:3px 3px 0 0;"></div><div style="width:14px;height:14px;background:#3B82F6;border-radius:3px 3px 0 0;"></div><div style="width:14px;height:44px;background:#00E5FF;border-radius:3px 3px 0 0;"></div></div>' },
      { name: 'Heatmap', html: '<div style="display:grid;grid-template-columns:repeat(4,16px);grid-template-rows:repeat(3,16px);gap:2px;">' + Array.from({ length: 12 }).map((_, i) => `<div style="background:rgba(0,229,255,${(0.15 + (i % 5) * 0.15).toFixed(2)});border-radius:2px;"></div>`).join('') + '</div>' }
    ];
    toolAnimTimers.push(setTimeout(() => vizWrap.classList.add('in'), 300));
    views.forEach((view, i) => {
      const t = setTimeout(() => {
        chartArea.innerHTML = view.html;
        label.textContent = view.name;
      }, 500 + i * 900);
      toolAnimTimers.push(t);
    });
  },
  exporter: (stage) => {
    stage.innerHTML = `
      <div class="ta-mono">select sym,price from trade where sym=\`AAPL</div>
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;margin-top:8px;">
        <div class="ta-node" id="ta-exp-tbl">▤ result table</div>
        <div style="color:#00E5FF;">→</div>
        <div class="ta-node" id="ta-exp-file">📄 export.csv</div>
      </div>
      <div class="ta-fadein" id="ta-exp-done" style="font-size:0.72rem;color:#34D399;text-align:center;margin-top:4px;">✓ Exported 3 rows</div>
    `;
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-exp-tbl').classList.add('flash'), 400));
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-exp-file').classList.add('flash'), 850));
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-exp-done').classList.add('in'), 1250));
  },
  importer: (stage) => {
    stage.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;">
        <div class="ta-node" id="ta-file">📄 data.csv</div>
        <div style="color:#00E5FF;">→</div>
        <div class="ta-node" id="ta-tbl">▤ table</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;">
        <div class="ta-row-appear" id="ta-i1" style="font-size:0.72rem;color:#9CA3AF;">row 1 imported</div>
        <div class="ta-row-appear" id="ta-i2" style="font-size:0.72rem;color:#9CA3AF;">row 2 imported</div>
        <div class="ta-row-appear" id="ta-i3" style="font-size:0.72rem;color:#9CA3AF;">row 3 imported</div>
      </div>
    `;
    const file = stage.querySelector('#ta-file');
    const tbl = stage.querySelector('#ta-tbl');
    toolAnimTimers.push(setTimeout(() => file.classList.add('flash'), 300));
    toolAnimTimers.push(setTimeout(() => tbl.classList.add('flash'), 700));
    taReveal([stage.querySelector('#ta-i1'), stage.querySelector('#ta-i2'), stage.querySelector('#ta-i3')], 850, 250);
  },
  transformer: (stage) => {
    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:5px;">
        <div class="ta-fadeout in" id="ta-t1" style="font-size:0.72rem;color:#9CA3AF;">sym: AAPL &nbsp; price: 180</div>
        <div class="ta-fadeout in" id="ta-t2" style="font-size:0.72rem;color:#9CA3AF;">sym: MSFT &nbsp; price: 420</div>
        <div class="ta-fadeout in" id="ta-t3" style="font-size:0.72rem;color:#9CA3AF;">sym: IBM &nbsp; price: 90</div>
        <div class="ta-fadein" id="ta-sum" style="font-size:0.78rem;color:#34D399;font-weight:700;margin-top:4px;">Σ avg price = 230 <span class="ta-badge green">aggregated</span></div>
      </div>
    `;
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-t3').classList.remove('in'), 500));
    toolAnimTimers.push(setTimeout(() => { stage.querySelector('#ta-t1').classList.remove('in'); stage.querySelector('#ta-t2').classList.remove('in'); }, 900));
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-sum').classList.add('in'), 1300));
  },
  git: (stage) => {
    stage.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div class="ta-node" id="ta-local">💻 Local Workspace</div>
        <div class="ta-node" id="ta-remote">☁️ Remote Repo</div>
      </div>
      <div class="ta-track" id="ta-track">
        <div class="ta-dot-travel" id="ta-dot"></div>
      </div>
      <div class="ta-fadein" id="ta-commit" style="font-size:0.72rem;color:#9CA3AF;text-align:center;">commit → push</div>
    `;
    const dot = stage.querySelector('#ta-dot');
    const remote = stage.querySelector('#ta-remote');
    const commitLabel = stage.querySelector('#ta-commit');
    toolAnimTimers.push(setTimeout(() => commitLabel.classList.add('in'), 200));
    toolAnimTimers.push(setTimeout(() => { dot.style.left = 'calc(100% - 11px)'; }, 500));
    toolAnimTimers.push(setTimeout(() => remote.classList.add('flash'), 1450));
  },
  qcumber: (stage) => {
    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#D1D5DB;"><span>test_avg_price</span><span id="ta-q1"><span class="ta-spinner"></span></span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#D1D5DB;"><span>test_null_handling</span><span id="ta-q2"><span class="ta-spinner"></span></span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#D1D5DB;"><span>test_multi_file_paths</span><span id="ta-q3"><span class="ta-spinner"></span></span></div>
        <div class="ta-fadein" id="ta-qsum" style="font-size:0.78rem;color:#34D399;font-weight:700;margin-top:4px;">3/3 tests passed ✅</div>
      </div>
    `;
    const q1 = stage.querySelector('#ta-q1'), q2 = stage.querySelector('#ta-q2'), q3 = stage.querySelector('#ta-q3');
    const qsum = stage.querySelector('#ta-qsum');
    toolAnimTimers.push(setTimeout(() => q1.innerHTML = '<span class="ta-badge green">✓ pass</span>', 500));
    toolAnimTimers.push(setTimeout(() => q2.innerHTML = '<span class="ta-badge green">✓ pass</span>', 950));
    toolAnimTimers.push(setTimeout(() => q3.innerHTML = '<span class="ta-badge green">✓ pass</span>', 1400));
    toolAnimTimers.push(setTimeout(() => qsum.classList.add('in'), 1700));
  },

  profiler: (stage) => {
    stage.innerHTML = `
      <div class="ta-bar-track">
        <div class="ta-bar-col"><div class="ta-bar" id="ta-b1"></div><span style="font-size:0.65rem;color:#9CA3AF;">A</span></div>
        <div class="ta-bar-col"><div class="ta-bar" id="ta-b2"></div><span style="font-size:0.65rem;color:#9CA3AF;">B</span></div>
        <div class="ta-bar-col"><div class="ta-bar slow" id="ta-b3"></div><span style="font-size:0.65rem;color:#9CA3AF;">C</span></div>
        <div class="ta-bar-col"><div class="ta-bar" id="ta-b4"></div><span style="font-size:0.65rem;color:#9CA3AF;">D</span></div>
      </div>
      <div class="ta-fadein" id="ta-warn" style="font-size:0.72rem;color:#F87171;text-align:center;">⚠ Function C: 80ms — bottleneck found</div>
    `;
    const heights = [24, 40, 72, 30];
    ['ta-b1', 'ta-b2', 'ta-b3', 'ta-b4'].forEach((id, i) => {
      toolAnimTimers.push(setTimeout(() => { stage.querySelector('#' + id).style.height = heights[i] + 'px'; }, 250 + i * 250));
    });
    toolAnimTimers.push(setTimeout(() => stage.querySelector('#ta-warn').classList.add('in'), 1400));
  },

};

function playToolAnimation(toolId) {
  const stage = document.getElementById('modal-tool-anim-stage');
  if (!stage) return;
  toolAnimTimers.forEach(t => clearTimeout(t));
  toolAnimTimers = [];
  const renderFn = TOOL_ANIMATIONS[toolId];
  if (renderFn) {
    renderFn(stage);
  } else {
    stage.innerHTML = '<div style="font-size:0.75rem;color:#6B7280;">No animation available for this tool yet.</div>';
  }
}

let currentActiveTool = null;

// Tool Detail Modal Handlers
function initToolModals() {
  const modal = document.getElementById('tool-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  if (!modal) return;

  const toolNameEl = document.getElementById('modal-tool-name');
  const toolDescEl = document.getElementById('modal-tool-desc');
  const toolValEl = document.getElementById('modal-tool-value');
  const toolIconEl = document.getElementById('modal-tool-icon');
  const toolBadgeEl = document.getElementById('modal-tool-badge');
  const toolFrameEl = document.getElementById('modal-tool-screenshot-frame');
  const toolPhEl = document.getElementById('modal-tool-screenshot-ph');

  function openToolModal(toolId) {
    const details = TOOL_DETAILS[toolId];
    if (!details) return;
    currentActiveTool = toolId;

    toolNameEl.textContent = details.name;
    toolDescEl.textContent = details.desc;
    toolValEl.textContent = details.value;
    toolIconEl.textContent = details.icon;
    toolBadgeEl.textContent = details.badge;

    // Load tool screenshot if saved or default exists
    const savedImg = localStorage.getItem(`kx_tool_screenshot_${toolId}`);
    const defaultImg = DEFAULT_TOOL_IMAGES[toolId];
    if (savedImg) {
      toolFrameEl.innerHTML = `<img src="${savedImg}" style="width:100%;height:100%;object-fit:cover;" alt="${details.name}">`;
    } else if (defaultImg) {
      toolFrameEl.innerHTML = `<img src="${defaultImg}" style="width:100%;height:100%;object-fit:cover;" alt="${details.name}">`;
    } else {
      toolFrameEl.innerHTML = `
        <div class="tool-screenshot-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span style="font-size:0.75rem;margin-top:6px;">Click or drag & drop screenshot for ${details.name}</span>
        </div>`;
    }

    modal.classList.add('open');
    playToolAnimation(toolId);
  }

  function closeToolModal() {
    modal.classList.remove('open');
    toolAnimTimers.forEach(t => clearTimeout(t));
    toolAnimTimers = [];
    currentActiveTool = null;
  }

  const animReplayBtn = document.getElementById('modal-tool-anim-replay');
  if (animReplayBtn) {
    animReplayBtn.addEventListener('click', () => {
      if (currentActiveTool) playToolAnimation(currentActiveTool);
    });
  }

  // Attach triggers to all tool buttons
  document.querySelectorAll('.tool-btn, .tool-btn-inline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = btn.getAttribute('data-tool');
      if (toolId) openToolModal(toolId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeToolModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeToolModal();
  });

  // Tool Screenshot Upload / Drag & Drop
  if (toolFrameEl) {
    toolFrameEl.addEventListener('click', () => {
      if (!currentActiveTool) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleToolImageUpload(file, toolFrameEl, currentActiveTool);
      };
      input.click();
    });

    toolFrameEl.addEventListener('dragover', (e) => { e.preventDefault(); });
    toolFrameEl.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!currentActiveTool) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleToolImageUpload(file, toolFrameEl, currentActiveTool);
      }
    });
  }

  function handleToolImageUpload(file, container, toolId) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      container.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;" alt="Tool Screenshot">`;
      localStorage.setItem(`kx_tool_screenshot_${toolId}`, dataUrl);
    };
    reader.readAsDataURL(file);
  }
}

// Slide Attachment Handlers
function initSlideAttachments() {
  document.querySelectorAll('.slide').forEach(slide => {
    const slideId = slide.getAttribute('data-slide-id');
    const attachBtn = slide.querySelector('.slide-attach-btn');
    const imgContainer = slide.querySelector('.slide-image-container');
    const imgFrame = slide.querySelector('.slide-image-frame');
    const removeBtn = slide.querySelector('.remove-slide-image-btn');

    if (!attachBtn || !imgContainer || !imgFrame) return;

    // Load saved slide image if available
    const savedImg = localStorage.getItem(`kx_slide_screenshot_${slideId}`);
    if (savedImg) {
      imgFrame.innerHTML = `<img src="${savedImg}" style="max-height:220px;width:auto;border-radius:8px;" alt="Slide Image">`;
      imgContainer.style.display = 'block';
    }

    attachBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (imgContainer.style.display === 'none' || !imgContainer.style.display) {
        imgContainer.style.display = 'block';
      } else if (!localStorage.getItem(`kx_slide_screenshot_${slideId}`)) {
        imgContainer.style.display = 'none';
      }
    });

    imgFrame.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleSlideImage(file, imgFrame, slideId);
      };
      input.click();
    });

    imgFrame.addEventListener('dragover', (e) => { e.preventDefault(); });
    imgFrame.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleSlideImage(file, imgFrame, slideId);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        localStorage.removeItem(`kx_slide_screenshot_${slideId}`);
        imgFrame.innerHTML = `<div class="slide-image-placeholder">Click or drop image for this slide</div>`;
        imgContainer.style.display = 'none';
      });
    }
  });

  function handleSlideImage(file, frame, slideId) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      frame.innerHTML = `<img src="${dataUrl}" style="max-height:220px;width:auto;border-radius:8px;" alt="Slide Image">`;
      localStorage.setItem(`kx_slide_screenshot_${slideId}`, dataUrl);
    };
    reader.readAsDataURL(file);
  }
}

// 11. Initialization
function init() {
  initCanvas();
  initPlaceholders();
  initScreenshots();
  initToolModals();
  initSlideAttachments();
  
  // Setup keyboard listeners
  document.addEventListener('keydown', (e) => {
    // Don't navigate if user is editing a placeholder
    if (e.target.isContentEditable) return;

    // Close tool modal on ESC
    const modal = document.getElementById('tool-modal');
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
      return;
    }
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Escape':
        if (state.presentationMode) {
          togglePresentationMode();
        }
        break;
      case 'f':
      case 'F':
      case 'p':
      case 'P':
        togglePresentationMode();
        break;
    }
  });
  
  // Button listeners
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', togglePresentationMode);
  
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  const archPlayBtn = document.getElementById('arch-play-btn');
  if (archPlayBtn) archPlayBtn.addEventListener('click', playArchFlow);

  const problemPlayBtn = document.getElementById('problem-play-btn');
  if (problemPlayBtn) problemPlayBtn.addEventListener('click', playProblemFlow);

  const solutionPlayBtn = document.getElementById('solution-play-btn');
  if (solutionPlayBtn) solutionPlayBtn.addEventListener('click', playSolutionFlow);

  const workflowReplayBtn = document.getElementById('workflow-replay-btn');
  if (workflowReplayBtn) {
    workflowReplayBtn.addEventListener('click', () => {
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) playWorkflowTimeline(activeSlide);
    });
  }
  
  // Restore slide index
  const savedSlide = parseInt(localStorage.getItem('kx_current_slide'));
  if (!isNaN(savedSlide) && savedSlide >= 0 && savedSlide < state.totalSlides) {
    goToSlide(savedSlide);
  } else {
    goToSlide(0);
  }
}

document.addEventListener('DOMContentLoaded', init);

