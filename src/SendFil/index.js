const { createPow } = require('@textile/powergate-client');
const AWS = require('aws-sdk');
const { returnSuccess, returnFailure } = require('./lib/response.js');

const host = process.env.HOST;
const pow = createPow({ host });

/*
INVOKE
stackery local invoke -e wfil-production --aws-profile iamtech --function-id CheckTransaction --input-file ./src/CheckTransaction/event.json --watch
*/
exports.handler = async (event, context) => {
  const { token, amount, destination } = JSON.parse(event.body);

  try {
    pow.setToken(token)
    const { addrsList } = await pow.ffs.addrs()
    await pow.ffs.sendFil(addrsList[0].addr, destination, amount);
    return returnSuccess();
    
  } catch (error) {
    console.log("exports.handler -> error", error)
    return returnFailure('UNEXPECTED')
  }
};
