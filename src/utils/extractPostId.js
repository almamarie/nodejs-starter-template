const AppError = require('./appError');

/**
 * Extracts an ID from a request object
 *
 * @param {Request} req a request object
 * @param {string} idName the name of the ID to extract
 * @returns projectId or undefined
 */

function extractId(req, idName, next) {
  const id = req.params[idName] ? req.params[idName] : req.body[idName];

  if (!id) next(new AppError(`${idName} not provided`, 400));

  return id;
}

module.exports = extractId;
