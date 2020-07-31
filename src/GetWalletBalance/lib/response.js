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


// export function returnCSV(body, fileName) {
//   return {
//     headers: {
//       'Content-Type': 'text/csv',
//       'Content-disposition': `attachment; filename=${fileName}.csv`
//     },
//     body,
//     statusCode: 200
//   }
// }


// export function returnXLS(body, fileName) {
//   return {
//     headers: {
//       'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       'Content-Disposition': `attachment; filename=${fileName}.xlsx`
//     },
//     isBase64Encoded: true,
//     body,
//     statusCode: 200,
//   }
// }