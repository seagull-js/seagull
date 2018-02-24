import { history } from '../../util'
import trackGA, { IEcommerceTracking, pageViewGA } from './ga'
import UUID from './uuid'

/**
 * stringly typed stages of the PIRATE METRICS!
 */
export type pirateEvent =
  | 'acquisition'
  | 'activation'
  | 'retention'
  | 'referral'
  | 'revenue'

/**
 * Convenience interface for easy tracking of user interactions.
 * Important: a user is "just" an anonymous UUID, no personal data.
 */
export default class Tracking {
  /**
   * directly track a revenue event
   *
   * @param data optional payload
   */
  static trackReferral(name: string): void {
    const tracking = new Tracking()
    tracking.sendEvent('referral', { name })
  }

  /**
   * directly track a revenue event
   *
   * @param data optional payload
   */
  static trackRevenue(data?: IEcommerceTracking): void {
    const tracking = new Tracking()
    tracking.sendEvent('revenue', data)
  }

  /**
   * logic for creating/storing/retrieving uuids in localstorage
   */
  private uuid: UUID

  /**
   * toggled to true after first manual url change (aka: click)
   */
  private isActivated: boolean = false

  constructor() {
    this.uuid = new UUID()
    if (this.isBrowser() && this.isEnabled()) {
      this.ensureSession()
      this.listenToClicks()
    }
  }

  /**
   * accessor to the actual uuid
   */
  get id(): string {
    return this.uuid.value
  }

  /**
   * check if currently in browser or not. do not track without checking this.
   */
  isBrowser(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.document &&
      window.document.createElement
    )
  }

  /**
   * check if tracking is enabled via window-global variable 'analytics'
   */
  isEnabled(): boolean {
    return this.isBrowser() && !!(window as any).analytics
  }

  /**
   * track pageviews via history change events
   */
  private listenToClicks(): void {
    history.listen((location, action) => {
      if (!this.isActivated) {
        this.sendEvent('activation')
        this.isActivated = true
      }
      this.sendPageView(location.pathname)
    })
  }

  /**
   * load existing uuid from localstorage or create a new one and save it
   */
  private ensureSession() {
    this.uuid.load()
    if (this.uuid.value) {
      this.sendEvent('retention')
    } else {
      this.uuid.create()
      this.uuid.save()
      this.sendEvent('acquisition')
    }
  }

  /**
   * send pageView event to ga and the backend
   *
   * @param value url path to track (not absolute url)
   */
  private sendPageView(value: string): void {
    const data = { uuid: this.id, name: 'pageView', value }
    this.post('/track', data)
    pageViewGA(value)
  }

  /**
   *  send pirate metric event
   *
   * @param name exact name for the pirate metric stage, eg.: 'retention'
   * @param data optional data to send, will finally include the uuid
   */
  private sendEvent(name: pirateEvent, data?: any): void {
    trackGA(name, data)
    const fullData: any = data || {}
    fullData.uuid = this.id
    this.post('/track', fullData) // DO NOT WAIT
  }

  /**
   * wrap native fetch POST api
   *
   * @param path relative path to send data to
   * @param data payload, gets stringified automatically
   */
  private async post(path: string, data: any) {
    return fetch('path', {
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  }
}
