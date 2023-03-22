import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'

@Component({
  selector: 'bra-flyout-navigation',
  templateUrl: './flyout-navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlyoutNavigationComponent {
  activeCategory: number = 0

  constructor(private ref: ChangeDetectorRef) { }

  isCategoryActive(id: number): boolean {
    return this.activeCategory === id
  }

  activateCategory(id: number): void {
    if (this.activeCategory !== id)
      this.activeCategory = id
    else this.activeCategory = 0
    this.ref.markForCheck()
  }

  get categories(): ICategory[] {
    return [
      {
        id: 1,
        name: 'Verpakking',
        children: [
          {
            id: 101,
            name: 'hihi'
          },
          {
            id: 102,
            name: 'haha'
          }
        ]
      },
      {
        id: 2,
        name: 'Bedrukking',
        children: [
          {
            id: 201,
            name: 'Gepersonaliseerde artikels',
            children: [
              {
                id: 20101,
                name: 'Alvo'
              },
              {
                id: 20102,
                name: 'Carrefour'
              },
              {
                id: 20103,
                name: 'Delhaize'
              },
              {
                id: 20104,
                name: 'Keurslager'
              }
            ]
          },
          {
            id: 202,
            name: 'Gepersonaliseerde etiketten',
            children: [
              {
                id: 20201,
                name: 'Vorm'
              }, {
                id: 20202,
                name: 'Papier'
              }, {
                id: 20203,
                name: 'Kleur'
              }
            ]
          }
        ]
      },
      {
        id: 3,
        name: 'Voeding',
        children: [
          {
            id: 301,
            name: 'Kruiden & Marinades',
            children: [
              {
                id: 30101,
                name: 'Bewaarmiddelen'
              }, {
                id: 30102,
                name: 'Droge kruiden'
              }, {
                id: 30103,
                name: 'Marinades'
              }
            ]
          }
        ]
      },
      {
        id: 4,
        name: 'Onderhoud',
        children: [
          {
            id: 401,
            name: 'Messen en keukengerei',
            children: [
              {
                id: 40101,
                name: 'BBQ & grill'
              }, {
                id: 40102,
                name: 'Messen'
              }, {
                id: 40103,
                name: 'Zagen'
              }
            ]
          },
          {
            id: 402,
            name: 'Producten & materialen',
            children: [
              {
                id: 40201,
                name: 'Onderhouds materialen'
              }, {
                id: 40202,
                name: 'DebStoko® Handhygiëne'
              }, {
                id: 40203,
                name: 'Onderhouds producten'
              }, {
                id: 40204,
                name: 'CareSave producten'
              }, {
                id: 40205,
                name: 'Vikan'
              }
            ]
          }
        ]
      }
    ]
  }
}

export interface ICategory {
  id: number
  name: string
  children?: ICategory[]
}
