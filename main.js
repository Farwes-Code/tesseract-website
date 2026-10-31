import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// PRELOADER
// ==========================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('loaded');
    initHeroAnimations();
  }, 2200);
});

// ==========================================
// CUSTOM CURSOR
// ==========================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX - 4, y: e.clientY - 4, duration: 0.1 });
    gsap.to(cursorFollower, { x: e.clientX - 18, y: e.clientY - 18, duration: 0.25 });
  });

  // Hover effects
  const hoverables = document.querySelectorAll('a, button, .service-card, .portfolio-card, .team-card, .contact-card');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
  });
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 200;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
});

// ==========================================
// MOBILE MENU
// ==========================================
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ==========================================
// THREE.JS — 3D TESSERACT IN HERO
// ==========================================
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create tesseract (hypercube wireframe)
  const tesseractGroup = new THREE.Group();

  // Inner cube - electric cyan
  const innerGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const innerEdges = new THREE.EdgesGeometry(innerGeo);
  const innerMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });
  const innerCube = new THREE.LineSegments(innerEdges, innerMat);
  tesseractGroup.add(innerCube);

  // Outer cube - royal sapphire blue
  const outerGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
  const outerEdges = new THREE.EdgesGeometry(outerGeo);
  const outerMat = new THREE.LineBasicMaterial({ color: 0x087bff, transparent: true, opacity: 0.5 });
  const outerCube = new THREE.LineSegments(outerEdges, outerMat);
  tesseractGroup.add(outerCube);

  // Connecting lines between inner and outer vertices
  const innerVertices = [
    [-0.6, -0.6, -0.6], [-0.6, -0.6, 0.6], [-0.6, 0.6, -0.6], [-0.6, 0.6, 0.6],
    [0.6, -0.6, -0.6], [0.6, -0.6, 0.6], [0.6, 0.6, -0.6], [0.6, 0.6, 0.6]
  ];
  const outerVertices = [
    [-1.2, -1.2, -1.2], [-1.2, -1.2, 1.2], [-1.2, 1.2, -1.2], [-1.2, 1.2, 1.2],
    [1.2, -1.2, -1.2], [1.2, -1.2, 1.2], [1.2, 1.2, -1.2], [1.2, 1.2, 1.2]
  ];

  const connectGeo = new THREE.BufferGeometry();
  const connectPoints = [];
  for (let i = 0; i < 8; i++) {
    connectPoints.push(new THREE.Vector3(...innerVertices[i]));
    connectPoints.push(new THREE.Vector3(...outerVertices[i]));
  }
  connectGeo.setFromPoints(connectPoints);
  const connectMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.45 });
  const connectLines = new THREE.LineSegments(connectGeo, connectMat);
  tesseractGroup.add(connectLines);

  // Glowing center sphere - luminous cyan flare matching logo core
  const sphereGeo = new THREE.SphereGeometry(0.18, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.95 });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  tesseractGroup.add(sphere);

  // Vertex dots on inner cube
  innerVertices.forEach(v => {
    const dotGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(...v);
    tesseractGroup.add(dot);
  });

  // Vertex dots on outer cube - royal sapphire blue
  outerVertices.forEach(v => {
    const dotGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x087bff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(...v);
    tesseractGroup.add(dot);
  });

  // Floating particles
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 200;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    particlePositions[i] = (Math.random() - 0.5) * 15;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.02,
    transparent: true,
    opacity: 0.5
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  tesseractGroup.position.set(2, 0, 0);
  scene.add(tesseractGroup);

  // Mouse movement for parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Rotate tesseract
    tesseractGroup.rotation.x += 0.003;
    tesseractGroup.rotation.y += 0.005;

    // Inner cube counter-rotation
    innerCube.rotation.x = Math.sin(time * 0.5) * 0.3;
    innerCube.rotation.z = Math.cos(time * 0.3) * 0.3;

    // Center sphere pulsing
    const pulse = Math.sin(time * 2) * 0.05 + 0.15;
    sphere.scale.set(pulse / 0.15, pulse / 0.15, pulse / 0.15);

    // Parallax effect
    tesseractGroup.position.x = 2 + mouseX * 0.3;
    tesseractGroup.position.y = mouseY * 0.3;

    // Rotate particles slowly
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    renderer.render(scene, camera);
  }

  animate();
}

