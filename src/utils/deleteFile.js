const fs = require('fs');

exports.deleteFile = async (filePath) => {
  deleteFile(filePath);
};

exports.deleteFiles = async (filesPaths) => {
  filesPaths.forEach((filePath) => {
    deleteFile(filePath);
  });
};

const deleteFile = async (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error('Failed to delete file: ', filePath);
    }
  });
};
