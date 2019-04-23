import { isString } from 'lodash'
import * as React from 'react'
import { hydrate } from 'react-dom'
import { getStyles, setStylesTarget } from 'typestyle'
import { getTray, TTray, TTrayItem } from './bodytray'
import { Helmet } from './helmet'

export type PageType = { new (...args: any[]): Page }

/**
 * Props for the [[Page]] constructor, representing a routing state. They will
 * get filled in from the React renderer and can be manipulated when
 * instancing a [[Page]] class directly in unit tests.
 */
export interface IPageProps {
  data: any
}

/**
 * A highly convenient React component that contains all bells and whistles
 * to represent a complete HTML site. You have to define a [[path]] where the
 * [[Page]] will be rendered on and a [[html]] method rendering some HTML, the
 * other things are strictly optional. Example:
 *
 * ```typescript
 import { MetaData, Page } from '@seagull/framework'
 import * as React from 'react'

 export default class GreetPage extends Page {
   title: MetaData<GreetPage> = page => `<h1>Greetings, ${this.props.params.name}`
   html () {
     return <h1>Greetings, {this.props.params.name}</h1>
   }
 }
 ```
 */
export abstract class Page<P = {}, S = {}> extends React.Component<
  P & IPageProps,
  S
> {
  /**
   * setup the current page in the browser
   */
  static bootstrap() {
    const CurrentPage = (window as any).Page.default
    const data = (window as any).__initial_state__
    hydrate(<CurrentPage data={data} />, document.querySelector('#app'))
    setStylesTarget(document.getElementById('styles-target')!)
  }

  /**
   * This method returns the styles of the typestyle library by default. It can be overwritten if another css source will be used.
   */
  static getStyles(): string {
    return getStyles()
  }

  static getTray(tray: TTray): TTrayItem {
    return getTray(tray)
  }

  /**
   * get the used helmet instance for SSR
   */
  static helmetInstance() {
    return Helmet
  }

  /**
   * If you want to set the `<title />` in the head of the HTML website, set
   * this property to the desired string. If you optimize for SEO, the length
   * of the title string must not exceed 65 characters and should contain the
   * exact same textual content as  the `<h1 />` tag within the page body.
   * If you need dynamic data for the string, you can also pass in a callback
   * function. Example code:
   *
   * ```typescript
   // static:
   title = 'my site title'
   // dynamic:
   title = () => `my site with id: ${this.props.params.id}`
   ```
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
   // static:
   description = 'my site description'
   // dynamic:
   description = () => `my site with id: ${this.props.params.id}`
   ```
   */
  description: string | (() => string) = ''

  /**
   * If you want to set proper image meta tags for social media in the head of
   * the HTML website, set this property to the desired string.
   * If you need dynamic data for the string, you can also pass in a callback
   * function. Example code:
   *
   * ```typescript
   // static:
   image = '/path/to/image.jpg'
   // dynamic:
   image = () => `/path/to/{this.props.params.image}.jpg`
   ```
   */
  image: string | (() => string) = ''

  /**
   * This is the "robots" meta tag and defaults to 'index, follow'. CHange it if
   * you want to control the indexation of your pages from search engines.
   * Example code:
   *
   * ```typescript
   // static:
   robots = 'index,follow'
   // dynamic:
   robots = () => `index, {this.props.params.follow ? 'follow' : 'nofollow'}.jpg`
   ```
   */
  robots: string | (() => string) = 'index,follow'

  /**
   * This is the 'canonical' meta tag, pointing to the origin of a page. Use it
   * to transfer SEO value to another page or to cut out query parameters for
   * your [[Page]]. Defaults to `this.props.path`.
   * Example code:
   *
   * ```typescript
   // static:
   canonical = '/some/path'
   // dynamic:
   canonical = () => this.props.path
   ```
   */
  canonical: string | (() => string) = ''

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
    const html = this.html.bind(this)
    const rendered = html()

    const prop = (p: any): string => (isString(p) ? p : p.bind(this)())
    const title = prop(this.title) || this.constructor.name
    const description = prop(this.description) || ''
    const image = prop(this.image) || ''
    const link = prop(this.canonical) || ''
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
        {rendered}
      </>
    )
  }
}
