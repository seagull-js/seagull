# @seagull/deploy

This package deploys a bundle that was handed over via cdk.

## How to deploy something

For a generic solution you can just start the `seagull-deploy`command. This will create a universal lambda, that boots an express server. You can handover the following parameters by env variables:

`AWS_ACCOUNT_ID`

- default: `undefined`
- the account id that will be used for this deployment
- currently it is only used to determine the item-s3-bucket name, which must be uniq.
- this parameter was added to test the app template without mocking AWS-STS in aws.sdk
- best advice: just don't use it

`BRANCH_NAME`

- default: `master`
- the branch that will be deployed
- it is basically used for the pipeline to create it's own project instead of overriding the prod deployment

`DEPLOY_MODE`

- default: `prod`
- differ whether the app should be deployed in `test` or `prod` mode
- `prod` will use its own bucket, the `test` instances will use their own
- non-`prod`app will get a suffix `BRANCH_NAME-DEPLOY_MODE` added to the app name

`AWS_PROFILE`

- default: `default`
- the aws profile that is used for the deployment
- should be configured on the `~/.aws/credentials`file

`AWS_REGION`

- default: `eu-central-1`
- the region the app will be deployed
- notice that there are some services in AWS that are not available everywhere

### Advanced Deployment

- you can use the basic seagull_app to have an app and use the convenience functions to add resources or use `cdk` itself to tweak the deployment. After that you can use the meth `deployStack` on the app to bring it to aws

## How to see potential changes

To diff the current project in your repository with the one in aws just run `seagull-diff`. It uses the same env variables and will create an app like in `seagull-deploy` but does not put it into aws, instead it uses cloudformation-diff to show you what changed in your structure. Like the deployment you can also build an app yourself and that use the `diffStack` method to see changes.

## How to create a Code Pipeline for something

To implement any kind of CI you can create a AWS Pipeline with seagull. Just use `seagull-pipeline`to create one. You can also create a custom one as its own seagull app. Just use the `SeagullApp` class for that. The default pipeline will use a github repository and creates a webhook to trigger itself. This means a new push to the watched branch will trigger a new build. therefore you will need to provide the data for the repositories like the owner, the repository name and a oAuthToken. The Token can also be stored in AWS-SSM, then you just have to forward the GITHUB_SSM_PARAMETER. Within the pipeline script a `seagull-deploy` will be executed. All parameters with the same name are given right trough to this deploy command,

`seagull-pipeline` will use the following env variables as options:

`BRANCH_NAME`

- default: `master`
- the name of the current branch, like in `seagull-deploy`
- will be given to the deploy command within the pipeline

`DEPLOY_MODE`

- default: `prod`
- differ whether the app should be deployed in `test` or `prod` mode
- `prod` will use its own bucket, the `test` instances will use their own

`GITHUB_OWNER`

- default: `undefined`
- the owner of the repository the pipeline should be triggered by

`AWS_REGION`

- default: `eu-central-1`
- the aws region the deployment should take place

`GITHUB_REPO`

- default: `undefined`
- the repository name that should be used as github repo for the pipeline

`GITHUB_SSM_PARAMETER`

- default: `undefined`
- the name of the OAuthToken in SSM

`GITHUB_OAUTH`

- default: `undefined`
- the oAuthToken to get access to the github repository

`COMPUTE_TYPE_SIZE`

- default: `SMALL`
- the ComputeType to use for the build environment (see CodeBuild docs)
