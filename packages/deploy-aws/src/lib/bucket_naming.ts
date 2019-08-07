export interface IBucketNameParams {
  accountId: string
  branch: string
  projectName: string
  region: string
  stage: string
  topic: string
}

export function getBucketName(props: IBucketNameParams, addBranchName = false) {
  const prefix = `${props.region}-${props.accountId}-`
  const branchAddendum = addBranchName ? `-${props.branch}` : ''
  const suffix = `${props.stage !== 'prod' ? `-${props.stage}` : ''}`
  // bucket names should be between 3 and 63 characters,
  // therefore we have to cut a little at this point
  const limit = 62 - prefix.length - suffix.length - props.topic.length
  const project = `${props.projectName}${branchAddendum}`.substring(0, limit)
  const middlePart = `${project}-${props.topic}`.replace(/[^0-9A-Za-z-]/g, '')
  return `${prefix}${middlePart}${suffix}`.toLowerCase()
}
