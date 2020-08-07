const { returnSuccess, returnFailure } = require('./lib/response.js');
const { getContract } = require('./lib/web3-lib.js');
const { createPow } = require('@textile/powergate-client');
const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager();
const secretsNamespace = process.env.SECRETS_NAMESPACE;

const host = process.env.HOST;
const pow = createPow({ host });
/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CheckUnwrap --input-file ./src/CheckUnwrap/event.json --watch
*/
exports.handler = async (event, context) => {
  // Log the event argument for debugging and for use in local development.
  const { amount, destination } = event.queryStringParameters;
  try {
    const wfilContract = getContract();
    const events = await wfilContract.getPastEvents('Unwrapped', { fromBlock: 0 });
    const unwrapped = events.some(ev => ev.returnValues.filaddress === destination && ev.returnValues.amount === amount);

    if (unwrapped) {
      const tokenResponse = await secretsManager.getSecretValue({ SecretId: `${secretsNamespace}TOKEN` }).promise();
      pow.setToken(tokenResponse.SecretString);
      const { addrsList } = await pow.ffs.addrs()
      await pow.ffs.sendFil(addrsList[0].addr, destination, amount);
      return returnSuccess();
    }
    return returnFailure('NO_MESSAGE');

  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
