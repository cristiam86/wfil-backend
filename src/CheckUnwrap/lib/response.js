function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

exports.returnSuccess = function(body) {
  return buildResponse(200, body);
}

exports.returnFailure = function(body) {
  return buildResponse(500, body);
}
