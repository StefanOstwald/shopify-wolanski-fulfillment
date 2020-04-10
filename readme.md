# Summary
The goal of this project is to use Wolanski as a fulfillment service for shopify. To use cases are handled by this project:
* New orders transmitted to Wolanski.
* Tracking information from Wolanski is fed back to Shopify and the corresponding order is marked as fulfilled.


# Getting Started
## Prerequisite
* Wolanski has provided you a ftp on which they read the new orders and write the tracking information
* You have an Shopify API token with read_orders, write_orders rights. (It can be created via Shopify Admin -> Apps -> Private Apps)
* You have an AWS Credentials to deploy a lambda service

## Setup Lambda
The service is designed to be hosted on AWS lambda. To get started create a lambda function: Memory: 320mb, Timout: 30s, Role: lambda\_basic\_execution, Node: 8.10

Add all env variables from .env-example to the lambda service. A description of the env variables can be found in .env-example.

## Lambda Trigger
Cloud Watch Events are the trigger for the Lambda function. The cronjob is triggered for each of the workflows twice each day. So both values of the daylight saving time are triggered. The software detects the correct time based upon the set env variables. Lambda is using UTC+0 as time setting even if Lambda in Frankfurt is used. So keep a 1-2 hours different in mind between the cron values and the env values.
A correct configuration for the .env-example is:
> cron(5 10,11,17,18 * * ? *)


## Deploy
For the deployment the aws credentials are needed. They are provided via the env varibles. .env-example describes the needed values. If a .env file exists the variables from the file are loaded for the deployment.
> npm run deploy

Please note that the .env file itself will not (!) get deployed, so make sure to set the env variables are set on lambda.

## Test
For development a .env file can be used for all env varialbes. An example setting is provided in .env-example. To get started with the default setting rename .env-example to .env and replace the variables with your own settings.
> cp example.env .env

Once your .env file configured tests can be started via 
> npm test

## Test lambda
To force an execution indepent of the time the following events are available

### Force start of Workflow Tracking
```JSON
{
  "forceExecutionTracking": true
}
```

### Force start of Workflow Order Upload
To force the workflow tracking to start this event is available:
```JSON
{
  "forceExecutionOrderUpload": true
}
```

# Notes to self
## Express Delivery
Wolanski offer express delivery (T\_Bemerkung1). In order to offer it via Shopify you can create an express delivery shipping rate. The name of the express delivery shipping rate has to entered as the env variable SHOPIFY\_EXPRESS\_DELIVERY\_NAME. If the delivery is selected, the comment ## Express Versands ## is added to T\_Bemerkung1.

## Show End of Line Token on Mac
> od -t c 2018-10-19.csv