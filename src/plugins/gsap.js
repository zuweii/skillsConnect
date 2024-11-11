import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  install: (app) => {
    app.config.globalProperties.$gsap = gsap
    app.config.globalProperties.$ScrollTrigger = ScrollTrigger
  }
}