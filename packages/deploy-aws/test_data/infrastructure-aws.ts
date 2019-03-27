import { SeagullApp } from '../src'
    export default function(app: SeagullApp) {
      app.stack.addS3('another-s3', app.role)
    }