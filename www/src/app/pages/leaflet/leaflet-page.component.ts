import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { PDFDocumentProxy } from 'ng2-pdf-viewer'

@Component({
  selector: 'bra-leaflet-page',
  templateUrl: './leaflet-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-col flex-auto w-full px-8 py-2'
  },
  styleUrls: ['./leaflet-page.component.scss']
})
export class LeafletPageComponent implements OnInit, OnDestroy {
  _zoom: number = 1
  _currentPage: number = 1
  _pageCount: number = 0
  _loaded: boolean = false
  desktop = false

  onResize() {
    if (this.desktop && window.document.body.getBoundingClientRect().width < 1024) {
      this.desktop = false
      this.ref.markForCheck()
    } else if (!this.desktop && window.document.body.getBoundingClientRect().width >= 1024) {
      this.desktop = true
      this.ref.markForCheck()
    }
  }

  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    window.addEventListener('resize', evt => this.onResize())
    this.translate.onLangChange.subscribe(() => {
      this.ref.markForCheck()
    })

    this.onResize()

    document.onkeyup = ($event) => {
      switch ($event.key) {
        case 'ArrowLeft':
          if (this._loaded && this.previousEnabled) {
            this.previousPage()
          }
          break

        case 'ArrowRight':
          if (this._loaded && this.nextEnabled) {
            this.nextPage()
          }
          break

        case '+':
          if (this._loaded && this.zoomInEnabled) {
            this.setZoom(this.zoom + .5)
          }
          break

        case '-':
          if (this._loaded && this.zoomOutEnabled) {
            this.setZoom(this.zoom - .5)
          }
          break

        default:
          // console.log($event)
          break
      }
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', evt => this.onResize())
  }

  callBackFn(pdf: PDFDocumentProxy) {
    this._pageCount = pdf.numPages
    this._loaded = true
    this.ref.markForCheck()
  }

  nextPage() {
    this._currentPage++
    this.setZoom(1)
    this.ref.markForCheck()
  }

  previousPage() {
    this._currentPage--
    this.setZoom(1)
    this.ref.markForCheck()
  }

  setZoom(zoomLevel: number) {
    this._zoom = zoomLevel
    this.ref.markForCheck()
  }

  get pdfSettings(): any {
    if (this.desktop) {
      return {
        url: `https://pcm.groupclaes.be/v3/content/dis/website/leaflet/100/${this.culture}?size=large`,
        showAll: false
      }
    } else {
      return {
        url: `https://pcm.groupclaes.be/v3/content/dis/website/leaflet/100/${this.culture}?size=small`,
        showAll: true
      }
    }
  }

  get zoom(): number {
    return this._zoom
  }

  get currentPage(): number {
    return this._currentPage
  }

  get pageCount(): number {
    return this._pageCount
  }

  get loaded(): boolean {
    return this._loaded
  }

  get previousEnabled(): boolean {
    return this.currentPage > 1
  }

  get nextEnabled(): boolean {
    return this.currentPage < this.pageCount
  }

  get zoomOutEnabled(): boolean {
    return this.zoom > 1
  }

  get zoomInEnabled(): boolean {
    return this.zoom < 2
  }

  get culture(): string {
    return this.translate.currentLang
  }
}
