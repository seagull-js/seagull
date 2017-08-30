// export App as the default export *and* as a module
import App from './app'
export default App
export { App }

// export other useful helpers and stuff
export { default as Request } from './app/request'
export { default as GetRequest } from './app/get_request'
export { default as PostRequest } from './app/post_request'
export { IRoute, IBackendRoute, IFrontendRoute } from './app'
