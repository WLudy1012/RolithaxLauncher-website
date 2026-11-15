import { onMounted, onBeforeUnmount } from 'vue'

export function useSiteMotion() {
  let dispose = () => {}
  let preference

  function configure() {
    dispose()
    if (preference.matches || !Element.prototype.animate) return

    const animations = new Set()
    const cleanups = []
    const play = (element, frames, options = {}) => {
      const animation = element.animate(frames, {
        duration: 620,
        fill: 'backwards',
        easing: 'cubic-bezier(.2,.75,.25,1)',
        ...options,
      })
      animations.add(animation)
      animation.finished
        .catch(() => {})
        .finally(() => animations.delete(animation))
    }
    const entrance = [
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ]
    document
      .querySelectorAll('.hero-copy > *, .showcase')
      .forEach((element, index) => {
        if (
          element.getBoundingClientRect().top < innerHeight &&
          scrollY < 100
        ) {
          play(element, entrance, { delay: index * 65, duration: 760 })
        }
      })

    if ('IntersectionObserver' in window) {
      const selector =
        '.section-heading, .feature-item, .platform-card, .connection-flow > div, .feature-copy, .phone-stage, .faq-list details, .final-cta, .package-card, .release-overview, .runtime-section, .download-notes'
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            observer.unobserve(entry.target)
            if (entry.target.contains(document.activeElement)) continue
            const siblings = [...entry.target.parentElement.children].filter(
              (el) => el.matches(selector),
            )
            play(entry.target, entrance, {
              delay: Math.max(0, siblings.indexOf(entry.target)) * 65,
            })
          }
        },
        { threshold: 0.08 },
      )
      document
        .querySelectorAll(selector)
        .forEach((element) => observer.observe(element))
      cleanups.push(() => observer.disconnect())
    }

    document.querySelectorAll('.faq-list details').forEach((details) => {
      const reveal = () => {
        if (details.open)
          play(
            details.querySelector('p'),
            [
              { opacity: 0, transform: 'translateY(-6px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 220 },
          )
      }
      details.addEventListener('toggle', reveal)
      cleanups.push(() => details.removeEventListener('toggle', reveal))
    })

    const stage = document.querySelector('.showcase')
    const preview = stage?.querySelector('.product-window')
    if (preview && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let frame = 0
      const reset = () => {
        cancelAnimationFrame(frame)
        preview.style.removeProperty('--tilt-x')
        preview.style.removeProperty('--tilt-y')
      }
      const move = (event) => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          const bounds = stage.getBoundingClientRect()
          const x = Math.max(
            -0.5,
            Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5),
          )
          const y = Math.max(
            -0.5,
            Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5),
          )
          preview.style.setProperty('--tilt-x', `${-y * 4}deg`)
          preview.style.setProperty('--tilt-y', `${x * 4}deg`)
        })
      }
      stage.addEventListener('pointermove', move, { passive: true })
      stage.addEventListener('pointerleave', reset)
      cleanups.push(() => {
        reset()
        stage.removeEventListener('pointermove', move)
        stage.removeEventListener('pointerleave', reset)
      })
    }

    const revealFocused = () => {
      for (const animation of animations) {
        if (animation.effect?.target?.contains(document.activeElement))
          animation.cancel()
      }
    }
    document.addEventListener('focusin', revealFocused)
    dispose = () => {
      cleanups.forEach((cleanup) => cleanup())
      animations.forEach((animation) => animation.cancel())
      animations.clear()
      document.removeEventListener('focusin', revealFocused)
    }
  }

  onMounted(() => {
    preference = matchMedia('(prefers-reduced-motion: reduce)')
    configure()
    preference.addEventListener('change', configure)
  })
  onBeforeUnmount(() => {
    dispose()
    preference?.removeEventListener('change', configure)
  })
}
