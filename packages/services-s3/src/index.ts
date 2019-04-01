import { S3 } from './mode/cloud'

// services
export { S3 }
export { S3 as S3Cloud }
export { S3Edge } from './mode/edge'
export { S3Pure } from './mode/pure'
export { S3Seed } from './mode/seed'

// service container modules
export { module as s3ServicesModule } from './module'
