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

/* ── HEADER SCROLL STATE (init once — header is outside #swup) ── */
function initHeader() {
  const header = document.querySelector('.site-header')
  if (!header || header.dataset.headerInit) return
  header.dataset.headerInit = 'true'
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 20)
  toggle()
  window.addEventListener('scroll', toggle, { passive: true })
}

/* ── MOBILE NAV (init once — nav drawer is outside #swup) ───── */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger')
  const mobileNav = document.querySelector('.mobile-nav')
  if (!hamburger || !mobileNav || hamburger.dataset.navInit) return
  hamburger.dataset.navInit = 'true'

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open')
    mobileNav.classList.toggle('open', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  // Close drawer when any nav link is clicked (Swup handles the navigation)
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
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 44 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    )
  })

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
          start: 'top bottom', end: 'bottom top', scrub: 0.6,
          invalidateOnRefresh: true,
        }
      }
    )
  })
}

/* ── HERO PHOTO PARALLAX (desktop only) ─────────────────────── */
// Store the handler so we can remove it before re-attaching on page revisit
let _heroParallaxHandler = null

function initHeroParallax() {
  // Always remove old handler first (prevents stacking on page:view)
  if (_heroParallaxHandler) {
    window.removeEventListener('scroll', _heroParallaxHandler)
    _heroParallaxHandler = null
  }

  const heroImg     = document.querySelector('.hero-photo-col img')
  const heroSection = document.querySelector('.hero')
  if (!heroImg || !heroSection || window.innerWidth <= 860) return

  const onScroll = () => {
    const sectionH = heroSection.offsetHeight
    const progress = Math.max(0, Math.min(1, -heroSection.getBoundingClientRect().top / sectionH))
    const buffer   = heroImg.parentElement.offsetHeight * 0.18
    heroImg.style.transform = `translateY(${-(progress * buffer)}px)`
  }

  _heroParallaxHandler = onScroll
  window.addEventListener('scroll', _heroParallaxHandler, { passive: true })
  onScroll()
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
  const items = gsap.utils.toArray('.gallery-masonry-item')
  if (!items.length) return

  // Immediately hide all items — prevents the flash where items are visible
  // for the brief moment between Swup inserting content and GSAP running
  gsap.set(items, { opacity: 0, y: 32, scale: 0.97 })

  items.forEach(item => {
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
let _marqueeTween = null

function initMarquee() {
  const inner = document.querySelector('.marquee-inner')
  if (!inner) return
  // Kill previous tween before creating a new one (prevents stacking)
  if (_marqueeTween) { _marqueeTween.kill(); _marqueeTween = null }
  _marqueeTween = gsap.to(inner, {
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
// Module-level state so open/close/back-button stay in sync across page views
let _lbOpen         = false
let _lbKeydown      = null
let _lbPopstate     = null

function initLightbox() {
  const lightbox   = document.querySelector('.lightbox')
  if (!lightbox) return
  const lbImg      = lightbox.querySelector('.lightbox-img')
  const lbLabel    = lightbox.querySelector('.lightbox-label')
  const lbClose    = lightbox.querySelector('.lightbox-close')
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop')

  /* open — pushes a history entry so the back button can close */
  const open = (src, label) => {
    if (_lbOpen) return
    _lbOpen = true
    lbImg.src = src
    lbImg.alt = label || ''
    if (lbLabel) lbLabel.textContent = label || ''
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
    lenis.stop()
    history.pushState({ lightboxOpen: true }, '')
  }

  /* close — called by popstate (back button) or close button */
  const close = () => {
    if (!_lbOpen) return
    _lbOpen = false
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    lenis.start()
    setTimeout(() => { lbImg.src = '' }, 400)
  }

  /* handleClose — trigger via UI; go back in history so back button stays consistent */
  const handleClose = () => {
    if (_lbOpen) history.back()   // → fires popstate → close()
  }

  /* ── Document / window listeners — clean up before re-attaching ── */
  if (_lbKeydown)  document.removeEventListener('keydown',  _lbKeydown)
  if (_lbPopstate) window.removeEventListener('popstate', _lbPopstate)

  _lbKeydown  = e => { if (e.key === 'Escape') handleClose() }
  _lbPopstate = () => { if (_lbOpen) close() }

  document.addEventListener('keydown',  _lbKeydown)
  window.addEventListener('popstate',   _lbPopstate)

  /* ── Close button & backdrop (persistent elements) ── */
  if (!lightbox.dataset.lbInit) {
    lightbox.dataset.lbInit = 'true'
    lbClose?.addEventListener('click',    handleClose)
    lbBackdrop?.addEventListener('click', handleClose)
  }

  /* ── Gallery items with explicit data-src ── */
  document.querySelectorAll('.gallery-masonry-item[data-src]').forEach(item => {
    item.addEventListener('click', () => open(item.dataset.src, item.dataset.label || ''))
  })

  /* ── ALL other content images — tap/click to zoom ── */
  document.querySelectorAll('img').forEach(img => {
    // Skip non-content images
    if (
      img.closest('.logo')                  ||  // logo
      img.closest('.site-header')           ||  // header icons
      img.closest('.lightbox')              ||  // the lightbox img itself
      img.closest('.gallery-masonry-item')  ||  // already handled above
      img.closest('.whatsapp-fab')          ||  // fab icon
      !img.src || img.src.startsWith('data:')   // empty / inline SVG
    ) return

    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => {
      // Prefer a high-res data-src if available, fallback to rendered src
      const src = img.dataset.src || img.src
      open(src, img.alt || img.dataset.label || '')
    })
  })
}

/* ── SECTION HEADING REVEALS ────────────────────────────────── */
function initSectionHeadings() {
  gsap.utils.toArray('.section-intro h2, .section-intro p, .page-hero h1, .page-hero p').forEach(el => {
    if (el.closest('.hero')) return
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 87%', once: true }
      }
    )
  })
}

/* ── LAZY LOAD BELOW-FOLD IMAGES ────────────────────────────── */
function initLazyImages() {
  document.querySelectorAll('img').forEach(img => {
    // Skip hero image and logo — they must load eagerly
    if (img.closest('.hero-photo-col') || img.closest('.logo')) return
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy')
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async')
  })
}

/* ── MASTER INIT (runs on every page load / Swup transition) ── */
function initPage() {
  setActiveNav()          // update active link on every navigation
  initScrollReveals()
  initImageReveals()
  initCinematicParallax()
  initHeroParallax()      // cleans up previous listener automatically
  initCounters()
  initGalleryAnimations() // immediately hides items to prevent flash
  initMarquee()           // kills previous tween before creating new one
  initLightbox()
  initSectionHeadings()
  initHeroAnimation()
  initLazyImages()
  ScrollTrigger.refresh()
}

/* ── BOOT ───────────────────────────────────────────────────── */
// Header & mobile nav target fixed elements OUTSIDE #swup —
// run them once at boot only, never on page:view
initHeader()
initMobileNav()
initPage()
