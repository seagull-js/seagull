import Request from './request'

export interface IRoute {
  path: string
}

export interface IBackendRoute extends IRoute {
  method: 'GET' | 'POST'
  handler: (Request) => Promise<any>
}

export interface IFrontendRoute extends IRoute {
  component: string
}

export type Plugin = (Request) => Promise<Request>

export default class App {
  backend: IBackendRoute[] = []
  frontend: IFrontendRoute[] = []
  plugins: Plugin[] = []

  // the name is actually important to deploy the whole thing later
  constructor(public name: string) {
    // do stuff
  }

  // register a GET handler (server side only)
  get(path: string, handler: (req: Request) => Promise<any>): App {
    this.backend.push({ method: 'GET', path, handler })
    return this
  }

  // register a POST handler (server side only)
  post(path: string, handler: (req: Request) => Promise<any>): App {
    this.backend.push({ method: 'POST', path, handler })
    return this
  }

  // register a frontend route (with component to render)
  view(path: string, component: any): App {
    this.frontend.push({ path, component })
    return this
  }

  // forward an incoming request to the correct handler
  dispatch(url: string, data: any) {
    return
  }
}
