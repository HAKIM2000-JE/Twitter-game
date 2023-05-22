const functions = require("firebase-functions");
const {TwitterApi}= require('twitter-api-v2')
const axios= require('axios')
const request = require("request");
const fs = require("fs");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


exports.handleTweets = functions.https.onRequest(async (request, response) => {
  const body=JSON.parse(request.body);
  console.log(JSON.parse(request.body));
  const client = new TwitterApi({
    appKey: 'BfLj00Bi6PrCEMbkJVTpRcjWm',
    appSecret: 'PqD98Zh0vYBfC5Tqol6eRav04NAaUxEAbeMZ3hY3AE32aZhV5J',
    accessToken: body.credential.accessToken,
    accessSecret: body.credential.secretAccesToken,
  });
  

  console.log(body)
 // Post the image as a tweet
  const twitterClient = client.readWrite;


  download(body.image, "./image.png", async function(){
    try {
        const mediaId = await twitterClient.v1.uploadMedia("./image.png");
        await twitterClient.v2.tweet({
            text: body.userComment,
            media: {
                media_ids: [mediaId]
            }
        });
    } catch (e) {
        console.log(e)
    }
});
  


    

//   client.post('statuses/update', { status: "Hello from my react app" }, (error, tweet, _response) => {
//     if (error) {
//       console.error('Error posting tweet:', error);
//       response.status(500).send('Error posting tweet');
//     } else {
//       console.log('Tweet posted:', tweet.text);
//       response.send('Tweet posted successfully');
//     }
//   });
  
});

const download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

