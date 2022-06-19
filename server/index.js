const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const assetRouter = require('./routes/assets');
const port = 3002;

app.use(cors());
app.use(express.json());
app.use("/images", express.static('images'));
app.use('/assets', assetRouter);

// Handle errors

app.use(function(err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(500).send('Something broke :(');
});

app.listen(port);
