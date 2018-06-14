import { flow, isString, merge, noop } from 'lodash'
import * as React from 'react'
import Helmet from 'react-helmet'
import { App, Registry } from '../'

/**
 * Props for creating internal links via the [[Link]] method.
 */
export interface ILinkProps {
  /** the visual part of the link, either a string or a react component */
  children: React.ReactNode
  /** the name of the class of the target [[Page]]. Really. */
  pageName: string
  /** optionally set some path- or query parameters */
  params?: { [name: string]: number | string }
}

/**
 * Props for the [[Page]] constructor, representing a routing state. They will
 * get filled in from the React renderer and can be manipulated when
 * instancing a [[Page]] class directly in unit tests.
 */
export interface IPageProps {
  /** the base url of the app, in case the app is not mounted to '/' */
  baseUrl: string
  /** optional parameters from the URL, contains path *and* and query params */
  params: { [name: string]: string }
  /** the path where the page is rendered on, without query params */
  path: string
  stores?: { [storeName: string]: any }
}

/**
 * A highly convenient React component that contains all bells and whistles
 * to represent a complete HTML site. You have to define a [[path]] where the
 * [[Page]] will be rendered on and a [[html]] method rendering some HTML, the
 * other things are strictly optional. Example:
 *
 * ```typescript
 * import { MetaData, Page } from '@seagull/framework'
 * import * as React from 'react'
 *
 * export default class GreetPage extends Page {
 *   path = '/greet/:name'
 *   title: MetaData<GreetPage> = page => `<h1>Greetings, ${this.props.params.name}`
 *   html () {
 *     return <h1>Greetings, {this.props.params.name}</h1>
 *   }
 * }
 * ```
 */
export abstract class Page<S = {}> extends React.Component<IPageProps, S> {
  /**
   * This method is only used internally to register the page to the internal
   * router. Do not use this method in your code.
   */
  static register<T extends Page>(this: { new (): T }, app: App): App {
    Page.app = app
    const instance = new this()
    const name = instance.constructor.name
    const path = instance.path
    const action = (ctx: any) => <this {...generateProps(ctx)} />
    const route = { action, name, path }
    app.entities.routes.push(route)
    return app
  }

  /**
   * reference to the global app instance, used for communication across pages
   */
  private static app: App

  /**
   * Define this property to decide where the page will be rendered on. You can
   * have simple paths like `'/todos'` or more complex paths with path
   * parameters like `'/todos/:id'`. Path parameters, if given, will be passed
   * in through [[IPageProps]] and you can use it like `this.props.params.id`.
   */
  abstract path: string

  /**
   * If you want to set the `<title />` in the head of the HTML website, set
   * this property to the desired string. If you optimize for SEO, the length
   * of the title string must not exceed 65 characters and should contain the
   * exact same textual content as  the `<h1 />` tag within the page body.
   * If you need dynamic data for the string, you can also pass in a callback
   * function. Example code:
   *
   * ```typescript
   * // static:
   * title = 'my site title'
   * // dynamic:
   * title = () => `my site with id: ${this.props.params.id}`
   * ```
   */
  title: string | (() => string) = ''

  /**
   * If you want to set the `<meta name="description" />` in the head of the
   * HTML website, set this property to the desired string.
   * If you optimize for SEO, the length of the description string must not
   * exceed 160 characters.
   * If you need dynamic data for the string, you can also pass in a callback
   * function. Example code:
   *
   * ```typescript
   * // static:
   * description = 'my site description'
   * // dynamic:
   * description = () => `my site with id: ${this.props.params.id}`
   * ```
   */
  description: string | (() => string) = ''

  /**
   * If you want to set proper image meta tags for social media in the head of
   * the HTML website, set this property to the desired string.
   * If you need dynamic data for the string, you can also pass in a callback
   * function. Example code:
   *
   * ```typescript
   * // static:
   * image = '/path/to/image.jpg'
   * // dynamic:
   * image = () => `/path/to/{this.props.params.image}.jpg`
   * ```
   */
  image: string | (() => string) = ''

  /**
   * This is the "robots" meta tag and defaults to 'index, follow'. CHange it if
   * you want to control the indexation of your pages from search engines.
   * Example code:
   *
   * ```typescript
   * // static:
   * robots = 'index,follow'
   * // dynamic:
   * robots = () => `index, {this.props.params.follow ? 'follow' : 'nofollow'}.jpg`
   * ```
   */
  robots: string | (() => string) = 'index,follow'

  /**
   * This is the 'canonical' meta tag, pointing to the origin of a page. Use it
   * to transfer SEO value to another page or to cut out query parameters for
   * your [[Page]]. Defaults to `this.props.path`.
   * Example code:
   *
   * ```typescript
   * // static:
   * canonical = '/some/path'
   * // dynamic:
   * canonical = () => this.props.path
   * ```
   */
  canonical: string | (() => string) = () => this.props.path

  /**
   * Generate a link (`<a href />`) tag to a page with a given name. Use this
   * whenever possible for internal links, since it will render a proper tag
   * but intercepts click events to manipulate the browser history API for
   * instant page switches.
   * Example:
   *
   * ```typescript
   * <this.Link pageName="YourPage">label text</this.Link>
   * ```
   */
  Link({ children, pageName, params }: ILinkProps) {
    const app = Page.app
    const url = app!.url(pageName, params)
    const navigate = () => app.history.push({ pathname: url })
    const handler = ((e: any) => e.preventDefault() || navigate()).bind(this)
    return (
      <a href={url} onClick={handler}>
        {children}
      </a>
    )
  }

  /**
   * Implement this method for your actual page content instead of the typical
   * [[render]] method in react. Seagull *will* call [[render]] under the hood
   * but with additional bells and whistles attached.
   */
  abstract html(): JSX.Element

  /**
   * DO NOT IMPLEMENT THIS IN YOUR CODE. Use the [[html]] method instead.
   */
  render() {
    const base = this.html.bind(this)
    const wrappers = Page.app.entities.stores.map((s: any) => s.provide)
    const HTML = flow([...wrappers])(base)
    // const HTML = this.html.bind(this)

    const prop = (p: any): string => (isString(p) ? p : p.bind(this)())
    const title = prop(this.title) || this.constructor.name
    const description = prop(this.description) || ''
    const image = prop(this.image) || ''
    const link = prop(this.canonical) || this.props.path
    return (
      <>
        <Helmet>
          {/* general meta tags */}
          <meta charSet="utf-8" />
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
          />

          {/* social media classification tags */}
          <meta name="twitter:card" content="summary" />
          <meta name="og:type" content="website" />

          {/* title meta tags */}
          <title>{title}</title>
          <meta name="twitter:title" content={title} />
          <meta name="og:title" content={title} />

          {/* description meta tags */}
          <meta name="description" content={description} />
          <meta name="og:description" content={description} />
          <meta name="twitter:description" content={description} />

          {/* image meta tags */}
          <meta name="og:image" content={image} />
          <meta name="twitter:image" content={image} />

          {/* URL meta tags */}
          <meta name="og:url" content={link} />
          <meta name="twitter:url" content={link} />
          <link rel="canonical" href={link} />
        </Helmet>
        <HTML />
      </>
    )
  }
}

function generateProps(ctx: any) {
  const baseUrl = ctx.baseUrl
  const params = merge({}, ctx.params, ctx.query)
  const path = ctx.path
  return { baseUrl, params, path, stores: Registry.stores }
}
