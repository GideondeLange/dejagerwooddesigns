/* ============================================================
   DE JAGER WOOD DESIGNS — main.js
   Lenis · GSAP · ScrollTrigger · Swup
   ============================================================ */

import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Swup from 'swup'
import PreloadPlugin from '@swup/preload-plugin'
import BodyClassPlugin from '@swup/body-class-plugin'

gsap.registerPlugin(ScrollTrigger)

/* ── LENIS SMOOTH SCROLL ────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* ── SWUP PAGE TRANSITIONS ──────────────────────────────────── */
const swup = new Swup({
  containers: ['#swup'],
  plugins: [new PreloadPlugin(), new BodyClassPlugin()],
  animationSelector: '[class*="transition-"]',
})

swup.hooks.on('page:view', () => {
  lenis.scrollTo(0, { immediate: true })
  ScrollTrigger.getAll().forEach(st => st.kill())
  initPage()
})

/* ── HEADER SCROLL STATE ────────────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.site-header')
  if (!header) return
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 20)
  toggle()
  window.addEventListener('scroll', toggle, { passive: true })
}

/* ── MOBILE NAV ─────────────────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger')
  const mobileNav = document.querySelector('.mobile-nav')
  if (!hamburger || !mobileNav) return

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open')
    mobileNav.classList.toggle('open', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open')
      mobileNav.classList.remove('open')
      document.body.style.overflow = ''
    })
  })
}

/* ── ACTIVE NAV LINK ────────────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || ''
    link.classList.toggle('active', href === path || (path === '' && href === '/'))
  })
}

/* ── HERO ENTRANCE ANIMATION ────────────────────────────────── */
function initHeroAnimation() {
  const heroTitle = document.querySelector('.hero-title')
  if (!heroTitle) return

  // Word-by-word split
  const raw = heroTitle.dataset.text || heroTitle.textContent.trim()
  heroTitle.innerHTML = raw
    .split(' ')
    .map(w => `<span class="word">${w}</span>`)
    .join(' ')

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.fromTo('.hero-badge',       { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.1)
  tl.fromTo('.hero-label',       { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, 0.2)
  tl.fromTo('.hero-title .word', { opacity: 0, y: 60, rotateX: 12 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.06 }, 0.35)
  tl.fromTo('.hero-sub',         { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 }, 0.9)
  tl.fromTo('.hero-btns',        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65 }, 1.1)
  tl.fromTo('.hero-scroll-hint', { opacity: 0 },        { opacity: 1, duration: 0.5 }, 1.6)
}

/* ── SCROLL REVEALS ─────────────────────────────────────────── */
function initScrollReveals() {
  // Single elements
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    )
  })

  // Groups (staggered)
  gsap.utils.toArray('.reveal-group').forEach(group => {
    const items = group.querySelectorAll('.glass-card, .process-step, .stat-item, .why-card, .specialist-card')
    if (!items.length) return
    gsap.fromTo(items,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.11,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      }
    )
  })
}

/* ── CLIP-PATH IMAGE REVEAL ─────────────────────────────────── */
function initImageReveals() {
  gsap.utils.toArray('.image-reveal').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      }
    )
  })
}

/* ── CINEMATIC PARALLAX (desktop only) ──────────────────────── */
function initCinematicParallax() {
  if (window.innerWidth <= 860) return
  gsap.utils.toArray('.cinematic-single img, .cinematic-pair-item img').forEach(img => {
    gsap.fromTo(img,
      { y: '0%' },
      {
        y: '-14%', ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.cinematic-single, .cinematic-pair-item'),
          start: 'top bottom', end: 'bottom top', scrub: 0.8
        }
      }
    )
  })
}

/* ── HERO PHOTO PARALLAX (desktop only) ─────────────────────── */
function initHeroParallax() {
  const heroImg     = document.querySelector('.hero-photo-col img')
  const heroSection = document.querySelector('.hero')
  if (!heroImg || !heroSection || window.innerWidth <= 860) return

  const onScroll = () => {
    const sectionH = heroSection.offsetHeight
    // How far the section has scrolled past the top (0 = at top, 1 = fully off-screen)
    const progress = Math.max(0, Math.min(1, -heroSection.getBoundingClientRect().top / sectionH))
    // Buffer matches the 18% CSS top offset — image travels from 0 → -buffer as section scrolls away
    const buffer = heroImg.parentElement.offsetHeight * 0.18
    heroImg.style.transform = `translateY(${-(progress * buffer)}px)`
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll() // set correct position on load
}

/* ── COUNTER ANIMATION ──────────────────────────────────────── */
function initCounters() {
  gsap.utils.toArray('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target, 10)
    if (isNaN(target)) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = Math.round(obj.val) + (el.dataset.suffix || '')
      },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    })
  })
}

/* ── GALLERY MASONRY STAGGER ────────────────────────────────── */
function initGalleryAnimations() {
  gsap.utils.toArray('.gallery-masonry-item').forEach((item) => {
    gsap.fromTo(item,
      { opacity: 0, y: 32, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 94%', once: true }
      }
    )
  })
}

/* ── MARQUEE ────────────────────────────────────────────────── */
function initMarquee() {
  const inner = document.querySelector('.marquee-inner')
  if (!inner) return
  gsap.to(inner, {
    xPercent: -50,
    ease: 'none',
    repeat: -1,
    duration: 28,
    modifiers: {
      xPercent: gsap.utils.unitize(x => parseFloat(x) % -50)
    }
  })
}

/* ── LIGHTBOX ───────────────────────────────────────────────── */
function initLightbox() {
  const lightbox  = document.querySelector('.lightbox')
  if (!lightbox) return
  const lbImg     = lightbox.querySelector('.lightbox-img')
  const lbLabel   = lightbox.querySelector('.lightbox-label')
  const lbClose   = lightbox.querySelector('.lightbox-close')
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop')

  const open = (src, label) => {
    lbImg.src = src
    lbImg.alt = label || ''
    if (lbLabel) lbLabel.textContent = label || ''
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
    lenis.stop()
  }

  const close = () => {
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    lenis.start()
    setTimeout(() => { lbImg.src = '' }, 400)
  }

  document.querySelectorAll('.gallery-masonry-item[data-src]').forEach(item => {
    item.addEventListener('click', () => open(item.dataset.src, item.dataset.label))
  })

  lbClose?.addEventListener('click', close)
  lbBackdrop?.addEventListener('click', close)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close() })
}

/* ── SECTION HEADING REVEALS ────────────────────────────────── */
function initSectionHeadings() {
  gsap.utils.toArray('.section-intro h2, .section-intro p, .page-hero h1, .page-hero p').forEach(el => {
    if (el.closest('.hero')) return // skip hero (handled separately)
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 87%', once: true }
      }
    )
  })
}

/* ── MASTER INIT (runs on every page load/transition) ────────── */
function initPage() {
  initHeader()
  initMobileNav()
  setActiveNav()
  initScrollReveals()
  initImageReveals()
  initCinematicParallax()
  initHeroParallax()
  initCounters()
  initGalleryAnimations()
  initMarquee()
  initLightbox()
  initSectionHeadings()
  initHeroAnimation()
  ScrollTrigger.refresh()
}

/* ── BOOT ───────────────────────────────────────────────────── */
initPage()
