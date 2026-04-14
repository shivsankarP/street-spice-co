/* ─────────────────────────────────────────────────
   STREET SPICE CO — main.js
   Animations, Interactions & Scroll Effects
───────────────────────────────────────────────── */

"use strict";

/* ══════════════════════
   1. PRELOADER (Removed)
══════════════════════ */
// Loading screen removed as requested.

/* ══════════════════════
   3. HEADER SCROLL
══════════════════════ */
(function initHeader() {
  const header = document.getElementById("header");
  const backToTop = document.getElementById("back-to-top");
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    header.classList.toggle("scrolled", scrollY > 20);
    if (backToTop) backToTop.classList.toggle("visible", scrollY > 400);

    // Hide/show header on scroll
    if (scrollY > lastScroll && scrollY > 80) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }
    header.style.transition = "transform 0.35s ease, background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease";
    lastScroll = scrollY <= 0 ? 0 : scrollY;
  }, { passive: true });

  // Back to top
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ══════════════════════
   4. MOBILE NAV
══════════════════════ */
(function initMobileNav() {
  const hamburger = document.getElementById("nav-hamburger");
  const navLinks  = document.getElementById("nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    navLinks.classList.toggle("open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen.toString());
  });

  // Close on link click
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ══════════════════════
   5. ACTIVE NAV LINK
══════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          active?.classList.add("active");
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => observer.observe(s));
})();

/* ══════════════════════
   6. MENU EXPANDING PANELS
══════════════════════ */
(function initMenuPanels() {
  const panels = document.querySelectorAll('.menu-card.panel');
  const tabs = document.querySelectorAll(".menu-tab");

  function removeActiveClasses() {
    panels.forEach(panel => {
      panel.classList.remove('active');
    });
  }

  panels.forEach(panel => {
    const activate = () => {
      removeActiveClasses();
      panel.classList.add('active');
    };
    
    // Desktop: Expand on hover
    panel.addEventListener('mouseenter', activate);
    
    // Navigation on click for Desktop / Expansion on click for Mobile
    panel.addEventListener('click', (e) => {
      // If we are on Desktop View (matching CSS @media limit)
      if (window.innerWidth > 900) {
        const detailLink = panel.querySelector('.btn-card-more')?.getAttribute('href');
        if (detailLink) {
          window.location.href = detailLink;
        }
      } else {
        // On Mobile/Tablet: Click to expand
        activate();
      }
    });
  });

  // Default: activate first visible item for a premium look
  // const firstPanel = Array.from(panels).find(p => !p.classList.contains('hidden'));
  // if (firstPanel) firstPanel.classList.add('active');

  // Collapse all when mouse leaves the container (optional, but keeping it for now)
  const container = document.querySelector('.menu-container');
  if (container) {
    container.addEventListener('mouseleave', () => {
      removeActiveClasses();
      // Optional: Reactivate first visible item if you want a default state 
      // or leave all collapsed as requested
    });
  }

  // Filter integration
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const filter = tab.dataset.filter;

        panels.forEach((card) => {
          const match = filter === "all" || card.dataset.category === filter;
          card.classList.remove('active');
          
          if (match) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });
      });
    });
  }
})();

/* ══════════════════════
   7. TESTIMONIAL SLIDER
══════════════════════ */
(function initTestimonials() {
  const track = document.getElementById("testimonials-track");
  const dots  = document.querySelectorAll(".t-dot");
  if (!track) return;

  let currentIdx = 0;
  let autoTimer;

  function goTo(idx) {
    currentIdx = idx;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      clearInterval(autoTimer);
      goTo(parseInt(dot.dataset.idx, 10));
      startAuto();
    });
  });

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo((currentIdx + 1) % dots.length);
    }, 5000);
  }
  startAuto();

  // Touch / drag support
  let startX = 0;
  track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      clearInterval(autoTimer);
      goTo(diff > 0
        ? Math.min(currentIdx + 1, dots.length - 1)
        : Math.max(currentIdx - 1, 0));
      startAuto();
    }
  }, { passive: true });
})();

