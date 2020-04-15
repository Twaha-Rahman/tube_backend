const webPush = require('web-push');

const { publicKey, privateKey } = require('../privateKeys/vapidKeys');

async function notify(notificationSubscriptionObj, notificationObj) {
  try {
    webPush.setVapidDetails('mailto:test@test.com', publicKey, privateKey);

    await webPush.sendNotification(notificationSubscriptionObj, notificationObj);

    return true;
  } catch (error) {
    return error;
  }
}

module.exports = notify;
