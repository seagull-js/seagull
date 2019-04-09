import { S3 } from './mode/cloud'

// types
export { S3Error } from './typings/s3_error'

// services
export { S3 }
export { S3 as S3Cloud }
export { S3Edge } from './mode/edge'
export { S3Pure } from './mode/pure'

// service container modules
export { module as s3ServicesModule } from './module'
