# Goal
This tool gets the orders of the last day from shopify prepares the file format for the wolanski fulfillment center and uploads the required file to the provided FTP.

### Env Variables
For development a .env file can be used for all env varialbes. An example setting is provided in .env-example. To get started with the default setting rename .env-example to .env and replace the variables with your own settings.
> rn ./.env-example ./.env
The .env file will not (!) get deployed, so make sure to set the env variables directly on lambda for your production environment.

### Shopify
An private shopify app is needed to access the shopify api. It needs the rights for read_orders, write_orders. The credentials are added via env variables.

### Express Delivery
Wolanski offer express delivery (T_Bemerkung1). In order to offer it via Shopify you can create an express delivery shipping rate. The name of the express delivery shipping rate has to entered as the env variable SHOPIFY_EXPRESS_DELIVERY_NAME. If the delivery is selected, the comment ## Express Versands ## is added to T_Bemerkung1.

## Lambda
This project is prepared to be deployed on AWS Lambda.

### Lambda Basic Configuration
Memory: 320mb
Timout: 30s
Role: lambda\_basic\_execution
Node: 8.10

### Lambda Trigger
Cloud Watch Events are the trigger for the Lambda function. The cronjob is triggered for each of the workflows twice each day. So both values of the daylight saving time are triggered. The software figures out if it shall submit the new orders to the fulfillment. Lambda is using UTC+0 as time setting even if Lambda in Frankfurt is used. So keep a 1-2 hours different in mind. This setting should have the same time (+1 and +2 hour for Berlin time) as in the env varialbe TARGET_EXECUTION_TIME.
A working configuration for the env-example is:
```
cron(5 10,11,17,18 * * ? *)
```

### Deployment
When the aws env variables are set, e.g. via the .env file, the worker can be deployed to AWS Lambda via the prepared script. The .env file itself will not be deployed, so please use the env settings in Lambda.
> npm run deploy