/* ══════════════════════
   8. CONTACT FORM
══════════════════════ */
(function initContactForm() {
  const form    = document.getElementById("contact-form");
  const success = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("form-submit");
    const btnText = btn?.querySelector(".btn-text");

    // Simulate submission
    if (btnText) btnText.textContent = "Reserving…";
    if (btn) btn.disabled = true;

    setTimeout(() => {
      form.style.display = "none";
      success?.classList.add("visible");
    }, 1800);
  });
})();

/* ══════════════════════
   9. NEWSLETTER FORM
══════════════════════ */
(function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("nl-submit");
    if (btn) btn.textContent = "✓";
    setTimeout(() => { if (btn) btn.textContent = "→"; }, 3000);
    (document.getElementById("nl-email")).value = "";
  });
})();

/* ══════════════════════
   10. PARALLAX HERO
══════════════════════ */
(function initParallax() {
  const heroBg = document.querySelector(".hero-bg-img");
  if (!heroBg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const heroH = document.querySelector(".hero")?.offsetHeight || 800;
    if (scrollY < heroH) {
      heroBg.style.transform = `scale(1.08) translateY(${scrollY * 0.25}px)`;
    }
  }, { passive: true });
})();

/* ══════════════════════
   11. GSAP ANIMATIONS
══════════════════════ */
function initGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // Fallback: reveal all hidden elements
    document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-card").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Reveal utilities
  function revealUp(selector, stagger = 0.12, start = "top 88%") {
    gsap.fromTo(selector,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: selector, start, toggleActions: "play none none none" }
      }
    );
  }

  function revealLeft(selector, start = "top 88%") {
    gsap.fromTo(selector,
      { opacity: 0, x: -70 },
      {
        opacity: 1, x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: selector, start, toggleActions: "play none none none" }
      }
    );
  }

  function revealRight(selector, start = "top 88%") {
    gsap.fromTo(selector,
      { opacity: 0, x: 70 },
      {
        opacity: 1, x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: selector, start, toggleActions: "play none none none" }
      }
    );
  }

  // ── Hero animations (Premium Staggered Reveal)
  const heroTL = gsap.timeline({ delay: 0.5 });
  
  if (document.querySelector(".hero")) {
    // Only animate the scroll hint as all other text was removed for minimalism
    heroTL.fromTo(".hero-scroll-hint", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
    
    // Orbs are dynamic decorative elements
    heroTL.fromTo(".orb", { opacity: 0, scale: 0 }, { opacity: 0.4, scale: 1, duration: 2, ease: "elastic.out(1, 0.5)", stagger: 0.3 }, "-=0.5");
  }

  // ── Hero Scroll Image Sequence
  const heroImgSequence = document.getElementById("hero-img-sequence");
  if (heroImgSequence) {
    const ctx = heroImgSequence.getContext("2d");
    
    // Detect mobile
    const isMobile = window.innerWidth <= 768;
    
    // Set internal resolution based on device
    if (isMobile) {
      heroImgSequence.width = 1080; // Mobile vertical resolution
      heroImgSequence.height = 1920;
    } else {
      heroImgSequence.width = 1920;
      heroImgSequence.height = 1080;
    }

    const frameCount = isMobile ? 240 : 192;
    const currentFrame = index => {
      if (isMobile) {
        return `mobile/ezgif-frame-${String(index + 1).padStart(3, '0')}.png`;
      }
      return `ezgif-split/frame_${String(index).padStart(3, '0')}.png`;
    };

    const images = [];
    const airpods = { frame: 0 };

    // Progressive Loader: Prioritize frame 0 then background-load others
    const firstImg = new Image();
    firstImg.src = currentFrame(0);
    firstImg.onload = () => {
        images[0] = firstImg;
        render(); // Render immediately when first frame is ready
        
        // Start preloading the full sequence in the background
        for (let i = 1; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                images[i] = img;
                // If scroll reached this frame while loading, render it
                if (airpods.frame === i) render();
            }
        }
    };

    function render() {
        if (images[airpods.frame] && images[airpods.frame].complete) {
            ctx.clearRect(0, 0, heroImgSequence.width, heroImgSequence.height);
            ctx.drawImage(images[airpods.frame], 0, 0, heroImgSequence.width, heroImgSequence.height);
        }
    }

    gsap.to(airpods, {
        frame: frameCount - 1,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: isMobile ? "+=1500" : "+=4000", // Further extended to ensure every frame is deliberate
            scrub: isMobile ? 0.5 : 3, // Even smoother delay as requested
            pin: true,
            anticipatePin: 1
        },
        onUpdate: render
    });
  }

  // ── Hero Mouse Parallax
  const hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.addEventListener("mousemove", (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 2;
      const yPos = (clientY / window.innerHeight - 0.5) * 2;

      // Parallax for orbs and content (if they exist)
      if (document.querySelector(".orb-1")) gsap.to(".orb-1", { x: xPos * 50, y: yPos * 50, duration: 3, ease: "power2.out" });
      if (document.querySelector(".orb-2")) gsap.to(".orb-2", { x: -xPos * 30, y: -yPos * 30, duration: 2.5, ease: "power2.out" });
      if (document.querySelector(".hero-content")) gsap.to(".hero-content", { x: xPos * 10, y: yPos * 10, duration: 1.5, ease: "power2.out" });
    });
  }

  // ── Marquee (already CSS animated — just need to ensure visibility)
  gsap.set(".marquee-strip", { opacity: 1 });

  // ── Menu section
  gsap.fromTo(".menu-section .section-eyebrow",
    { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".menu-section", start: "top 80%" } });

  gsap.fromTo(".menu-section .section-title",
    { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1,
      scrollTrigger: { trigger: ".menu-section", start: "top 80%" } });

  if (document.querySelector(".menu-tabs")) {
    gsap.fromTo(".menu-tabs",
      { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out",
        scrollTrigger: { trigger: ".menu-tabs", start: "top 88%" } });
  }

  gsap.fromTo(".reveal-card",
    { opacity: 0, y: 60, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: "#menu-grid", start: "top 85%", toggleActions: "play none none none" } });

  // ── About section


  gsap.fromTo(".about-story-inner > *",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".about-story-inner", start: "top 80%" } });

  // ── Testimonials (Safety Check)
  if (document.querySelector(".testimonials-section")) {
    gsap.fromTo(".testimonials-section .section-eyebrow, .testimonials-section .section-title",
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out",
        scrollTrigger: { trigger: ".testimonials-section", start: "top 80%" } });

    gsap.fromTo(".testimonials-track-wrap",
      { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".testimonials-track-wrap", start: "top 85%" } });
  }

  // ── Contact section
  gsap.fromTo(".contact-info-panel > *",
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".contact-section", start: "top 80%" } });

  gsap.fromTo(".contact-form-card",
    { opacity: 0, x: 50, scale: 0.97 },
    { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".contact-form-card", start: "top 80%" } });

  // ── Footer
  gsap.fromTo(".footer-inner > *",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".footer-inner", start: "top 90%" } });

  // Counter section removed as stats are no longer present
}

/* ══════════════════════
   12. INTERSECTION OBSERVER FALLBACK
   (runs if GSAP hasn't loaded yet)
══════════════════════ */
(function initFallbackReveal() {
  // If GSAP loads successfully, this does nothing significant
  // If GSAP fails, this ensures elements are visible
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // GSAP hasn't animated this yet — apply CSS fallback
        entry.target.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el) => observer.observe(el));
})();

/* ══════════════════════
   13. SMOOTH SCROLL ALL ANCHORS
══════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});



/* ══════════════════════
   15. INIT (wait for GSAP CDN)
══════════════════════ */
window.addEventListener("load", () => {
  document.querySelector(".hero")?.classList.add("loaded");
  if (typeof gsap !== "undefined") initGSAP();
}, { once: true });
