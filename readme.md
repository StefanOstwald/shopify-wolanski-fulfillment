## Goal
This tool gets the orders of the last day from shopify prepares the file format for the wolanski fulfillment center and uploads the required file to the provided FTP.

## Env Variables
The env variables can be used via a .env file. An example setting is provided in .env-example. To get started with the default setting rename .env-example to .env and replace the variables with your own settings.
> rn ./.env-example ./.env

### Lambda
This working is prepared to be deployed on AWS Lambda

### Lambda Basic Configuration
Memory: 320mb
Timout: 30s
Role: lambda\_basic\_execution

### Lambda Trigger
Cloud Watch Events are the trigger for the lambda function. The cronjob is triggered twice each day. So both values of the daylight saving time are triggered. The software can figure out if it shall submit the new orders to the fulfillment. Lambda is using UTC+0 as time setting. This setting should have the same time as in the env varialbe TARGET_EXECUTION_TIME

```
cron(5 10,11 * * ? *)
```

### Deployment
When the env variables are set, e.g. via the .env file, the worker can be deployed to AWS Lambda via the prepared script
> npm run deploy:production

