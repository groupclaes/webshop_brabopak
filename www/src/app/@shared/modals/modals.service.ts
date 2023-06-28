import { EventEmitter, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ModalsService {
  _modals: Modal[] = []

  changes: EventEmitter<void> = new EventEmitter()

  constructor() { }

  async show(modal: Modal): Promise<any> {
    modal.close.subscribe({
      next: () => {
        // remove modal from modals array
        this._modals.splice(this._modals.indexOf(modal), 1)
        this.changes.emit()
      }
    })
    this.modals.push(modal)
    this.changes.emit()

    const result = await firstValueFrom(modal.close)
    return result
  }

  get modals(): Modal[] {
    return this._modals
  }
}

export type ModalTemplateType = 'alert' | 'error' | 'info' | 'success' | 'warning'
export type ModalButtonColorType = 'warning' | 'success' | 'info' | 'danger'

export class Modal {
  private _template: ModalTemplateType
  private _title: string
  private _message: string
  private _buttons: IModalButton[]

  close: EventEmitter<any> = new EventEmitter()

  constructor(template: ModalTemplateType, title: string, message: string, buttons?: IModalButton[]) {
    this._template = template
    this._title = title
    this._message = message
    this._buttons = buttons ?? []
  }

  click(button: IModalButton) {
    if (button.type === 'abort') {
      this.close.emit(undefined)
    }

    if (button.action) {
      button.action()
    }

    this.close.emit(true)
  }

  get template(): ModalTemplateType {
    return this._template
  }

  get title(): string {
    return this._title
  }

  get message(): string {
    return this._message
  }

  get buttons(): IModalButton[] {
    return this._buttons
  }
}

export interface IModalButton {
  title: string
  type?: 'abort',
  color?: ModalButtonColorType
  action?: Function
}