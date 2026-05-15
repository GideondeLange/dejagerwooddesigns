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

// page:view: runs right after new content is inserted (before fade-in starts)
swup.hooks.on('page:view', () => {
  lenis.scrollTo(0, { immediate: true })
  ScrollTrigger.getAll().forEach(st => st.kill())
  initPage()
})

// animation:in:end: runs after Swup's fade-in is fully done.
// Only refresh ScrollTrigger HERE — DOM positions are now stable & correct.
swup.hooks.on('animation:in:end', () => {
  ScrollTrigger.refresh()
})

/* ── HEADER SCROLL STATE (init once — outside #swup) ────────── */
function initHeader() {
  const header = document.querySelector('.site-header')
  if (!header || header.dataset.headerInit) return
  header.dataset.headerInit = 'true'
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 20)
  toggle()
  window.addEventListener('scroll', toggle, { passive: true })
}

/* ── DESKTOP DROPDOWNS (init once — outside #swup) ──────────── */
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown')
  if (!dropdowns.length || document.body.dataset.dropdownInit) return
  document.body.dataset.dropdownInit = 'true'

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown-trigger')
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = dd.classList.toggle('open')
      trigger.setAttribute('aria-expanded', isOpen)
      dropdowns.forEach(other => {
        if (other !== dd) {
          other.classList.remove('open')
          other.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false')
        }
      })
    })
  })

  document.addEventListener('click', () => {
    dropdowns.forEach(dd => {
      dd.classList.remove('open')
      dd.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false')
    })
  })
}

/* ── MOBILE NAV (init once — outside #swup) ─────────────────── */
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

  // Accordion toggles
  mobileNav.querySelectorAll('.mobile-nav-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const group = toggle.closest('.mobile-nav-group')
      const isOpen = group.classList.toggle('open')
      toggle.setAttribute('aria-expanded', isOpen)
    })
  })

  // Close drawer on link click (not on accordion toggle buttons)
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
  // Highlight dropdown trigger when a child page is active
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const hasActiveChild = dd.querySelector('.nav-link.active')
    dd.querySelector('.nav-dropdown-trigger')?.classList.toggle('active', !!hasActiveChild)
  })
  document.querySelectorAll('.mobile-nav-group').forEach(group => {
    const hasActiveChild = group.querySelector('.nav-link.active')
    group.querySelector('.mobile-nav-toggle')?.classList.toggle('active', !!hasActiveChild)
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
let _heroParallaxHandler = null

function initHeroParallax() {
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
      val: target, duration: 1.8, ease: 'power2.out',
      onUpdate() { el.textContent = Math.round(obj.val) + (el.dataset.suffix || '') },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    })
  })
}

/* ── GALLERY MASONRY ────────────────────────────────────────── */
// Why a flat timed stagger instead of ScrollTrigger:
//   - ScrollTrigger.refresh() during a Swup transition measures item
//     positions while the fade-in transform is still applied, so some
//     items never trigger.
//   - The image dimensions are now baked into each <img> as width/height
//     attrs, so layout no longer reflows as JPEGs arrive — that means
//     a simple timed stagger is reliable and produces no glitch.
let _galleryTween = null

function initGalleryAnimations() {
  const items = gsap.utils.toArray('.gallery-masonry-item')
  if (!items.length) return

  // Kill any previous gallery tween
  if (_galleryTween) { _galleryTween.kill(); _galleryTween = null }

  // Hide immediately via GSAP (CSS also hides them as a backstop)
  gsap.set(items, { opacity: 0, y: 20 })

  // Stagger in — delay 0.25s so Swup's 0.2s fade-in finishes first
  _galleryTween = gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: { each: 0.035, from: 'start' },
    ease: 'power2.out',
    delay: 0.25,
    clearProps: 'y',   // clean up transform after animation
  })
}

/* ── MARQUEE ────────────────────────────────────────────────── */
let _marqueeTween = null

function initMarquee() {
  const inner = document.querySelector('.marquee-inner')
  if (!inner) return
  if (_marqueeTween) { _marqueeTween.kill(); _marqueeTween = null }
  _marqueeTween = gsap.to(inner, {
    xPercent: -50, ease: 'none', repeat: -1, duration: 28,
    modifiers: { xPercent: gsap.utils.unitize(x => parseFloat(x) % -50) }
  })
}

/* ── LIGHTBOX ───────────────────────────────────────────────── */
let _lbOpen     = false
let _lbKeydown  = null
let _lbPopstate = null

function initLightbox() {
  const lightbox   = document.querySelector('.lightbox')
  if (!lightbox) return
  const lbImg      = lightbox.querySelector('.lightbox-img')
  const lbLabel    = lightbox.querySelector('.lightbox-label')
  const lbClose    = lightbox.querySelector('.lightbox-close')
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop')

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

  const close = () => {
    if (!_lbOpen) return
    _lbOpen = false
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
    lenis.start()
    setTimeout(() => { lbImg.src = '' }, 400)
  }

  const handleClose = () => { if (_lbOpen) history.back() }

  if (_lbKeydown)  document.removeEventListener('keydown',  _lbKeydown)
  if (_lbPopstate) window.removeEventListener('popstate', _lbPopstate)

  _lbKeydown  = e => { if (e.key === 'Escape') handleClose() }
  _lbPopstate = () => { if (_lbOpen) close() }

  document.addEventListener('keydown',  _lbKeydown)
  window.addEventListener('popstate',   _lbPopstate)

  if (!lightbox.dataset.lbInit) {
    lightbox.dataset.lbInit = 'true'
    lbClose?.addEventListener('click',    handleClose)
    lbBackdrop?.addEventListener('click', handleClose)
  }

  document.querySelectorAll('.gallery-masonry-item[data-src]').forEach(item => {
    item.addEventListener('click', () => open(item.dataset.src, item.dataset.label || ''))
  })

  document.querySelectorAll('img').forEach(img => {
    if (
      img.closest('.logo')                 ||
      img.closest('.site-header')          ||
      img.closest('.lightbox')             ||
      img.closest('.gallery-masonry-item') ||
      img.closest('.whatsapp-fab')         ||
      !img.src || img.src.startsWith('data:')
    ) return
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => open(img.dataset.src || img.src, img.alt || ''))
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
    if (img.closest('.hero-photo-col') || img.closest('.logo')) return
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy')
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async')
  })
}

/* ── MASTER INIT (every page load / Swup transition) ─────────── */
// NOTE: ScrollTrigger.refresh() is NOT called here.
// On Swup navigation it runs via animation:in:end (after fade-in completes).
// On initial load it runs via requestAnimationFrame below.
function initPage() {
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
  initLazyImages()
}

/* ── WHATSAPP CLICK TRACKING ────────────────────────────────── */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href*="wa.me"]')
  if (!link) return
  if (typeof gtag === 'function') {
    gtag('event', 'whatsapp_click', {
      event_category: 'engagement',
      event_label: link.href
    })
  }
})

/* ── BOOT ───────────────────────────────────────────────────── */
initHeader()
initDropdowns()
initMobileNav()
initPage()
// Refresh ScrollTrigger after first paint on initial load
// (equivalent to animation:in:end for Swup navigations)
requestAnimationFrame(() => ScrollTrigger.refresh())
