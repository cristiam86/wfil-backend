const { createPow } = require('@textile/powergate-client');
const { returnSuccess, returnFailure } = require('./lib/response.js');

const host = process.env.HOST;
const pow = createPow({ host });

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CreateWallet --watch
*/
exports.handler = async () => {
  try {
    const { token } = await pow.ffs.create();
    pow.setToken(token)
    const { info } = await pow.ffs.info()
    return returnSuccess({ token, address: info.balancesList[0].addr.addr });
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
