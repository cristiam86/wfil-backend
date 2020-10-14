const axios = require('axios');

const LOTUS_API = process.env.LOTUS_API; 

exports.getMessagesList = async (from) => {
  try {
    const { data } = await axios.post(LOTUS_API, {
      "id":1,
      "jsonrpc":"2.0",
      "params":[
          {
              "begindex":0,
              "count": 5,
              "method":"",
              "address": from,
              "from_to": "from"
          }
      ],
      "method":"filscan.MessageByAddress"
    })
    return data.result && data.result.data ? data.result.data : [];
    
  } catch (error) {
    console.log("getMessagesList -> error", error)
  }
}
