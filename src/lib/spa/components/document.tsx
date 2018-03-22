import { get } from 'lodash'
import * as React from 'react'
import { ReadOnlyConfig } from '../../util'
import Body from './body'
import Favicons from './favicon'
import Head from './head'
export default ({ content }) => {
  const config = ReadOnlyConfig.config
  return (
    <html>
      <Head>
        {config && config.hasAnalytics() ? (
          <script>{`window.analytics = ${config.hasAnalytics()};`}</script>
        ) : (
          <></>
        )}
        {get(config, 'analytics.ga') ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                      ga('create', '${config.analytics.ga}', 'auto');`,
            }}
          />
        ) : (
          <></>
        )}
        <Favicons favicons={get(config, 'faviconFiles')} />
      </Head>
      <Body renderedContent={content}>
        <script src="/assets/bundle.js" />
      </Body>
    </html>
  )
}
