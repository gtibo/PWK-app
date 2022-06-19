const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const sizeOf = require('image-size');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.resolve("images"));
  },
  filename: function(req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    callback(null, `${uniqueSuffix}.png`);
  }
});

const upload = multer({
  storage: storage
});

const {
  getAll,
  getMultiple,
  addAsset,
  editAsset,
  getAsset,
  deleteAsset
} = require(path.resolve(__dirname, "./db_assets.js"));

const {
  addImage,
  getImage,
  editImage,
  deleteImage
} = require(path.resolve(__dirname, "./db_images.js"));
// Get all asset data
router.get('/all', function(req, res, next) {
  try {
    let assets = getAll();
    assets = assets.map(asset => {
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        vignette: assetGetVignette(asset)
      };
    })
    res.json(assets);
  } catch (err) {
    next(err);
  }
});
// Get multiples assets
router.get('/multiple/:page/:asset_type?', function(req, res, next) {
  try {
    let assets = getMultiple(req.params.page, req.params.asset_type);
    assets = assets.map(asset => {
      return asset = assetImageIDToData(asset);
    })
    res.json(assets);
  } catch (err) {
    next(err);
  }
});
// Get asset data with ID
router.get('/:id', function(req, res, next) {
  try {
    let asset = getAsset(req.params.id);
    if (!asset) {
      res.status(404).send(`This asset doesn't exist...`);
      return;
    }
    asset = assetImageIDToData(asset);
    res.json(asset);
  } catch (err) {
    next(err);
  }
});
// Return vignette image_data from asset_data
function assetGetVignette(asset) {
  let fn = {
    "drawing": (asset) => {
      return getImage(asset.data.image);
    },
    "animation": (asset) => {
      return getImage(asset.data.frames[0]);
    },
    "template": (asset) => {
      return getImage(asset.data.texture);
    }
  }
  return fn[asset.type](asset);
}
// Turn every image_id to image_data in an asset_data
function assetImageIDToData(asset) {
  let clone_asset = JSON.parse(JSON.stringify(asset));
  let fn = {
    "drawing": (asset) => {
      let image_id = asset.data.image;
      asset.data.image = getImage(image_id);
      return asset;
    },
    "animation": (asset) => {
      asset.data.frames = asset.data.frames.map(frame => getImage(frame));
      return asset;
    },
    "template": (asset) => {
      let texture_id = asset.data.texture;
      asset.data.texture = getImage(texture_id);
      return asset;
    }
  }
  return fn[asset.type](clone_asset);
}
// Return list of image_data of every image_id in an asset_data
function assetImagesList(asset) {
  let fn = {
    "drawing": (asset) => [asset.data.image],
    "animation": (asset) => asset.data.frames,
    "template": (asset) => [asset.data.texture]
  }
  return fn[asset.type](asset);
}
// Delete any asset and its images
router.delete('/delete/:id', function(req, res, next) {
  try {
    let asset_data = getAsset(req.params.id);
    deleteAsset(req.params.id)
    assetImagesList(asset_data).forEach((image_id) => {
      let image_path = getImage(image_id).path;
      let image_path_to_delete = path.resolve(image_path);
      if (fs.existsSync(image_path_to_delete)) fs.unlinkSync(image_path_to_delete);
      deleteImage(image_id);
    });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//
// DRAWING ASSET ROUTES //
//
// Create new drawing asset
router.post('/create/drawing', upload.single("picture"), function(req, res, next) {
  try {
    let image_path = `images/${req.file.filename}`;
    let {
      width,
      height
    } = sizeOf(image_path);
    let image_id = addImage(image_path, width, height);
    addAsset("drawing", JSON.stringify({
      "image": image_id
    }));
    // Success, drawing asset is created.
    res.sendStatus(200)
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't upload image :(");
  }
});
// Edit drawing asset
router.put('/edit/drawing/:id', upload.single("picture"), function(req, res, next) {
  try {
    let image_path = `images/${req.file.filename}`;
    let {
      width,
      height
    } = sizeOf(image_path);
    let asset_data = getAsset(req.params.id).data;
    let edited_image_id = asset_data.image;
    let old_image_path = getImage(edited_image_id).path;
    // Delete old image from file system
    let image_path_to_delete = path.resolve(old_image_path);
    if (fs.existsSync(image_path_to_delete)) fs.unlinkSync(image_path_to_delete);
    editImage(edited_image_id, {
      path: image_path,
      width,
      height
    });
    // Success, drawing asset is edited...
    res.sendStatus(200)
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't edit image :(");
  }
});
//
// ANIMATION ASSET ROUTES //
//
// Create new animation asset
router.post('/create/animation', upload.single("picture"), function(req, res, next) {
  try {
    let image_path = `images/${req.file.filename}`;
    let {
      width,
      height
    } = sizeOf(image_path);
    let image_id = addImage(image_path, width, height);
    let added_frame = getImage(image_id);
    // Create an animation asset with the first frame and fps
    let new_asset_id = addAsset("animation", JSON.stringify(createModel("animation", image_id, 12)));
    // Success, animation asset is created.
    res.status(200).json({
      asset_id: new_asset_id,
      added_frame: added_frame
    })
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't create animation asset :(");
  }
});
// Add frame to an animation asset
router.put('/addframe/animation/:id', upload.single("picture"), function(req, res, next) {
  try {
    let image_path = `images/${req.file.filename}`;
    let {
      width,
      height
    } = sizeOf(image_path);
    let image_id = addImage(image_path, width, height);
    let added_frame = getImage(image_id);
    // Add frame image_id to the frames animation asset data
    let asset_data = getAsset(req.params.id).data;
    asset_data.frames.push(image_id);
    // Update the db
    editAsset(req.params.id, {
      data: JSON.stringify(asset_data)
    });
    // Success, frame was added to the animation asset!
    res.status(200).json({
      added_frame: added_frame
    })
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't create animation asset :(");
  }
});
// save animation asset client data
// Takes frames [array of image_id] and fps
router.put('/save/animation/:id', function(req, res, next) {
  try {
    let asset_data = getAsset(req.params.id).data;
    asset_data.frames = req.body.frames;
    asset_data.fps = req.body.fps;
    editAsset(req.params.id, {
      data: JSON.stringify(asset_data)
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't save animation :(");
  }
});
router.delete('/deleteframe/animation/:id/:frameindex', function(req, res, next) {
  try {
    let asset_data = getAsset(req.params.id).data;
    let image_to_delete_id = asset_data.frames[req.params.frameindex];
    asset_data.frames.splice(req.params.frameindex, 1);
    editAsset(req.params.id, {
      data: JSON.stringify(asset_data)
    });
    let image_to_delete_path = path.resolve(getImage(image_to_delete_id).path);
    if (fs.existsSync(image_to_delete_path)) fs.unlinkSync(image_to_delete_path);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't save animation :(");
  }
});
//
// TEMPLATE ASSET ROUTES //
//
router.post('/create/template', upload.single("picture"), function(req, res, next) {
  try {
    let model_data = JSON.parse(req.body.model_data);
    let image_path = `images/${req.file.filename}`;
    let {
      width,
      height
    } = sizeOf(image_path);
    let texture_id = addImage(image_path, width, height);
    let added_texture = getImage(texture_id);
    // Create a template asset with a texture
    let new_asset_id = addAsset("template", JSON.stringify(createModel("template", texture_id, model_data)));
    // Success, template asset is created.
    res.status(200).json({
      asset_id: new_asset_id
    })
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't create template asset :(");
  }
});

router.post('/edit/template', function(req, res, next) {
  try {
    // Success, template asset is edited.
    res.status(200).json({
      asset_id: new_asset_id
    })
  } catch (err) {
    console.log(err);
    res.status(500).send("Couldn't edit template asset :(");
  }
});

function createModel(asset_type, ...args) {
  let fn = {
    "drawing": () => {

    },
    // createModel("animation", image_id, fps);
    "animation": (args) => {
      let images_id = args[0],
        fps = args[1];
      return {
        "frames": [images_id],
        "fps": fps
      }
    },
    "template": (args) => {
      let texture_id = args[0],
        model_data = args[1];
      return {
        "texture": texture_id,
        "model_data": model_data
      }
    },
  };
  return fn[asset_type](args)
}

module.exports = router;
