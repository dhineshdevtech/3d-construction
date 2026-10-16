/**
 * AURA Construction — Chronological Phases Scrollytelling Engine
 * Pure scroll-driven frame scrubbing with dynamic bottom phase updates
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 240;
  const FRAME_DIR = 'frames_webp';
  const FRAME_EXT = 'webp';
  const FRAME_PREFIX = 'frame_';
  const PADDING = 5;
  const LERP_FACTOR = 0.16;

  // Construction Phases mapped across the 240 frames
  const PHASES = [
    {
      name: "Site Topography & Earthworks",
      shortName: "Earthworks",
      badge: "PHASE 01",
      desc: "Geotechnical grading & precision site excavation.",
      startFrame: 0,
      endFrame: 47,
      scrollTarget: 0.0
    },
    {
      name: "Foundation & Subterranean Core",
      shortName: "Foundation",
      badge: "PHASE 02",
      desc: "Reinforced bedrock caissons & retaining walls.",
      startFrame: 48,
      endFrame: 95,
      scrollTarget: 0.22
    },
    {
      name: "Structural Framing & Cantilevers",
      shortName: "Framing",
      badge: "PHASE 03",
      desc: "Post-tensioned concrete & structural steel columns.",
      startFrame: 96,
      endFrame: 143,
      scrollTarget: 0.44
    },
    {
      name: "Facade Glazing & Building Envelope",
      shortName: "Envelope",
      badge: "PHASE 04",
      desc: "Floor-to-ceiling panoramic glass installation.",
      startFrame: 144,
      endFrame: 191,
      scrollTarget: 0.66
    },
    {
      name: "Architectural Completion & Illumination",
      shortName: "Completion",
      badge: "PHASE 05",
      desc: "Cantilevered terraces, pool & final handover.",
      startFrame: 192,
      endFrame: 239,
      scrollTarget: 0.90
    }
  ];

  // DOM Elements
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const initialIntro = document.getElementById('initial-intro');
  const currentPhasePill = document.getElementById('current-phase-pill');
  const progressFill = document.getElementById('progress-fill');
  const phaseBadge = document.getElementById('phase-badge');
  const phaseFrames = document.getElementById('phase-frames');
  const phaseHeading = document.getElementById('phase-heading');
  const phaseDesc = document.getElementById('phase-desc');
  const stepButtons = document.querySelectorAll('.step-btn');
  const scrollTrack = document.getElementById('scroll-track');
  const phasesDock = document.getElementById('phases-dock');

  // Animation State
  let targetFrame = 0;
  let currentFrame = 0;
  let renderedFrameIndex = -1;
  let activePhaseIndex = -1;

  // Image Cache
  const images = new Array(TOTAL_FRAMES);
  const isLoaded = new Array(TOTAL_FRAMES).fill(false);

  // Helper to format frame path
  function getFramePath(index) {
    const numStr = String(index + 1).padStart(PADDING, '0');
    return `${FRAME_DIR}/${FRAME_PREFIX}${numStr}.${FRAME_EXT}`;
  }

  // Set up High-DPI Canvas
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    if (renderedFrameIndex >= 0) {
      renderFrame(renderedFrameIndex, true);
    }
  }

  // Draw frame on canvas with aspect ratio "cover"
  function renderFrame(frameIdx, force = false) {
    const targetIdx = Math.round(frameIdx);
    if (!force && targetIdx === renderedFrameIndex) return;

    let imgToDraw = images[targetIdx];
    let actualIdx = targetIdx;

    if (!isLoaded[targetIdx]) {
      let closest = -1;
      let minDiff = Infinity;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (isLoaded[i]) {
          const diff = Math.abs(i - targetIdx);
          if (diff < minDiff) {
            minDiff = diff;
            closest = i;
          }
        }
      }
      if (closest >= 0) {
        imgToDraw = images[closest];
        actualIdx = closest;
      }
    }

    if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) {
      return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = imgToDraw.naturalWidth;
    const ih = imgToDraw.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(imgToDraw, 0, 0, iw, ih, sx, sy, sw, sh);
    renderedFrameIndex = actualIdx;
  }

  // Progressive Preloader
  function startProgressiveLoading() {
    // 1. Immediately load frame 0 and display it
    loadImage(0, () => {
      renderFrame(0, true);
    });

    // 2. Load the initial batch (first 25 frames)
    const initialBatch = Math.min(25, TOTAL_FRAMES);
    for (let i = 1; i < initialBatch; i++) {
      loadImage(i);
    }

    // 3. Queue the remaining frames in non-blocking batches
    let nextIndex = initialBatch;
    function loadNextBatch() {
      if (nextIndex >= TOTAL_FRAMES) return;
      const end = Math.min(nextIndex + 8, TOTAL_FRAMES);
      for (let i = nextIndex; i < end; i++) {
        loadImage(i);
      }
      nextIndex = end;
      if (nextIndex < TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadNextBatch, { timeout: 100 });
        } else {
          setTimeout(loadNextBatch, 25);
        }
      }
    }

    setTimeout(loadNextBatch, 60);
  }

  function loadImage(index, onLoadCallback) {
    if (images[index]) return;

    const img = new Image();
    images[index] = img;
    img.src = getFramePath(index);

    img.onload = () => {
      isLoaded[index] = true;
      if (onLoadCallback) onLoadCallback();
    };

    img.onerror = () => {
      setTimeout(() => {
        img.src = getFramePath(index) + '?retry=' + Date.now();
      }, 500);
    };
  }

  // Update phases and elements based on scroll progress in Section 1
  function updateScrollTarget() {
    const scrollY = window.scrollY;
    const trackHeight = scrollTrack ? scrollTrack.offsetHeight : window.innerHeight * 4;
    const progress = Math.max(0, Math.min(1, scrollY / trackHeight));

    targetFrame = progress * (TOTAL_FRAMES - 1);

    // Initial intro fade out smoothly on initial scroll
    if (initialIntro) {
      const opacity = Math.max(0, 1 - progress * 10);
      initialIntro.style.opacity = opacity;
      initialIntro.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
      initialIntro.style.transform = `translate(-50%, calc(-50% - ${progress * 60}px))`;
    }

    // Hide/show bottom phases dock when transitioning to Section 2
    if (phasesDock) {
      if (scrollY > trackHeight - window.innerHeight * 0.35) {
        phasesDock.classList.add('hidden');
      } else {
        phasesDock.classList.remove('hidden');
      }
    }

    // Stepper progress fill
    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }

    // Determine current phase from frame index
    const roundedFrame = Math.round(targetFrame);
    let phaseIdx = 0;
    for (let i = 0; i < PHASES.length; i++) {
      if (roundedFrame >= PHASES[i].startFrame && roundedFrame <= PHASES[i].endFrame) {
        phaseIdx = i;
        break;
      }
    }

    if (phaseIdx !== activePhaseIndex) {
      activePhaseIndex = phaseIdx;
      const phase = PHASES[phaseIdx];

      // Update text details
      if (currentPhasePill) currentPhasePill.textContent = `PHASE 0${phaseIdx + 1}: ${phase.shortName.toUpperCase()}`;
      if (phaseBadge) phaseBadge.textContent = phase.badge;
      if (phaseHeading) phaseHeading.textContent = phase.name;
      if (phaseDesc) phaseDesc.textContent = phase.desc;

      // Update step buttons
      stepButtons.forEach((btn, idx) => {
        if (idx === phaseIdx) {
          btn.classList.add('active');
          btn.classList.remove('completed');
        } else if (idx < phaseIdx) {
          btn.classList.remove('active');
          btn.classList.add('completed');
        } else {
          btn.classList.remove('active');
          btn.classList.remove('completed');
        }
      });
    }
  }

  // Click step buttons to scroll directly to that phase in Section 1
  stepButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPct = parseFloat(btn.getAttribute('data-target'));
      const trackHeight = scrollTrack ? scrollTrack.offsetHeight : window.innerHeight * 4;
      const targetScrollY = targetPct * trackHeight;

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    });
  });

  // High-performance 60 FPS loop with LERP smoothing
  function animationLoop() {
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.005) {
      currentFrame += diff * LERP_FACTOR;
    } else {
      currentFrame = targetFrame;
    }

    renderFrame(currentFrame);
    requestAnimationFrame(animationLoop);
  }

  // Initialize GSAP Image Comparison On Scroll (Left: Blueprint, Right: Completed Output)
  function initGSAPComparison() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initGSAPComparison, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('.comparisonSection');
    if (!section) return;

    const afterImage = section.querySelector('.afterImage');
    const afterImg = section.querySelector('.afterImage img');
    const divider = section.querySelector('#comparisonDivider');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'center center',
        end: () => '+=' + section.offsetWidth,
        scrub: true,
        pin: true,
        anticipatePin: 1
      },
      defaults: { ease: 'none' }
    });

    // Animate afterImage & divider from right (100%) to left (0%)
    tl.fromTo(afterImage, { xPercent: 100, x: 0 }, { xPercent: 0, x: 0 }, 0)
      .fromTo(afterImg, { xPercent: -100, x: 0 }, { xPercent: 0, x: 0 }, 0)
      .fromTo(divider, { left: '100%' }, { left: '0%' }, 0);
  }

  // Initialize Section 3: Full-Width Scroll-Driven Continuous Panels (GSAP ScrollTrigger Scrub)
  function initFullWidthScrollPanels() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initFullWidthScrollPanels, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const wrapper = document.querySelector('#continuous-showcase');
    const panels = gsap.utils.toArray('.continuous-panel');
    const pills = gsap.utils.toArray('.scrub-step-pill');

    if (!wrapper || panels.length < 2) return;

    // Set initial positions: panel 0 is at 0, all subsequent panels start below
    panels.forEach((panel, i) => {
      if (i > 0) {
        gsap.set(panel.querySelector('.outer'), { yPercent: 100 });
        gsap.set(panel.querySelector('.inner'), { yPercent: -100 });
      }
    });

    // Scrub timeline pinned to viewport
    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => '+=' + (panels.length - 1) * 100 + '%',
        pin: true,
        scrub: 0.6, // Smooth scrubbing tied directly to user scroll! Zero automatic changes!
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const total = panels.length;
          const activeIdx = Math.min(total - 1, Math.floor(p * total * 0.999));
          pills.forEach((pill, idx) => {
            if (pill) pill.classList.toggle('active', idx === activeIdx);
          });
        }
      },
      defaults: { ease: 'none' }
    });

    // Dynamically chain transitions for all panels
    for (let i = 1; i < panels.length; i++) {
      const prev = panels[i - 1];
      const curr = panels[i];
      const pos = i - 1;

      scrubTl
        .to(prev.querySelector('.bg'), { yPercent: -12, duration: 1 }, pos)
        .fromTo(curr.querySelector('.outer'), { yPercent: 100 }, { yPercent: 0, duration: 1 }, pos)
        .fromTo(curr.querySelector('.inner'), { yPercent: -100 }, { yPercent: 0, duration: 1 }, pos)
        .fromTo(curr.querySelector('.bg'), { yPercent: 15 }, { yPercent: 0, duration: 1 }, pos);
    }

    // Pill click to scrub smoothly to that card
    pills.forEach((pill, i) => {
      if (!pill) return;
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        const st = scrubTl.scrollTrigger;
        if (!st) return;
        const targetScroll = st.start + (i / (panels.length - 1)) * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });
  }

  // Event Listeners
  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Initialize
  resizeCanvas();
  startProgressiveLoading();
  updateScrollTarget();
  requestAnimationFrame(animationLoop);
  initGSAPComparison();
  initFullWidthScrollPanels();
})();
