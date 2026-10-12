import React, { useEffect, useRef } from 'react';
import { CertificateCarousel, defaultCertificates } from './certificates/CertificateCarousel';
import { useCertificates } from '@/hooks/useCertificates';
import './SkillPowerUpsSection.css';

interface CachedMetrics {
  slides: HTMLElement[];
  slideWidth: number;
  slideStep: number;
  loopWidth: number;
  leftPad: number;
  cardOffsetRight: number;
  mouthLocalX: number;
  stageWidth: number;
  cruiseSpeed: number;
  certCount: number;
}

const SkillPowerUpsSection = () => {
  const { certificates } = useCertificates();
  const displayCertificates =
    certificates && certificates.length > 0 ? certificates : defaultCertificates;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || typeof window === 'undefined') return undefined;

    const certCount = displayCertificates.length;
    const carouselEl = stage.querySelector<HTMLElement>('.certificates-carousel');
    let metrics: CachedMetrics | null = null;
    let activeFlags: boolean[] = [];
    let prevRights: (number | undefined)[] = [];

    // Motion state (fractional px & px/sec)
    let position = 0;
    let speed = 0;
    let dragVel = 0;
    let pendingDragDelta = 0;
    let lastTime = performance.now();
    let rafId = 0;

    // Lifecycle & interaction flags
    let inView = true;
    let docVisible = !document.hidden;
    let hovering = false;
    let iframeInteracting = false;
    let dragging = false;
    let activePointerId = -1;
    let lastPointerX = 0;
    let imagesDecoded = false;
    let hasInitialRender = false;

    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mqReduced.matches;

    // 1. Preload & decode() every certificate image before autoplay starts
    let cancelled = false;
    const imageUrls = Array.from(
      new Set(displayCertificates.map((c) => c.image).filter(Boolean) as string[])
    );

    const decodeImage = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        if (typeof img.decode === 'function') {
          img.decode().then(() => resolve()).catch(() => resolve());
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

    Promise.race([
      Promise.all(imageUrls.map(decodeImage)),
      new Promise<void>((r) => window.setTimeout(r, 1200)),
    ]).then(() => {
      if (!cancelled) {
        imagesDecoded = true;
        if (!reducedMotion) {
          speed = metrics ? metrics.cruiseSpeed : 0;
        }
        syncLoop();
      }
    });

    // 2. Measure layout only on mount & debounced resize (never inside tick)
    const measureLayout = () => {
      const track = stage.querySelector<HTMLElement>('.certificates-track');
      if (!track) return;
      const slides = Array.from(track.querySelectorAll<HTMLElement>('.carousel-slide'));
      if (slides.length === 0) return;

      const firstSlide = slides[0];
      const fig =
        firstSlide.querySelector<HTMLElement>('[role="figure"]') || firstSlide;

      // Read all layout properties first (offsetWidth/clientWidth are unaffected by transform)
      const slideWidth = firstSlide.offsetWidth;
      const cardWidth = fig.offsetWidth;
      const stageWidth = stage.clientWidth;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || '24') || 24;

      if (slideWidth <= 0 || cardWidth <= 0) return;

      const h = Math.round(cardWidth * 0.58);
      const padLeft = (slideWidth - cardWidth) * 0.5;
      const cardOffsetRight = padLeft + cardWidth;
      const slideStep = slideWidth + gap;
      const loopWidth = slides.length * slideStep;
      const leftPad = slideStep * 1.5;
      const mouthLocalX = 1.112 * h;
      const cruiseSpeed = (certCount * slideStep) / 40;

      // Write CSS custom property after all reads
      stage.style.setProperty('--h', `${h}px`);

      if (activeFlags.length !== slides.length) {
        activeFlags = new Array(slides.length).fill(false);
        prevRights = new Array(slides.length).fill(undefined);
      }

      const wasUnset = metrics === null;
      metrics = {
        slides,
        slideWidth,
        slideStep,
        loopWidth,
        leftPad,
        cardOffsetRight,
        mouthLocalX,
        stageWidth,
        cruiseSpeed,
        certCount,
      };

      if (wasUnset && !reducedMotion && imagesDecoded) {
        speed = cruiseSpeed;
      }

      // Immediately apply transforms so active window & positions are synced on resize
      applyFrame(0, true);
    };

    const triggerFolderReaction = (certIndex: number) => {
      const badgeEl = badgeRef.current;
      const frontEl = frontRef.current;
      const label = String(certIndex + 1).padStart(2, '0');

      if (reducedMotion) {
        if (badgeEl) badgeEl.textContent = label;
        return;
      }

      if (frontEl && badgeEl) {
        badgeEl.textContent = label;
        frontEl.classList.remove('g');
        badgeEl.classList.remove('g');
        // Force a single reflow outside the slide write loop to restart CSS animations cleanly
        void frontEl.offsetWidth;
        frontEl.classList.add('g');
        badgeEl.classList.add('g');
      }
    };

    // Pure arithmetic + transform writes (zero layout reads in the frame loop)
    const applyFrame = (dt: number, isResizeSync = false) => {
      if (!metrics || metrics.loopWidth <= 0) return;

      if (!isResizeSync) {
        if (dragging) {
          const delta = pendingDragDelta;
          pendingDragDelta = 0;
          position += delta;
          if (dt > 0.0005) {
            const instVel = delta / dt;
            dragVel += (instVel - dragVel) * Math.min(1, dt * 18);
          }
          speed = dragVel;
        } else {
          const isPausedByUser =
            hovering ||
            iframeInteracting ||
            Boolean(carouselEl && carouselEl.matches(':hover'));
          const target =
            imagesDecoded && !isPausedByUser && !reducedMotion
              ? metrics.cruiseSpeed
              : 0;
          speed += (target - speed) * (1 - Math.exp(-dt * 6));
          position += speed * dt;
          dragVel = speed;
        }
      }

      const {
        slides,
        slideStep,
        slideWidth,
        loopWidth,
        leftPad,
        cardOffsetRight,
        mouthLocalX,
        stageWidth,
      } = metrics;
      const nSlides = slides.length;
      let crossedIndex = -1;

      for (let i = 0; i < nSlides; i++) {
        const baseX = i * slideStep;
        const raw = baseX - position + leftPad;
        const wrappedX = (((raw % loopWidth) + loopWidth) % loopWidth) - leftPad;
        const tx = wrappedX - baseX;

        // Write fractional px transform only
        slides[i].style.transform = `translate3d(${tx}px, 0, 0)`;

        // Active window with 2 full certificate widths of padding on the right entry side
        const inWindow =
          wrappedX + slideWidth >= -slideStep * 0.5 &&
          wrappedX <= stageWidth + slideStep * 2.0;

        if (activeFlags[i] !== inWindow) {
          activeFlags[i] = inWindow;
          slides[i].dataset.active = inWindow ? '1' : '0';
          slides[i].dispatchEvent(new Event('slideactivechange'));
        }

        const rightX = wrappedX + cardOffsetRight;
        const prevRight = prevRights[i];
        prevRights[i] = rightX;

        if (!isResizeSync && prevRight !== undefined) {
          const moveLeftDelta = prevRight - rightX;
          if (
            prevRight > mouthLocalX &&
            rightX <= mouthLocalX &&
            moveLeftDelta > 0 &&
            moveLeftDelta <= 200
          ) {
            crossedIndex = i % certCount;
          }
        }
      }

      hasInitialRender = true;

      if (crossedIndex !== -1) {
        triggerFolderReaction(crossedIndex);
      }
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;

      applyFrame(dt, false);

      // Keep running while visible, unless reducedMotion is settled at rest
      const settledAtRest =
        reducedMotion && !dragging && Math.abs(speed) < 0.05 && hasInitialRender;

      if (inView && docVisible && !settledAtRest) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const syncLoop = () => {
      const shouldRun =
        inView &&
        docVisible &&
        (!reducedMotion || dragging || Math.abs(speed) >= 0.05 || !hasInitialRender);

      if (shouldRun && rafId === 0) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      } else if (!shouldRun && rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    // Initial measurement
    measureLayout();
    syncLoop();

    // Debounced ResizeObserver
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measureLayout();
        syncLoop();
      }, 60);
    });
    ro.observe(stage);

    // Pause when section is offscreen
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        syncLoop();
      },
      { threshold: 0 }
    );
    io.observe(section);

    // Pause when tab is hidden; reset lastTime on resume so nothing jumps
    const handleVisibilityChange = () => {
      docVisible = !document.hidden;
      if (docVisible) {
        lastTime = performance.now();
      }
      syncLoop();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reduced motion preference listener
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion && !dragging) {
        speed = 0;
      }
      syncLoop();
    };
    mqReduced.addEventListener('change', handleReducedMotionChange);

    // 3. Smooth hover pause & pointer dragging with setPointerCapture
    const onCertMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CERT_INTERACT') {
        iframeInteracting = Boolean(e.data.active);
        if (!iframeInteracting) {
          syncLoop();
        }
      }
    };
    window.addEventListener('message', onCertMessage);

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        hovering = true;
      }
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        hovering = false;
        iframeInteracting = false;
        syncLoop();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      activePointerId = e.pointerId;
      lastPointerX = e.clientX;
      pendingDragDelta = 0;
      dragVel = speed;
      carouselEl?.classList.add('is-dragging');
      try {
        carouselEl?.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable for synthetic events
      }
      syncLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      pendingDragDelta -= dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = -1;
      carouselEl?.classList.remove('is-dragging');
      try {
        if (carouselEl?.hasPointerCapture(e.pointerId)) {
          carouselEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors
      }
      syncLoop();
    };

    if (carouselEl) {
      carouselEl.addEventListener('pointerenter', onPointerEnter, { passive: true });
      carouselEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
      carouselEl.addEventListener('pointerdown', onPointerDown);
      carouselEl.addEventListener('pointermove', onPointerMove, { passive: true });
      carouselEl.addEventListener('pointerup', endDrag, { passive: true });
      carouselEl.addEventListener('pointercancel', endDrag, { passive: true });
      carouselEl.addEventListener('lostpointercapture', endDrag, { passive: true });
    }

    // Read-only verification hook (zero runtime cost unless invoked)
    (window as unknown as Record<string, unknown>).__carouselState = () => ({
      position,
      speed,
      cruiseSpeed: metrics?.cruiseSpeed ?? 0,
      loopWidth: metrics?.loopWidth ?? 0,
      slideStep: metrics?.slideStep ?? 0,
      isRunning: rafId !== 0,
      inView,
      docVisible,
      hovering:
        hovering ||
        iframeInteracting ||
        Boolean(carouselEl && carouselEl.matches(':hover')),
      dragging,
      reducedMotion,
      imagesDecoded,
      activeSlideCount: activeFlags.filter(Boolean).length,
    });

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      if (rafId !== 0) cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('message', onCertMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mqReduced.removeEventListener('change', handleReducedMotionChange);
      if (carouselEl) {
        carouselEl.removeEventListener('pointerenter', onPointerEnter);
        carouselEl.removeEventListener('pointerleave', onPointerLeave);
        carouselEl.removeEventListener('pointerdown', onPointerDown);
        carouselEl.removeEventListener('pointermove', onPointerMove);
        carouselEl.removeEventListener('pointerup', endDrag);
        carouselEl.removeEventListener('pointercancel', endDrag);
        carouselEl.removeEventListener('lostpointercapture', endDrag);
      }
    };
  }, [displayCertificates]);

  return (
    <section className="sec" ref={sectionRef}>
      <aside className="rail">
        <span className="dot" />
        <h2>Certifications</h2>
        <span className="dot" />
      </aside>

      <div className="stage" id="st" ref={stageRef}>
        <div className="back">
          <svg viewBox="0 0 356 360" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="nzb" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={4} />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" />
              </filter>
              <clipPath id="cpb">
                <path d="M0,24 Q0,0 24,0 H62 Q76,0 84,10 L96,34 Q102,42 114,42 H332 Q356,42 356,66 V336 Q356,360 332,360 H24 Q0,360 0,336 Z" />
              </clipPath>
            </defs>
            <path fill="var(--fb)" d="M0,24 Q0,0 24,0 H62 Q76,0 84,10 L96,34 Q102,42 114,42 H332 Q356,42 356,66 V336 Q356,360 332,360 H24 Q0,360 0,336 Z" />
            <rect x="14" y="48" width="328" height="70" rx="3" fill="#f2f0e8" opacity=".6" stroke="#000" strokeOpacity=".12" />
            <rect x="22" y="56" width="312" height="70" rx="3" fill="#f2f0e8" opacity=".45" stroke="#000" strokeOpacity=".12" />
            <rect x="30" y="64" width="296" height="70" rx="3" fill="#f2f0e8" opacity=".32" stroke="#000" strokeOpacity=".12" />
            <rect x="38" y="72" width="280" height="70" rx="3" fill="#f2f0e8" opacity=".22" stroke="#000" strokeOpacity=".12" />
            <rect width="356" height="360" filter="url(#nzb)" clipPath="url(#cpb)" />
            <path d="M20,343 H336" stroke="#000" strokeOpacity=".2" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="tray" id="tr">
          <CertificateCarousel certificates={displayCertificates} />
        </div>

        <div className="front" id="fr" ref={frontRef}>
          <svg viewBox="0 0 342 360" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="nzf" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={4} />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" />
              </filter>
              <clipPath id="cpf">
                <path d="M0,128 Q0,112 16,112 H326 Q342,112 342,128 V336 Q342,360 318,360 H24 Q0,360 0,336 Z" />
              </clipPath>
            </defs>
            <path fill="var(--ff)" d="M0,128 Q0,112 16,112 H326 Q342,112 342,128 V336 Q342,360 318,360 H24 Q0,360 0,336 Z" />
            <rect width="342" height="360" filter="url(#nzf)" clipPath="url(#cpf)" />
            <path d="M16,113 H326" stroke="#fff" strokeOpacity=".3" strokeWidth="2" fill="none" />
            <path className="lip" d="M16,113 H326" stroke="var(--acc)" strokeWidth="4" fill="none" opacity="0" />
            <path d="M20,343 H322" stroke="#000" strokeOpacity=".2" strokeWidth="2" fill="none" />
            <path d="M20,346 H322" stroke="#fff" strokeOpacity=".1" strokeWidth="1.5" fill="none" />
            <rect x="130" y="148" width="136" height="54" rx="6" fill="#f2f0e8" />
            <rect x="130" y="148" width="7" height="54" rx="3" fill="var(--acc)" />
            <rect x="150" y="164" width="84" height="6" rx="3" fill="#b9b3a0" />
            <rect x="150" y="179" width="56" height="6" rx="3" fill="#cfc9b6" />
          </svg>
        </div>
        <div className="sh" />
        <div className="badge" id="bd" ref={badgeRef}>01</div>
      </div>
    </section>
  );
};

export default SkillPowerUpsSection;
