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
  zoom = 2.5
  // .magnifier-glass
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    this.img = nativeElement

    this.img.onload = () => {
      // remove all preexisting magnifiers
      const elems = document.getElementsByClassName('magnifier-glass')
      for (let i = 0; i < elems.length; i++) {
        elems[i].remove()
      }

      const moveMagnifier = (e: any) => {
        var pos, x, y
        /*prevent any other actions that may occur when moving over the image*/
        e.preventDefault()
        /*get the cursor's x and y positions:*/
        pos = getCursorPos(e)
        x = pos.x
        y = pos.y
        /*prevent the magnifier glass from being positioned outside the image:*/
        if (x > this.img.width - this.w / this.zoom) {
          x = this.img.width - this.w / this.zoom
        }
        if (x < this.w / this.zoom) {
          x = this.w / this.zoom
        }
        if (y > this.img.height - this.h / this.zoom) {
          y = this.img.height - this.h / this.zoom
        }
        if (y < this.h / this.zoom) {
          y = this.h / this.zoom
        }
        /*set the position of the magnifier glass:*/
        if (this.glass) {
          this.glass.style.left = x - this.w + "px"
          this.glass.style.top = y - this.h + "px"
          /*display what the magnifier glass "sees":*/
          this.glass.style.backgroundPosition = "-" + (x * this.zoom - this.w + this.bw) + "px -" + (y * this.zoom - this.h + this.bw) + "px"
        }
      }

      const getCursorPos = (e: any) => {
        var a, x = 0, y = 0
        e = e || window.event
        /*get the x and y positions of the image:*/
        a = this.img.getBoundingClientRect()
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left
        y = e.pageY - a.top
        /*consider any page scrolling:*/
        x = x - window.scrollX
        y = y - window.scrollY
        return { x: x, y: y }
      }

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
      this.glass.addEventListener("mousemove", moveMagnifier)
      this.img.addEventListener("mousemove", moveMagnifier)
      /*and also for touch screens:*/
      this.glass.addEventListener("touchmove", moveMagnifier)
      this.img.addEventListener("touchmove", moveMagnifier)

      this.glass.style.display = 'none'

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
}
