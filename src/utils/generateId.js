const crypto = require('crypto');

const { v4: uuidv4 } = require('uuid');

exports.generateId = () => {
  const uniqueId = uuidv4().substring(0, 10);
  return hashUUID(uniqueId);
};

function hashUUID(uuid) {
  const hash = crypto.createHash('sha256');
  hash.update(uuid);
  const digest = hash.digest('hex');
  return digest.substring(0, 15);
}
