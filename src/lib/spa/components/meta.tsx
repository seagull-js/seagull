import { cond, defaultTo, noop } from 'lodash'
import * as React from 'react'
import { Helmet } from 'react-helmet'

export interface IMeta {
  description?: string,
  language?: string,
  title: string,
  canonical?: string,
  url?:string,
  imageUrl?: string,
  // TODO
  schemaObject?: object,
  children?: any
}

export default (props:IMeta) => {
  const linkTags = []
  const metaTags: any[] = [
    { charSet: 'utf-8' }
  ]
  
  // link tags
  props.canonical   ? linkTags.push({ rel: 'canonical', href: props.canonical }) : noop()

  // meta tags
  props.title       ? metaTags.push({ itemprop: 'name', content: props.title }) : noop()
  props.description ? metaTags.push({ itemprop: 'description', content: props.description }) : noop()

  props.description ? metaTags.push({ name: 'description', content: props.description }) : noop()
  props.description ? metaTags.push({ name: 'description', content: props.description }) : noop()
  
  props.title       ? metaTags.push({ name: 'og:title', content: props.title }) : noop()
  props.url         ? metaTags.push({ name: 'og:url', content: props.url }) : noop()
  props.imageUrl    ? metaTags.push({ name: 'og:image', content: props.imageUrl}) : noop()
  props.description ? metaTags.push({ name: 'og:description', content: props.description }) : noop()
  props.title       ? metaTags.push({ name: 'og:site_name', content: props.title}) : noop()
  
  props.title       ? metaTags.push({ name: 'twitter:title', content: props.title }) : noop()
  props.description ? metaTags.push({ name: 'twitter:description', content: props.description }) : noop()
  props.imageUrl    ? metaTags.push({ name: 'twitter:image:src', content: props.imageUrl }) : noop()

  /* Todo
  { name: 'twitter:card', content: '' },
  { name: 'twitter:site', content: '' },
  { name: 'twitter:creator', content: '' },
  { name: 'og:type', content: '' },
  { name: 'fb:app_id', content: '' },
  */

  return (
    <Helmet
      title= { props.title }
      link={linkTags}
      meta={metaTags}
    > {props.children}
    </Helmet>
  )
}