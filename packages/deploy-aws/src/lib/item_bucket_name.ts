interface ItemsBucketProps {
  accountId?: string
  region: string
  project: string
}

export function getItemsBucketName(props: ItemsBucketProps) {
  return `${props.region}-${props.accountId || ''}-${props.project}-items`
}
