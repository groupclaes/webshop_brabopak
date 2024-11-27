import { Directive, ElementRef } from '@angular/core'

@Directive({ selector: 'img' })
export class LazyImageDirective {
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype

    nativeElement.onload = (ev) => {
      // add widht and height to image
      nativeElement.setAttribute('width', nativeElement.width + '')
      nativeElement.setAttribute('height', nativeElement.height + '')
    }

    if (supports) {
      nativeElement.setAttribute('loading', 'lazy')
    }
  }
}