import { Directive, ElementRef } from '@angular/core'

@Directive({
  selector: '[magnifier]'
})
export class MagnifierDirective {
  img: HTMLImageElement
  glass?: HTMLDivElement
  w: number = 0
  h: number = 0
  bw = 3
  zoom = 4
  // .magnifier-glass
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    this.img = nativeElement

    this.img.onload = () => {
      // remove all preexisting magnifiers
      for (const element of document.getElementsByClassName('magnifier-glass')) {
        element.remove()
      }

      this.createMagnifier()

      this.img.onmouseleave = () => {
        if (this.glass)
          this.glass.style.display = 'none'
      }

      this.img.onmouseenter = () => {
        if (this.glass)
          this.glass.style.display = 'block'
      }
    }
  }

  createMagnifier() {
    /*create magnifier glass:*/
    this.glass = document.createElement("div")
    this.glass.setAttribute("class", "magnifier-glass")
    /*insert magnifier glass:*/
    this.img.parentElement?.insertBefore(this.glass, this.img)
    /*set background properties for the magnifier glass:*/
    this.glass.style.backgroundImage = "url('" + this.img.src + "')"
    this.glass.style.backgroundRepeat = "no-repeat"
    this.glass.style.backgroundSize = this.img.width * this.zoom + "px " + this.img.height * this.zoom + "px"
    this.w = this.glass.offsetWidth / 2
    this.h = this.glass.offsetHeight / 2
    /*execute a function when someone moves the magnifier glass over the image:*/
    this.glass.addEventListener("mousemove", this.moveMagnifier)
    this.img.addEventListener("mousemove", this.moveMagnifier)
    /*and also for touch screens:*/
    // this.glass.addEventListener("touchmove", this.moveMagnifier)
    // this.img.addEventListener("touchmove", this.moveMagnifier)
    this.glass.style.display = 'none'
  }

  getCursorPos(e: MouseEvent) {
    let a, x = 0, y = 0
    e = e
    /* get the x and y positions of the image: */
    a = this.img.getBoundingClientRect()
    /* calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left
    y = e.pageY - a.top
    /* consider any page scrolling: */
    x = x - window.scrollX
    y = y - window.scrollY
    return { x: x, y: y }
  }

  moveMagnifier(e: MouseEvent) {
    /* prevent any other actions that may occur when moving over the image */
    e.preventDefault()
    /* get the cursor's x and y positions: */
    const pos = this.getCursorPos(e)
    /* prevent the magnifier glass from being positioned outside the image: */
    if (pos.x > this.img.width - this.w / this.zoom) {
      pos.x = this.img.width - this.w / this.zoom
    }
    if (pos.x < this.w / this.zoom) {
      pos.x = this.w / this.zoom
    }
    if (pos.y > this.img.height - this.h / this.zoom) {
      pos.y = this.img.height - this.h / this.zoom
    }
    if (pos.y < this.h / this.zoom) {
      pos.y = this.h / this.zoom
    }
    /* set the position of the magnifier glass: */
    if (this.glass) {
      this.glass.style.left = pos.x - this.w + "px"
      this.glass.style.top = pos.y - this.h + "px"
      /* display what the magnifier glass "sees": */
      this.glass.style.backgroundPosition = "-" + (pos.x * this.zoom - this.w + this.bw) + "px -" + (pos.y * this.zoom - this.h + this.bw) + "px"
    }
  }
}
