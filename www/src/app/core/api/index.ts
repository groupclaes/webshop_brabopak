export interface IBaseApiResponse {
  status: 'error' | 'success' | 'fail'
  code?: number
  message?: string
  data?: any
  executionTime?: number
}

// status is always advised
// if status is success or fail, data is required
// if status is error message is required

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