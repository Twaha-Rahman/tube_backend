const { Worker } = require('worker_threads');

const queryWorker = new Worker('./workers/queryWorker/queryWorker.js');
const notificationWorker = new Worker('./workers/notificationWorker/notificationWorker.js');

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { detect } = require('detect-browser');
const cors = require('cors');

// console.log(
//   detect(
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
//   )
// );

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.static('public'));
app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.on('error', (err) => console.error(err));
db.once('open', () => console.log('Connected to DB.....'));

app.use(express.json());

const apiRouter = require('./routes/api');

app.use('/api', apiRouter);

// app.listen(3005, () => {
//   console.log(`Listening on..........port 3005`);
// });
