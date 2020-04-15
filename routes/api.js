const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const notify = require('../utilities/notify');

const { usersModel, queryModel, reportModel, analyticsModel } = require('../models/api');

module.exports = router;

// uid = user indentifier
// devices = user's (one or more) devices public key

router.post('/init/', async (req, res) => {
  console.log(Object.keys(req.body).length);

  if (Object.keys(req.body).length > 2) {
    const noificationSubscriptionObj = req.body;

    const uid = uniqid();

    const newUID = new usersModel({
      uid,
      devices: [noificationSubscriptionObj],
    });

    try {
      await newUID.save();
      res.status(201).json({
        uid,
        status: 201,
        isSuccessful: true,
      });
    } catch (error) {
      console.log('error b1', error);
      res.status(400).json({
        status: 400,
        isSuccessful: false,
      });
    }
  } else {
    try {
      const document = await usersModel.findOne({ uid: req.body.uid });
      let updateDoc = true;

      console.log(document.devices[0].keys.p256dh);

      document.devices.forEach((element) => {
        if (element.keys.p256dh === req.body.device.keys.p256dh && element.keys.auth === req.body.device.keys.auth) {
          updateDoc = false;
        }
      });

      if (updateDoc) {
        const newDocument = JSON.parse(JSON.stringify(document));
        newDocument.devices = [...newDocument.devices, req.body.device];
        await usersModel.findOneAndUpdate({ uid: req.body.uid }, newDocument);
        res.status(201).json({
          status: 201,
          isSuccessful: true,
        });
      } else {
        res.status(200).json({
          status: 200,
          isSuccessful: true,
        });
      }

      // const uniqueNewDevicesArr = [...new Set([...document.devices, req.body.device])];
      // const newDocument = JSON.parse(JSON.stringify(document));
      // newDocument.devices = uniqueNewDevicesArr;
      //console.log(newDocument);
    } catch (error) {
      console.log('error b2', error);

      res.status(400).json({
        status: 400,
        isSuccessful: false,
      });
    }
  }
});

router.post('/delete-device', async (req, res) => {
  const uid = req.body.uid;
  const deviceObj = req.body.obj;

  try {
    const document = await usersModel.findOne({ uid });
    const updatedDevices = [];
    let updateNeeded = false;

    document.devices.forEach((element) => {
      if (element.keys.p256dh !== deviceObj.keys.p256dh && element.keys.auth !== deviceObj.keys.auth) {
        updatedDevices.push(element);
      } else {
        updateNeeded = true;
      }
    });

    const updatedDoc = JSON.parse(JSON.stringify(document));

    updatedDoc.devices = updatedDevices;

    console.log(updatedDevices, updateNeeded, null);

    if (updateNeeded) {
      await usersModel.findOneAndUpdate({ uid }, updatedDoc);
      res.status(204).json({
        status: 204,
        isSuccessful: true,
      });
    } else {
      res.status(200).json({
        status: 200,
        isSuccessful: true,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: 400,
      isSuccessful: false,
    });
  }
});

router.post('/query', async (req, res) => {
  const queriesArr = req.body.queries;
  const uid = req.body.uid;

  const newQuery = new queryModel({
    uid,
    query: queriesArr,
  });

  try {
    const doc = await queryModel.findOne({ uid });
    const updatedDoc = {
      uid,
      query: queriesArr,
    };
    console.log(updatedDoc);

    if (doc) {
      if (JSON.stringify(req.body) === JSON.stringify(updatedDoc)) {
        res.status(200).json({
          status: 200,
          isSuccessful: true,
        });
      } else {
        await queryModel.findOneAndUpdate({ uid }, updatedDoc);
        res.status(204).json({
          status: 204,
          isSuccessful: true,
        });
      }
    } else {
      await newQuery.save();
      res.status(200).json({
        status: 200,
        isSuccessful: true,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: 400,
      isSuccessful: false,
    });
  }
});

router.post('/analytics', async (req, res) => {
  const analyticInfo = {
    ram: req.body.ram,
    browserInfo: req.body.browserInfo,
    perfMetrics: req.body.perfMetrics,
  };

  const newAnalytics = new analyticsModel(analyticInfo);

  try {
    await newAnalytics.save();
    res.status(200).json({
      status: 201,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      isSuccessful: false,
    });
  }
});

router.post('/report', async (req, res) => {
  const reportData = {
    uid: req.body.uid,
    ram: req.body.ram,
    browserInfo: req.body.browserInfo,
    state: req.body.state,
    queries: req.body.queries,
    subscriptions: req.body.subscriptions,
  };

  const newReport = new reportModel(reportData);

  try {
    await newReport.save();
    res.status(200).json({
      status: 201,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
    });
  }
});
