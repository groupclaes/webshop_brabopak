import { Component, ChangeDetectionStrategy } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'bra-home-page',
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class HomePageComponent {
  constructor(
    private auth: AuthService
  ) {
    this.auth.change.subscribe({
      next: (token) => {
        console.log(token)
        if (token) {
          console.log(this.auth.id_token)
        }
      }
    })
    console.log(this.auth.id_token)
  }

  get dashboard(): any {
    return {
      "news": [
        {
          "id": 82451,
          "title": {
            "nl": "Unieke actie",
            "fr": "Unieke actie"
          },
          "url": "//pcm.groupclaes.be/v3/content/dis/website/news-image/82451",
          "promo": true
        }
      ],
      "spotlight": [
        {
          "id": 19581,
          "name": "PP WOVEN DRAAGTAS zwart 420x350+190mm",
          "unit": "Krt 125st",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1501211600?s=thumb_l",
          "price": 180.38
        },
        {
          "id": 3429,
          "name": "TORK NAPKIN FOR DISP N4-10840 IFOLD",
          "unit": "Krt 9000st",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1401021589?s=thumb_l",
          "price": 121.68
        },
        {
          "id": 20852,
          "name": "SNIJDBARE NACHO CHEESESAUS 6x250ml Verstegen Classic",
          "unit": "Tray 6st",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1221439129?s=thumb_l",
          "price": 24.96
        },
        {
          "id": 20927,
          "name": "BRAADPANEER KROKANT Qualité d'Or",
          "unit": "Zak 5kg",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1241022085?s=thumb_l",
          "price": 44.25
        }
      ],
      "recent": [
        {
          "id": 326,
          "name": "RAPIDE PANEERMEEL WIENER Raps 21385",
          "unit": "Zak 20kg",
          "color": "9a845a",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1161021341?s=thumb_l",
          "price": 123.2
        },
        {
          "id": 1302,
          "name": "MINI VOOR MOSSELEN 80g Verstegen",
          "unit": "Tray 6st",
          "color": "ca8884",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1221012381?s=thumb_l",
          "price": 16.76
        },
        {
          "id": 2160,
          "name": "CORBUDMIX Claes",
          "unit": "Zak 5kg",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1241089020?s=thumb_l",
          "price": 43.83
        },
        {
          "id": 2269,
          "name": "MOUTARDINI Claes",
          "unit": "Emm 5kg",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1241233520?s=thumb_l",
          "price": 26.9
        }
      ],
      "bestSelling": [
        {
          "id": 460,
          "name": "VEKA STABIL ZZ Raps 01293",
          "unit": "Zak 1kg",
          "color": "e7e8eb",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1161044690?s=thumb_l",
          "price": 7.55
        },
        {
          "id": 2227,
          "name": "PREPARE MAISON M Claes",
          "unit": "Emm 10kg",
          "color": "fb9c32",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1241231620?s=thumb_l",
          "price": 51.31
        },
        {
          "id": 3088,
          "name": "SCHAPENDARM 24/26 AB Hardtube 2275m overlapt (H)",
          "unit": "E2bak",
          "color": "a46d61",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1361029314?s=thumb_l",
          "price": 709.5
        },
        {
          "id": 5092,
          "name": "FRESH FOLIE 45cm x 300m Refill DEHA vrij - F&E",
          "unit": "Krt 3st",
          "color": "a9a1a3",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1501311017?s=thumb_l",
          "price": 27.14
        }
      ],
      "favorites": [
        {
          "id": 159,
          "name": "SPAGHETTIKRUIDEN Van Hees - Vantasia",
          "unit": "Zak 1kg",
          "color": "9e7245",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1141023389?s=thumb_l",
          "price": 16.67
        },
        {
          "id": 223,
          "name": "PAPRIKA EMULSION Van Hees - Aromix",
          "unit": "Bus 1kg",
          "color": "980b04",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1141229600?s=thumb_l",
          "price": 17.84
        },
        {
          "id": 321,
          "name": "RAPIDE PANEERMEEL GEKRUID Raps 21382",
          "unit": "Emm 3kg",
          "color": "ba7140",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1161021140?s=thumb_l",
          "price": 20.03
        },
        {
          "id": 326,
          "name": "RAPIDE PANEERMEEL WIENER Raps 21385",
          "unit": "Zak 20kg",
          "color": "9a845a",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1161021341?s=thumb_l",
          "price": 123.2
        }
      ],
      "newP": [
        {
          "id": 20933,
          "name": "MOSTERDVINAIGRETTE Claes",
          "unit": "Bus 2,3kg",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1241259300?s=thumb_l",
          "price": 14.96
        },
        {
          "id": 20935,
          "name": "STICKER WARNING UNIVERSEEL 70x45mm Labelfresh",
          "unit": "Krt 500st",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1641499475?s=thumb_l",
          "price": 9.31
        },
        {
          "id": 20960,
          "name": "SNIJPLANK 595x395mm blauw h20mm hard (Multilene)",
          "unit": "Stuk",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1662819595?s=thumb_l",
          "price": 112.75
        },
        {
          "id": 21021,
          "name": "KARTON/PE CUP 240ml bruin d99xh60mm",
          "unit": "Krt 500st",
          "color": "FFFFFF",
          "url": "//pcm.groupclaes.be/v3/product-images/dis/1500861325?s=thumb_l",
          "price": 32.03
        }
      ]
    }
  }

  get name(): string | undefined {
    return this.auth.id_token?.given_name
  }

  get abandonedCart(): { count: number } | undefined {
    return {
      count: 4
    }
  }
}
