import { config, S3 } from 'aws-sdk'

export async function emptyBucket(s3Handler: S3Handler, bucketName: string) {
    s3Handler.deleteObjects(bucketName, await s3Handler.listObjects(bucketName))
}

export class S3Handler {
    private s3: S3

    constructor() {
        const { credentials, region } = config
        this.s3 = new S3({ credentials, region })
    }

    async listObjects(bucketName: string) {
        const list: string[] = []
        const params: any = { Bucket: bucketName }
        let truncated = true
        while (truncated) {
            console.log(`'${bucketName}'`)
            console.log(`'eu-central-1-293530623146-unicorn-330-test-qa-logs-test'`)
            const response = await this.s3.listObjectsV2(params).promise()
            params.ContinuationToken = response.NextContinuationToken
            truncated = !!response.IsTruncated
            const contents = response && response.Contents || []
            contents.forEach(item => item && item.Key && list.push(item.Key))
        }
        return list
    }

    async deleteObject(bucketName: string, key: string) {
        return this.s3.deleteObject({ Bucket: bucketName, Key: key }).promise()
    }

    async deleteObjects(bucketName: string, keys: string[]) {
        return Promise.all(keys.map(key => this.deleteObject(bucketName, key)))
    }
}