class AppError extends Error {
  constructor(message, statusCode) {
    const parameterLength = arguments.length;
    if (parameterLength !== 2) {
      throw new TypeError('Invalid parameter length');
    }

    if (message === null) {
      throw new TypeError('Missing parameter: message');
    }

    if (message === '') {
      throw new TypeError('Invalid message');
    }

    if (statusCode === null) {
      throw new TypeError('Missing parameter: statusCode');
    }

    if (statusCode > 599 || statusCode < 100) {
      throw new TypeError(`Invalid statusCode: ${statusCode}`);
    }

    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
