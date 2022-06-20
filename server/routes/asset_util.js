const path = require('path');

const {
  getImage
} = require(path.resolve(__dirname, "./db_images.js"));

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

module.exports = {
  createModel,
  assetGetVignette,
  assetImageIDToData,
  assetImagesList
};
