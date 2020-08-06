const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc');
const { NodejsProvider } = require('@filecoin-shipyard/lotus-client-provider-nodejs');
const { testnet } = require('@filecoin-shipyard/lotus-client-schema');

const BLOCKS_HEIGHT_TO_CHECK = process.env.BLOCKS_HEIGHT_TO_CHECK; // 30 mins -> Block time = 30s

const getClient = () => {
  const API = 'wss://lotus.testground.ipfs.team/testnet_api/0/node/rpc/v0'

  // Creating and returning a Lotus client
  const provider = new NodejsProvider(API)
  return new LotusRPC(provider, { schema: testnet.fullNode });
}

exports.getClient = getClient;
exports.getMessagesList = async ({ from, to }) => {
  try {
    const client = getClient();
    const params = {
      "Version":0,
      "To": to,
      "From": from,
      "Nonce":0,
      "Value":"0",
      "GasPrice":"0",
      "GasLimit":0,
      "Method":0,
      "Params":null
    };
    const head = await client.chainHead();
    // console.log("init -> head", head.Height)

    const messageList = await client.stateListMessages(params, [], head.Height - BLOCKS_HEIGHT_TO_CHECK);
    // console.log("init -> messages", JSON.stringify(messageList, null, 4))
    return messageList;
    
  } catch (error) {
    console.log("getMessagesList -> error", error)
  }
}
