import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(
    private title: Title,
    private meta: Meta
  ) { }

  apply(title: string, description?: string, keywords?: string, image?: string) {
    this.title.setTitle(title)
    this.meta.updateTag({ property: 'og:title', content: title })

    if (description) {
      this.meta.updateTag({ name: 'description', content: description })
      this.meta.updateTag({ property: 'og:description', content: description })
    }

    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords })
    }

    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image })
    }
  }
}
