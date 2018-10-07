// ToDo: since there is no VPC any longer, do we still need ENI permissions for EC2?

module.exports.test = () => {
  return [
    // {
    //   Action: ['dynamodb:*'],
    //   Effect: 'Allow',
    //   Resource: 'arn:aws:dynamodb:eu-central-1:*:*',
    // },
    {
      Action: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
      Effect: 'Allow',
      Resource: 'arn:aws:lambda:eu-central-1:*:function:*',
    },
    {
      Effect: 'Allow',
      Action: ['s3:*'],
      Resource: 'arn:aws:s3:::*',
    },
  ]
}

module.exports.prod = () => {
  return [
    // {
    //   Action: ['dynamodb:*'],
    //   Effect: 'Allow',
    //   Resource: 'arn:aws:dynamodb:eu-central-1:*:*',
    // },
    {
      Action: ['lambda:InvokeFunction'],
      Effect: 'Allow',
      Resource: 'arn:aws:lambda:eu-central-1:*:function:*',
    },
    { Effect: 'Allow', Action: ['s3:*'], Resource: 'arn:aws:s3:::*' },
    ,
  ]
}
