import { ChangeDetectorRef, Component } from '@angular/core'
import { Modal, ModalsService } from '../modals.service'

@Component({
  selector: 'bra-modals-container',
  templateUrl: './modals-container.component.html'
})
export class ModalsContainerComponent {
  constructor(private modalService: ModalsService, private ref: ChangeDetectorRef) {
    this.modalService.changes.subscribe({
      next: () => {
        console.log('modal changed', this.modalService.modals)
        this.ref.markForCheck()
      }
    })
  }

  buttonClass(buttonType: "warning" | "success" | "info" | "danger" | undefined): string {
    switch (buttonType) {
      case 'warning':
        return 'bg-yellow-600 text-gray-900 ring-yellow-700 hover:bg-yellow-500'

      case 'success':
        return 'bg-green-600 text-white ring-green-700 hover:bg-green-500'

      case 'info':
        return 'bg-blue-600 text-white ring-blue-700 hover:bg-blue-500'

      case 'danger':
        return 'bg-red-600 text-white ring-red-700 hover:bg-red-500'

      default:
        return 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
    }
  }

  get modals(): Modal[] {
    return this.modalService.modals
  }
}
