## Goal
This tool gets the orders of the last time intervall from woo commerce and uploads it the provided FTP address.

## Lambda configuration
Memory: 320mb
Timout: 30s
Role: lambda\_basic\_execution

## Lambda Trigger
Cloud Watch Events are the trigger for the lambda function. The cronjob is triggered twice each day. So both values of the daylight saving time are triggered. The software can figure out if it shall submit the new orders to the fulfillment.

```
cron(5 10,11 * * ? *)
```
