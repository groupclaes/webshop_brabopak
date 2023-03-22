export interface IBaseApiResponse {
  error: string | null
  verified: boolean,
  result: any
}

export const trimParameters = (params: any): any => {
  for (const prop in params) {
    // ignore parameters that are set to null or are undefined
    if (params[prop] === undefined || params[prop] === null) {
      delete params[prop]
    }
    // If the parameter contains the keyword id but is set to 0, ignore the parameter
    if (prop.toLowerCase().indexOf('id') > -1 && params[prop] === 0) {
      delete params[prop]
    }
  }
  return params
}