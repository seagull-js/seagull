import * as React from 'react'

export interface IFavicons {
  // only used for MS WebApp-Tiles
  backgroundColor?: string,
  favicons: string[]
}

export default ({ favicons=[],  backgroundColor = '#FFFFFF' }:IFavicons) => {
  return (
    <>
      {favicons.indexOf('apple-touch-icon-57x57.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='57x57' href='/assets/favicons/apple-touch-icon-57x57.png' />}
      {favicons.indexOf('apple-touch-icon-114x114.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='114x114' href='/assets/favicons/apple-touch-icon-114x114.png' />}
      {favicons.indexOf('apple-touch-icon-72x72.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='72x72' href='/assets/favicons/apple-touch-icon-72x72.png' />}
      {favicons.indexOf('apple-touch-icon-144x144.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='144x144' href='/assets/favicons/apple-touch-icon-144x144.png' />}
      {favicons.indexOf('apple-touch-icon-60x60.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='60x60' href='/assets/favicons/apple-touch-icon-60x60.png' />}
      {favicons.indexOf('apple-touch-icon-120x120.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='120x120' href='/assets/favicons/apple-touch-icon-120x120.png' />}
      {favicons.indexOf('apple-touch-icon-76x76.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='76x76' href='/assets/favicons/apple-touch-icon-76x76.png' />}
      {favicons.indexOf('apple-touch-icon-152x152.png') > -1 && <link rel='apple-touch-icon-precomposed' sizes='152x152' href='/assets/favicons/apple-touch-icon-152x152.png' />}
      {favicons.indexOf('favicon-196x196.png') > -1 && <link rel='icon' type='image/png' href='/assets/favicons/favicon-196x196.png' sizes='196x196' />}
      {favicons.indexOf('favicon-96x96.png') > -1 && <link rel='icon' type='image/png' href='/assets/favicons/favicon-96x96.png' sizes='96x96' />}
      {favicons.indexOf('favicon-32x32.png') > -1 && <link rel='icon' type='image/png' href='/assets/favicons/favicon-32x32.png' sizes='32x32' />}
      {favicons.indexOf('favicon-16x16.png') > -1 && <link rel='icon' type='image/png' href='/assets/favicons/favicon-16x16.png' sizes='16x16' />}
      {favicons.indexOf('favicon-128.png') > -1 && <link rel='icon' type='image/png' href='/assets/favicons/favicon-128.png' sizes='128x128' />}
      {favicons.indexOf('mstile-144x144.png') > -1 && <meta name='application-name' content='&nbsp;'/>}
      {favicons.indexOf('mstile-144x144.png') > -1 && <meta name='msapplication-TileColor' content={backgroundColor} />}
      {favicons.indexOf('mstile-144x144.png') > -1 && <meta name='msapplication-TileImage' content='/assets/favicons/mstile-144x144.png' />}
      {favicons.indexOf('mstile-70x70.png') > -1 && <meta name='msapplication-square70x70logo' content='/assets/favicons/mstile-70x70.png' />}
      {favicons.indexOf('mstile-150x150.png') > -1 && <meta name='msapplication-square150x150logo' content='/assets/favicons/mstile-150x150.png' />}
      {favicons.indexOf('mstile-310x150.png') > -1 && <meta name='msapplication-wide310x150logo' content='/assets/favicons/mstile-310x150.png' />}
      {favicons.indexOf('mstile-310x310.png') > -1 && <meta name='msapplication-square310x310logo' content='/assets/favicons/mstile-310x310.png' />}
    </>
  )
}
