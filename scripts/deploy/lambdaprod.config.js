require('dotenv').config();

// env dependent
const lambdaFunctionName = process.env.LAMBDA_NAME;

// shared scripts
const { description, version } = require('../../package.json');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_DEFAULT_REGION;
const runtime = "nodejs12.x";

export default {
  accessKeyId,
  secretAccessKey,
  functionName: lambdaFunctionName,
  description: `${description} (version ${version})`,
  region,
  runtime,
  handler: 'index.handler',
};
