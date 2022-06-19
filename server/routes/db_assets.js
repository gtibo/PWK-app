const sqlite = require('better-sqlite3');
const path = require('path');
const db = new sqlite(path.resolve('database.db'), {
  fileMustExist: true
});

function getAll() {
  let res = db.prepare(`SELECT id, type, name, data FROM assets ORDER BY id DESC`).all([]);
  return res.map((asset) => {
    asset.data = JSON.parse(asset.data);
    return asset;
  });
}

function getMultiple(page = 1, asset_type = undefined) {
  const offset = (page - 1) * 10;
  let filter = asset_type == undefined ? "" : `WHERE type = '${asset_type}'`;
  const res = db.prepare(`SELECT id, type, name, data FROM assets ${filter} ORDER BY id DESC LIMIT ?,?`).all([offset, 10]);
  return res.map((asset) => {
    asset.data = JSON.parse(asset.data);
    return asset;
  });
}


function addAsset(asset_type, asset_data) {
  let {
    lastInsertRowid
  } = db.prepare(`INSERT INTO assets (name, type, data) VALUES (?, ?, ?)`).run(["Untilted", asset_type, asset_data]);
  return lastInsertRowid;
}

function getAsset(asset_id){
  let asset = db.prepare(`SELECT id, type, name, data FROM assets WHERE id = ?`).get([asset_id]);
  if(asset == undefined) return false;
  asset.data = JSON.parse(asset.data);
  return asset;
}

function editAsset(asset_id, changes) {
  let values = [];
  for (const [key, value] of Object.entries(changes)) {
    values.push(`${key} = '${value}'`);
  }
  db.prepare(`UPDATE assets SET ${values.toString()} WHERE id = ?`).run([asset_id]);
}

function deleteAsset(asset_id){
  db.prepare(`DELETE FROM assets WHERE id = ?`).run([asset_id]);
}

module.exports = {
  getAll,
  getMultiple,
  addAsset,
  editAsset,
  getAsset,
  deleteAsset
};
