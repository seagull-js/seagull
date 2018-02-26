import * as React from 'react'

export default ({ children, renderedContent }:{children?, renderedContent:string}) => {
  return (
    <body>
      <div id='root' dangerouslySetInnerHTML={{__html:renderedContent}}></div>
      {children}
    </body>
  )
}