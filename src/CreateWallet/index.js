const { createPow } = require('@textile/powergate-client');
const { returnSuccess, returnFailure } = require('./lib/response.js');

const host = process.env.HOST;
const pow = createPow({ host });

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CreateWallet
*/
exports.handler = async () => {
  try {
    const { token } = await pow.ffs.create()
    return returnSuccess({ token });
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
