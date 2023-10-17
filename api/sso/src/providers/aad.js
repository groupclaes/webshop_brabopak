var request = require('sync-request')

var config = require('./config')

var graphAccessUrl = `https://login.microsoftonline.com/${config.aad.tenantId}/oauth2/v2.0/token`
var graphTokenBody = "client_id=" + config.aad.clientId + "&scope=" + config.aad.scope + "&client_secret=" + config.aad.clientSecretId + "&grant_type=client_credentials"

var contentType = "application/x-www-form-urlencoded; charset=utf-8"
var graphTokenError = "Failed to get graph token"
var graphToken = ""

exports.getAllUsers = () => {
  getToken(graphAccessUrl, contentType, graphTokenBody, graphTokenError)

  var nextLink = "@odata.nextLink"
  var reqUrl = 'https://graph.microsoft.com/v1.0/users?$select=id,givenName,surname,displayName,userPrincipalName,department,jobTitle,onPremisesSamAccountName&$top=999'

  try {
    var userList = []

    while (reqUrl) {
      var usersResponse = httpGet(reqUrl, graphToken)
      if (usersResponse.statusCode == 200) {
        failIndex = 0
        var responseBlob = JSON.parse(usersResponse.body.toString('utf-8'))
        userList = responseBlob.value

        if (responseBlob[nextLink]) {
          reqUrl = responseBlob[nextLink]
          continue
        }
        else break
      }
      else {
        if (usersResponse.statusCode === 401 && JSON.parse(usersResponse.body.toString('utf-8'))["error"]["message"] === "Access token has expired.") {
          getToken(graphAccessUrl, contentType, graphTokenBody, graphTokenError)
          userList = userDetails.concat(getUsers(responseBlob[nextLink]))
        }
        else {
          failIndex++
          if (failIndex == retryCount) {
            console.log(errorMessage + "User API Call has been failed..")
            failIndex = 0
          }
          else userList = userDetails.concat(getUsers(responseBlob[nextLink]))
        }
      }
    }
  }
  catch (ex) {
    console.error(ex)
  }
  return userList
}

// This method is using to get the token from the graph token url and body  
function getToken(url, type, content, errorMessage, callback) {
  var options = {
    'headers': {
      'Content-Type': type
    },
    'body': content
  }

  //Posting access parameters to the server  
  var tokenResponse = httpPost(url, options)

  if (tokenResponse.statusCode === 200) {
    error = errorMessage
    if (errorMessage === graphTokenError) {
      var token = JSON.parse(tokenResponse.body.toString('utf-8'))
      graphToken = token.access_token
    }
    if (callback) {
      return callback()
    }
  } else {
    console.log(errorMessage)
  }
}

function httpGet(url, bearerToken) {
  var res = request('GET', url, {
    'headers': {
      'Authorization': 'Bearer ' + bearerToken,
      'Accept': "application/json"
    }
  })
  return res
}

function httpPost(url, options) {
  var res = request('POST', url, options)
  return res
}