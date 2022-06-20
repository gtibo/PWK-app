const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const assetRouter = require('./routes/assets');
const port = 3002;

const {
  getAsset
} = require(path.resolve(__dirname, "./routes/db_assets.js"));

const {
  assetImageIDToData
} = require(path.resolve(__dirname, "./routes/asset_util.js"));


const { WebSocketServer, WebSocket} = require("ws");
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {});
});

app.use(cors());
app.use(express.json());
app.use("/images", express.static('images'));
app.use('/assets', assetRouter);

// Send update via WebSocket
app.post("/assets/create/template", function (req, res, next) {
  // Update!
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        name: "created",
        asset: assetImageIDToData(getAsset(req.asset_id))
      }));
    }
  });
});

// Handle errors
app.use(function(err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(500).send('Something broke :(');
});

app.listen(port);
