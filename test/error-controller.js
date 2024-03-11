const { expect } = require('chai');
const sinon = require('sinon');
const errorController = require('../src/controllers/errorController');
const AppError = require('../src/utils/appError');
const logger = require('../src/logs/logger');

describe('Error Controller', function () {
  describe('Development Errors', function () {
    before(() => {
      process.env.NODE_ENV = 'development';
    });
    it('should return development error structure', function () {
      const statusCode = 400;
      const errorMessage = 'An error occured';

      const res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },

        json: function (data) {
          this.status = data.status;
          this.error = data.error;
          this.message = data.message;
          this.stack = data.stack;
          return this;
        },
      };
      const error = {
        statusCode,
        status: 'fail',
        message: errorMessage,
        stack:
          'Error\n    at Query.run (/Users/digitalhouse/Documents/src/starter-codes/nodejs/nodejs-starter-template/node_modules/sequelize/lib/dialects/mysql/query.js:52:25)\n',
      };

      sinon.stub(logger, 'error');
      logger.error.returns('');

      errorController(error, {}, res, () => {});
      const response = res.error;
      expect(response).to.have.property('statusCode', statusCode);
      expect(response).to.have.property('status', 'fail');
      expect(res).to.have.property('error', error);
      expect(response).to.have.property('stack', error.stack);
    });
  });
});
