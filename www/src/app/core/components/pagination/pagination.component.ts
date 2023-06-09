import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { SearchService } from 'src/app/@shared/layout/buttons/search/search.service'

@Component({
  selector: 'bra-pagination',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'
  }
})
export class PaginationComponent {
  @Input() count: number = 0

  constructor(public service: SearchService) {
    setTimeout(() => {
      console.debug(this.pages)
    }, 2000)
  }

  isCurrentPage(page: number): boolean {
    return this.service.page === page - 1 || (page === 1 && !this.service.page)
  }

  get results_info(): { min: number, max: number, total: number } {
    let min = 1

    if (this.service.page) {
      min = this.service.page * this.service.items + 1
    }
    let max = min + this.service.items - 1
    return {
      min,
      max: max > this.count ? this.count : max,
      total: this.count
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.service.page_count }, (_, i) => i + 1)
  }
}
