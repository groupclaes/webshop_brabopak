import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'

@Component({
  selector: 'claes-fullscreen',
  templateUrl: './fullscreen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenComponent {
  constructor(
    private ref: ChangeDetectorRef
  ) { }

  enterFullscreen(): void {
    const element: any = document.documentElement

    if (!this.isFullScreen) {
      if (element.requestFullscreen)
        element.requestFullscreen({ navigationUI: 'show' })
      else if (element.webkitRequestFullScreen)
        element.webkitRequestFullScreen({ navigationUI: 'show' })
    } else {
      if (document.exitFullscreen)
        document.exitFullscreen()
      else if ((document as any)['webkitExitFullscreen'])
        (document as any)['webkitExitFullscreen']()
      else if ((document as any)['mozCancelFullScreen'])
        (document as any)['mozCancelFullScreen']()
      else if ((document as any)['msExitFullscreen'])
        (document as any)['msExitFullscreen']()
    }

    setTimeout(() => {
      this.ref.markForCheck()
    }, 16)
  }

  get isFullScreen(): boolean {
    return (document.fullscreenElement && document.fullscreenElement !== null) ||
      ((document as any)['webkitFullscreenElement'] && (document as any)['webkitFullscreenElement'] !== null) ||
      ((document as any)['mozFullScreenElement'] && (document as any)['mozFullScreenElement'] !== null) ||
      ((document as any)['msFullscreenElement'] && (document as any)['msFullscreenElement'] !== null)
  }
}
