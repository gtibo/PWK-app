const sqlite = require('better-sqlite3');
const path = require('path');
const db = new sqlite(path.resolve('database.db'), {
  fileMustExist: true
});

function addImage(path, width, height) {
  let {
    lastInsertRowid
  } = db.prepare(`INSERT INTO images (path, width, height) VALUES (?, ?, ?)`).run([path, width, height]);
  return lastInsertRowid;
}

function getImage(image_id){
  // Return image data
  return db.prepare(`SELECT id, path, width, height FROM images WHERE id = ?`).get([image_id]);
}

function editImage(image_id, changes) {
  let values = [];
  for (const [key, value] of Object.entries(changes)) {
    values.push(`${key} = '${value}'`);
  }
  db.prepare(`UPDATE images SET ${values.toString()} WHERE id = ?`).run([image_id]);
}

function deleteImage(asset_id){
  db.prepare(`DELETE FROM images WHERE id = ?`).run([asset_id]);
}

module.exports = {
  addImage,
  getImage,
  editImage,
  deleteImage
};
