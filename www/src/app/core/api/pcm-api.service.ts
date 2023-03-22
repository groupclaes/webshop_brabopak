import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'
import { trimParameters } from '.'

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
      datasheet: (itemNum: number, culture: string) => `${environment.pcm}webshop/file/datasheet/${itemNum}/${culture}`,
      images: (itemNum: number, culture: string) => `${environment.pcm}webshop/list/images/${itemNum}/${culture}`,
      objects: (itemNum: number) => `${environment.pcm}webshop/list/objects/${itemNum}`,
      documents: (type: string) => `${environment.pcm}webshop/list/documents/${type}`,
    }
  }

  getObjectList(itemNum: number): Promise<PcmApiObjectListResult> {
    return firstValueFrom(this.http.get<PcmApiObjectListResult>(this.urls.objects(itemNum)))
  }

  getProductImagesList(itemNum: number, language: string): Promise<PcmApiResult> {
    return firstValueFrom(this.http.get<PcmApiResult>(this.urls.images(itemNum, language)))
  }

  getRecipes(): Promise<PcmApiResult> {
    return firstValueFrom(this.http.get<PcmApiResult>(this.urls.documents('recept')))
  }

  checkDatasheetHead(itemNum: number, culture: string): Promise<any> {
    const params = trimParameters({
      retry: false
    })

    return firstValueFrom(this.http.head(this.urls.datasheet(itemNum, culture), { params }))
  }
}

export interface PcmApiResult {
  results: any[],
  executionTime: number,
  serverTime: Date
}

export interface PcmApiObjectListResult extends PcmApiResult {
  results: PcmObjectListItem[]
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