initThreeJS();

// ==========================================
// HERO PARTICLES (CSS-based)
// ==========================================
function createHeroParticles() {
  const container = document.getElementById('hero-particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    const size = 1 + Math.random() * 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    if (Math.random() > 0.5) {
      particle.style.background = '#7b2ff7';
    }
    container.appendChild(particle);
  }
}
createHeroParticles();

// ==========================================
// HERO ANIMATIONS (GSAP)
// ==========================================
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 })
    .to('.line-1', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('.line-2', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.line-3', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');

  // Counter animation
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.count);
    gsap.to(el, {
      innerText: target,
      duration: 2,
      delay: 2.5,
      snap: { innerText: 1 },
      ease: 'power2.out'
    });
  });
}

// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================

// Section headers
gsap.utils.toArray('.section-header').forEach(header => {
  gsap.from(header.children, {
    scrollTrigger: {
      trigger: header,
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });
});

// About section
gsap.from('.about-description', {
  scrollTrigger: { trigger: '.about-text', start: 'top 80%' },
  y: 30, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out'
});

gsap.utils.toArray('.value-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 92%',
      toggleActions: 'play none none none'
    },
    x: -30,
    opacity: 0,
    duration: 0.6,
    delay: i * 0.1,
    ease: 'power3.out'
  });
});

gsap.from('.tech-orbit', {
  scrollTrigger: { trigger: '.about-visual', start: 'top 80%' },
  scale: 0.5, opacity: 0, duration: 1, ease: 'back.out(1.7)'
});

// Service cards
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      toggleActions: 'play none none none'
    },
    y: 60,
    opacity: 0,
    duration: 0.7,
    delay: i * 0.08,
    ease: 'power3.out'
  });
});

// Portfolio cards
gsap.utils.toArray('.portfolio-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%'
    },
    y: 80,
    opacity: 0,
    duration: 0.9,
    delay: i * 0.1,
    ease: 'power3.out'
  });
});

// Team cards
gsap.utils.toArray('.team-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 88%'
    },
    y: 50,
    scale: 0.95,
    opacity: 0,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out'
  });
});

// Contact section
gsap.from('.contact-card', {
  scrollTrigger: { trigger: '.contact-info', start: 'top 85%' },
  x: -30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out'
});

gsap.from('.form-group', {
  scrollTrigger: { trigger: '.contact-form', start: 'top 85%' },
  y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out'
});

// ==========================================
// SERVICE CARD TILT EFFECT
// ==========================================
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// ==========================================
// PORTFOLIO CARD MOUSE GLOW
// ==========================================
document.querySelectorAll('.portfolio-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');

    const glow = card.querySelector('.portfolio-glow');
    if (glow) {
      glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(0, 212, 255, 0.06), transparent 40%)`;
    }
  });
});

// ==========================================
// SMOOTH SCROLL FOR NAV LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==========================================
// CONTACT FORM
// ==========================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn-submit');
    const btnText = btn.querySelector('span');
    const originalText = btnText.textContent;

    // Show sending state
    btn.disabled = true;
    btnText.textContent = 'Sending...';
    btn.style.opacity = '0.85';

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://formsubmit.co/ajax/tesseractcon@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        btnText.textContent = 'Message Sent! ✓';
        btn.style.background = 'linear-gradient(135deg, #00d4ff 0%, #087bff 100%)';
        btn.style.opacity = '1';
        contactForm.reset();

        setTimeout(() => {
          btnText.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback triggered:', err);
      // Fallback: If network or adblocker blocks cross-origin fetch, submit natively
      btnText.textContent = 'Sending...';
      contactForm.submit();
    }
  });
}

// ==========================================
// MAGNETIC BUTTON EFFECT
// ==========================================
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ==========================================
// PARALLAX ON SCROLL (subtle hero elements)
// ==========================================
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.querySelector('.hero-content');
  if (hero && scrollY < window.innerHeight) {
    hero.style.transform = `translateY(${scrollY * 0.15}px)`;
    hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }
});
