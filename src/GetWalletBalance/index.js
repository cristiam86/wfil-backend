const { createPow } = require('@textile/powergate-client');
const { returnSuccess, returnFailure } = require('./lib/response.js');

const host = process.env.HOST;
const pow = createPow({ host });

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id GetWalletBalance --input-file ./src/GetWalletBalance/event.json --watch
*/
exports.handler = async (event) => {
  const { address } = event.queryStringParameters;
  try {
    const balance = await pow.wallet.balance(address);
    return returnSuccess(balance);
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
