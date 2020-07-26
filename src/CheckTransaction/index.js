const { createPow } = require('@textile/powergate-client');
const AWS = require('aws-sdk');
const { returnSuccess, returnFailure } = require('./lib/response.js');

const secretsManager = new AWS.SecretsManager();
const secretsNamespace = process.env.SECRETS_NAMESPACE;

const host = process.env.HOST;
const pow = createPow({ host });

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CheckTransaction --input-file ./src/CheckTransaction/event.json --watch
*/
exports.handler = async (event, context) => {
  const { address } = event.arguments;
  // const { token } = await pow.ffs.create()
  const params = { SecretId: `${secretsNamespace}TOKEN` };

  try {
    const response = await secretsManager.getSecretValue(params).promise();
    const TOKEN = response.SecretString;
    pow.setToken(TOKEN)
    const { info } = await pow.ffs.info()
    console.log("exports.handler -> info", JSON.stringify(info, null, 4))
    const balance = await pow.wallet.balance('t3r65ygzflxsibwkput2c5thotk4qpo4vkz2t5dtg76dhxgotynlb7nbzabt6z2if3xmlfpvu7ujyhfy44qvoq');
    console.log("exports.handler -> balance", balance);
    
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
