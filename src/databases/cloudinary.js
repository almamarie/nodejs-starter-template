const logger = require('../logs/logger');

const cloudinary = require('cloudinary').v2;

class CustomCloudinary {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadSingleImage = async function (path) {
    return await this._uploadImage(path);
  };

  uploadImages = async function (paths) {
    const filePublicUrls = [];

    for (let path of paths) {
      const urlPath = await this._uploadImage(path);
      filePublicUrls.push(urlPath);
    }
    return filePublicUrls;
  };

  _uploadImage = async function (path) {
    logger.info(`Uploading file: ${path}...`);

    // return 'http://res.cloudinary.com/marieloumar/image/upload/v1698964016/sellz-profile-pictures/mynuilxrluml1e0osuua.jpg';
    const result = await cloudinary.uploader.upload(path, {
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    logger.info(`Done uploading file: ${path}...`);
    return result.url;
  };
}

module.exports = CustomCloudinary;
