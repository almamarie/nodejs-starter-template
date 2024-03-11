const logger = require('../logs/logger');
const AppError = require('../utils/appError');

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.errors[0].path}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const message = `Invalid input data. ${err.errors[0].message}`;
  return new AppError(message, 400);
};

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleMulterError = () => new AppError('Invalid file', 400);

const sendErrorDev = (err, res) => {
  // console.log('\n\nHere\n\n');
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('Send Prod ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  try {
    logger.error(err);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err };
      error.message = err.message;

      if (error.name === 'SequelizeUniqueConstraintError')
        error = handleDuplicateFieldsDB(error);
      if (error.name === 'SequelizeValidationError')
        error = handleValidationErrorDB(error);
      if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
      if (error.name === 'MulterError') error = handleMulterError();

      sendErrorProd(error, res);
    }
  } catch (err) {
    const error = new AppError('Something went very wrong!', 500);
    logger.error(error);

    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
      sendErrorProd(error, res);
    }
  }
};
