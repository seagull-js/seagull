export interface IEcommerceTracking {
  id: string // Transaction ID. Required.
  affiliation?: string // Affiliation or store name.
  revenue?: number // Grand Total.
  shipping?: number // Shipping.
  tax?: number // Tax.
}

export default (name: string, data?: IEcommerceTracking): void => {
  sendEvent(name)
  if (name === 'revenue' && data) {
    sendRevenueEventGA(name, data)
  }
}

function ga() {
  return typeof window !== 'undefined' ? ((window as any) || {}).ga : {}
}

function sendEvent(name: string): void {
  try {
    ga()('send', {
      eventAction: name,
      eventCategory: 'SeagullPirateMetrics',
      hitType: 'event',
    })
  } catch (error) {
    // tslint:disable-next-line
    console.warn('google analytics is blocked or disabled', error)
  }
}

function sendRevenueEventGA(name: string, data: IEcommerceTracking) {
  try {
    ga()('ecommerce:addTransaction', {
      affiliation: data.affiliation || '', // Affiliation or store name.
      id: data.id, // Transaction ID. Required.
      revenue: (data.revenue || 0).toString(), // Grand Total.
      shipping: (data.shipping || 0).toString(), // Shipping.
      tax: (data.tax || 0).toString(), // Tax.
    })
  } catch (error) {
    // tslint:disable-next-line
    console.warn('ga:ecommerce is blocked or disabled', error)
  }
}

export function pageViewGA(urlPath) {
  try {
    ga()('set', 'page', urlPath)
    ga()('send', 'pageview')
  } catch (error) {
    // tslint:disable-next-line
    console.warn('google analytics is blocked or disabled', error)
  }
}
