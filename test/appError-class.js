const AppError = require('../src/utils/appError');

const expect = require('chai').expect;

describe('App Error Class', function () {
  describe('Parameter Checks', function () {
    it('should throw TypeError when Null is passed as message', function () {
      const createAppError = () => {
        new AppError(null, 404);
      };

      expect(createAppError).to.throw(TypeError, 'Missing parameter: message');
    });

    it('should throw TypeError when Null is passed as statusCode', function () {
      const createAppError = () => {
        new AppError('No message provided', null);
      };
      expect(createAppError).to.throw(
        TypeError,
        'Missing parameter: statusCode'
      );
    });

    it('should throw TypeError when an empty string is passed as message', function () {
      const createAppError = () => {
        new AppError('', 404);
      };
      expect(createAppError).to.throw(TypeError, 'Invalid message');
    });

    it('should throw TypeError when no statusCode or message is provided', function () {
      const createAppError = () => {
        new AppError('No message provided');
      };

      expect(createAppError).to.throw(TypeError, 'Invalid parameter length');
    });

    it('should throw TypeError when an invalid statusCode is provided', function () {
      let statusCode = 99;
      let createAppError = () => {
        new AppError('No message provided', statusCode);
      };

      expect(createAppError).to.throw(
        TypeError,
        `Invalid statusCode: ${statusCode}`
      );

      statusCode = 600;
      createAppError = () => {
        new AppError('No message provided', statusCode);
      };

      expect(createAppError).to.throw(
        TypeError,
        `Invalid statusCode: ${statusCode}`
      );
    });

    it('Should properly set the parameters', function () {
      const message = 'Invalid message passes';
      const statusCode = 404;
      const newError = new AppError(message, statusCode);

      expect(newError.message).to.equal(message);
      expect(newError.statusCode).to.equal(statusCode);
      expect(newError.isOperational).to.be.true;
    });

    it('Should have a status of fail when error code starts with 400 and error otherwise', function () {
      const message = 'Invalid message passes';
      let statusCode = 404;
      let newError = new AppError(message, statusCode);

      expect(newError.status).to.equal('fail');

      statusCode = 500;
      newError = new AppError(message, statusCode);

      expect(newError.status).to.equal('error');
    });
  });
});
