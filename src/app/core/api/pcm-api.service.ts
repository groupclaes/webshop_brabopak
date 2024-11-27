import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { IBaseApiResponse, trimParameters } from '.'

@Injectable({
  providedIn: 'root'
})
export class PcmApiService {
  constructor(
    private http: HttpClient
  ) { }

  get urls() {
    return {
      file: (uuid: string) => `${environment.pcm}webshop/file/${uuid}`,
      datasheet: (itemNum: string, culture: string) => `${environment.pcm}webshop/file/datasheet/${itemNum}/${culture}`,
      images: (itemNum: string, culture: string) => `${environment.pcm}webshop/list/images/${itemNum}/${culture}`,
      objects: (itemNum: string) => `${environment.pcm}webshop/list/objects/${itemNum}`,
      documents: (type: string) => `${environment.pcm}webshop/list/documents/${type}`,
    }
  }

  getObjectList(itemNum: string): Promise<IBaseApiResponse> {
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.objects(itemNum)))
  }

  getProductImagesList(itemNum: string, language: string): Promise<IBaseApiResponse> {
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.images(itemNum, language)))
  }

  getRecipes(): Promise<IBaseApiResponse> {
    return firstValueFrom(this.http.get<IBaseApiResponse>(this.urls.documents('recept')))
  }

  checkDatasheetHead(itemNum: string, culture: string): Promise<any> {
    const params = trimParameters({
      retry: false
    })

    return firstValueFrom(this.http.head(this.urls.datasheet(itemNum, culture), { params }))
  }
}

export interface PcmObjectListItem {
  name: string
  objectType: string
  documentType: string
  extension: string
  size: string
  languages: string[]
  downloadUrl: string
}