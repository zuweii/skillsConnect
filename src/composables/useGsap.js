import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useGsap = () => {
  return {
    gsap,
    ScrollTrigger
  }
}