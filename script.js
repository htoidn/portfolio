/* 
   PORTFOLIO — script.js
   Particle canvas · Custom cursor · Scroll reveals
   Counter animation · Card glow · Hamburger menu
*/

(function () {
  "use strict";

  /* 1. CUSTOM CURSOR */
  const cursor   = document.getElementById("cursor");
  const follower = document.getElementById("cursorFollower");

  if (cursor && follower) {
    let mx = 0, my = 0;
    let fx = 0, fy = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top  = my + "px";
    });

    // Smooth follower
    function followCursor() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + "px";
      follower.style.top  = fy + "px";
      requestAnimationFrame(followCursor);
    }
    followCursor();

    // Hover states on interactive elements
    const hoverTargets = document.querySelectorAll(
      "a, button, .project-card, .skill-pill, .tag"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hovered");
        follower.classList.add("hovered");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hovered");
        follower.classList.remove("hovered");
      });
    });
  }

  /* 2. NAVBAR — scroll effect + hamburger */
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* 3. PARTICLE CANVAS */
  const canvas = document.getElementById("particleCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = 80;
    const MAX_DIST       = 130;
    const ACCENT         = "0,229,200";

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.vx = (Math.random() - .5) * .35;
        this.vy = -(Math.random() * .4 + .1);
        this.r  = Math.random() * 1.8 + .5;
        this.alpha = Math.random() * .5 + .15;
        this.life  = Math.random() * 200 + 80;
        this.age   = 0;
      }
      update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.vx += (dx / dist) * force * 0.5;
          this.vy += (dy / dist) * force * 0.5;
        }
        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x   += this.vx;
        this.y   += this.vy;
        this.age++;
        if (this.age > this.life || this.y < -10) this.reset(false);
      }
      draw() {
        const lifeRatio = Math.min(this.age / 20, 1) * Math.min((this.life - this.age) / 20, 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},${this.alpha * lifeRatio})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
            ctx.lineWidth   = .6;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener("resize", () => { resize(); });

    canvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener("mouseleave", () => {
      mouse.x = -9999; mouse.y = -9999;
    });
  }

  /* 4. INTERSECTION OBSERVER — scroll reveals */
  const revealEls = document.querySelectorAll(".reveal");
  const revealIO  = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // Stagger siblings inside the same parent
          const siblings = Array.from(
            e.target.parentElement.querySelectorAll(".reveal:not(.visible)")
          );
          const idx = siblings.indexOf(e.target);
          setTimeout(() => {
            e.target.classList.add("visible");
          }, idx * 80);
          revealIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealIO.observe(el));

  /* 5. COUNTER ANIMATION (hero stats) */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll(".stat-num[data-target]");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* 6. SKILL BAR ANIMATION */
  const skillPills = document.querySelectorAll(".skill-pill");
  const skillIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("animated"), 100);
          skillIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  skillPills.forEach((el) => skillIO.observe(el));

  /* 7. PROJECT CARD — mouse glow effect */
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");
    });
  });

  /* 8. SMOOTH ANCHOR SCROLL (fallback for older browsers) */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* 9. ACTIVE NAV LINK on scroll */
  const sections  = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav-link");

  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + e.target.id
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );
  sections.forEach((s) => sectionIO.observe(s));

})();
