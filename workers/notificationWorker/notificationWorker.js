require('dotenv').config();
const mongoose = require('mongoose');

const notify = require('../../utilities/notify');
const { usersModel, notificationBucketModel, reportModel } = require('../../models/api');
const notificationGenerator = require('./notificationGenerator');

async function constantNotifier() {
  try {
    mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    const db = mongoose.connection;

    const allBuckets = await notificationBucketModel.find();

    for (const mixedData of allBuckets) {
      const { uid, newVidPerChannel } = mixedData._doc;
      const userDoc = await usersModel.find({ uid });
      const { devices } = userDoc[0]._doc;
      const notificationObj = notificationGenerator(newVidPerChannel);
      notificationObj.tag = 'tubenotify_overview';

      if (notificationObj.totalNewNotificationCount > 0) {
        delete notificationObj.totalNewNotificationCount;

        for (const device of devices) {
          const res = await notify(device, JSON.stringify(notificationObj));

          if (res === true) {
            await notificationBucketModel.deleteOne({ uid });
          }

          if (res.statusCode === 410) {
            // This subscription is invalid....attempt to remove it...
            const userWithInvalidSubscriptionObj = await usersModel.find({ uid });
            const { devices } = userWithInvalidSubscriptionObj[0]._doc;

            const validDevices = devices.filter((device) => {
              if (JSON.stringify(device) === JSON.stringify(deviceObj)) {
                return false;
              }
              return true;
            });

            userWithInvalidSubscriptionObj.devices = validDevices;

            await usersModel.findOneAndUpdate({ uid, userWithInvalidSubscriptionObj });
          }
        }
      }
    }
  } catch (error) {
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
}

constantNotifier();

// 11min = 660000ms

setInterval(constantNotifier, 660000);
