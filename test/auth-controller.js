const { expect } = require('chai');
const authController = require('../src/controllers/authController');
describe('Auth - Sign in', function () {
  it('it should throw an error when no profile picture is provided', function () {
    const req = {};
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

    const next = (appError) => {
      this.error = appError;
    };
    const signUpFunction = authController.signup('user');
    signUpFunction(req, res, next);
  });
});
