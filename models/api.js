const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  devices: {
    type: {},
  },
});

const querySchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  query: {
    type: {},
  },
});

const analyticsSchema = new mongoose.Schema({
  ram: {
    type: String,
  },
  browserInfo: {
    type: String,
  },
  perfMetrics: {
    type: {},
  },
});

const reportSchema = new mongoose.Schema({
  uid: {
    type: {},
  },
  ram: {
    type: Number,
  },
  browserInfo: {
    type: String,
  },
  state: {
    type: {},
  },
  queries: {
    type: {},
  },
  subscriptions: {
    type: {},
  },
  errorMessage: {
    type: {},
  },
  errorStack: {
    type: {},
  },
  generatedFrom: {
    type: {},
  },
});

const notificationBucketSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  newVidPerChannel: {
    type: {},
  },
});

module.exports = {
  usersModel: mongoose.model('users', usersSchema),
  queryModel: mongoose.model('query', querySchema),
  analyticsModel: mongoose.model('analytics', analyticsSchema),
  reportModel: mongoose.model('report', reportSchema),
  notificationBucketModel: mongoose.model('notification-bucket', notificationBucketSchema),
};
