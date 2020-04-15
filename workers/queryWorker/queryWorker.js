require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const youtubeDataApiKey = require('../../privateKeys/youtubeDataApiKey');
const { queryModel, notificationBucketModel, reportModel } = require('../../models/api');
const fetcher = require('./fetcher');

// get the document(each document represents indivitual user)
// each query in a doc refers to to each indivitual channel(each channel can have one or more subscription....(one or more keywords and lookeduptovidtag))

const constantQueryChecker = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    const db = mongoose.connection;
    // use "for....of" insted of "forEach" to fix the prob
    const documents = await queryModel.find();
    if (documents.length > 0) {
      for (const obj of documents) {
        console.log(obj._doc);

        const { uid, query } = obj._doc;
        const newVidPerChannel = {};
        const newUserObj = {
          uid,
          query: [],
        };

        let queryLoopCount = 0;

        for (const channelQueryObj of query) {
          queryLoopCount += 1;
          //////////
          const channelQueryObjCopy = JSON.parse(JSON.stringify(channelQueryObj));
          let newLookedUpToThisVideoTag = '';

          ////////////////

          const { channelName, playlistId, details } = channelQueryObj;
          const link = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&key=${youtubeDataApiKey}&maxResults=10`;
          const data = await fetcher(fetch, link);

          newLookedUpToThisVideoTag = data.items[0].snippet.resourceId.videoId;

          for (const info of details) {
            const { lookedUpToThisVideoTag, keyWords } = info;

            let goAheadChecking = true;
            const titlesArr = [];

            for (const vidInfoObj of data.items) {
              if (vidInfoObj.snippet.resourceId.videoId === lookedUpToThisVideoTag) {
                goAheadChecking = false;
              }

              if (goAheadChecking) {
                titlesArr.push(vidInfoObj.snippet.title);
              }
            }
            let newVidCount = 0;

            for (const title of titlesArr) {
              for (const keyWord of keyWords) {
                const regex = new RegExp(keyWord, 'i');
                if (regex.test(title)) {
                  newVidCount = newVidCount + 1;
                }
              }
            }

            if (newVidCount !== 0) {
              newVidPerChannel[channelName] = newVidCount;
            }
          }
          // update lookedUptoVidTagHere
          channelQueryObjCopy.details.forEach((detailObj) => {
            detailObj.lookedUpToThisVideoTag = newLookedUpToThisVideoTag;
          });

          newUserObj.query.push(channelQueryObjCopy);
        }

        console.log(newUserObj);
        await queryModel.findOneAndUpdate({ uid }, newUserObj);

        const userNotificationCountObj = {
          uid,
          newVidPerChannel,
        };
        console.log(userNotificationCountObj);

        const options = { upsert: true, setDefaultsOnInsert: true };

        await notificationBucketModel.findOneAndUpdate({ uid }, userNotificationCountObj, options);
      }
    }
  } catch (error) {
    console.log(error);

    const generatedFrom = {
      side: 'server',
      place: 'queryWorker.js',
    };

    const newReport = new reportModel({
      errorMessage: error.message,
      errorStack: error.stack,
      generatedFrom,
    });
    await newReport.save();
  }
};

// 10min = 600000ms

constantQueryChecker();

setInterval(constantQueryChecker, 600000);
