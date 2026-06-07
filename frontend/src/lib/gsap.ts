import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const gsapUtils = {
  animateIn(element: string | HTMLElement, delay: number = 0) {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay }
    );
  },

  staggerIn(elements: string | HTMLElement[], stagger: number = 0.15) {
    return gsap.fromTo(
      elements,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: stagger,
        ease: "power2.out",
      }
    );
  },

  animateCounter(element: string | HTMLElement, from: number, to: number, duration: number = 2) {
    const obj = { val: from };
    const el = typeof element === "string" ? document.querySelector(element) : element;
    
    if (!el) return;
    
    return gsap.to(obj, {
      val: to,
      duration: duration,
      ease: "power1.out",
      onUpdate: () => {
        el.textContent = Math.floor(obj.val).toLocaleString();
      },
    });
  },

  pulseGlow(element: string | HTMLElement) {
    return gsap.to(element, {
      boxShadow: "0 0 15px rgba(0, 212, 170, 0.4), 0 0 5px rgba(0, 212, 170, 0.2)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "sine.inOut",
    });
  },

  scanLineEffect(lineElement: HTMLElement, containerHeight: number) {
    return gsap.fromTo(
      lineElement,
      { y: 0 },
      {
        y: containerHeight,
        duration: 3,
        repeat: -1,
        ease: "none",
        yoyo: true,
      }
    );
  },

  dataFlowAnimation(dotElement: HTMLElement, pathElement: SVGPathElement) {
    const pathLen = pathElement.getTotalLength();
    gsap.set(dotElement, { opacity: 0 });
    
    return gsap.to(dotElement, {
      opacity: 1,
      duration: 0.1,
      onComplete: () => {
        gsap.to(dotElement, {
          duration: 2.5,
          repeat: -1,
          ease: "none",
          onUpdate: function () {
            const progress = this.progress();
            const point = pathElement.getPointAtLength(progress * pathLen);
            gsap.set(dotElement, { x: point.x, y: point.y });
          },
        });
      },
    });
  },
};

export { gsap, ScrollTrigger };
