const crypto = require('crypto');
const { STRING, DATE, DATEONLY, UUID, NOW, INTEGER } = require('sequelize');
const sequelize = require('../databases/sequelize');
const { generateId } = require('../utils/generateId');
const { roles } = require('../utils/roles-permissions');
// TODO - Include record of who created a user, admin, or superUser
const User = sequelize.define('user', {
  userId: {
    type: UUID,
    allowNull: false,
    primaryKey: true,
    unique: true,
    defaultValue: () => generateId(),
  },

  firstName: {
    type: STRING,
    allowNull: false,
  },

  lastName: {
    type: STRING,
    allowNull: false,
  },

  otherNames: {
    type: STRING,
    allowNull: true,
  },

  displayName: {
    type: STRING,
    allowNull: false,
    unique: true,
  },

  birthdate: {
    type: DATEONLY,
    allowNull: false,
  },

  gender: {
    type: STRING,
    allowNull: false,
    unique: false,
    validate: {
      isIn: {
        args: [['M', 'F']],
        msg: 'Gender must be M or F',
      },
    },
  },

  country: {
    type: STRING,
    allowNull: false,
    unique: false,
  },

  email: {
    type: STRING,
    allowNull: false,
    unique: true,
  },

  phoneNumber: {
    type: INTEGER,
    allowNull: false,
  },

  address: {
    type: STRING,
    allowNull: false,
  },

  profilePicture: {
    type: STRING,
    allowNull: false,
  },

  role: {
    type: STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [[...roles]],
        msg: 'Invalid user type',
      },
    },
  },

  passwordHash: {
    type: STRING,
    allowNull: false,
  },

  passwordResetToken: {
    type: STRING,
    allowNull: true,
  },

  passwordResetExpires: {
    type: DATE,
    allowNull: true,
  },

  passwordChangedAt: {
    type: DATE,
    allowNull: false,
    defaultValue: NOW,
  },
});

User.prototype.format = function () {
  return formatUser(this.toJSON());
};

User.prototype.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

User.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.updatedAt && this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
};

/**
 * Generates the full name of the user.
 * @param {*} User Requires an instance of the user.
 * @returns the full name of the user
 */
User.prototype.getFullName = function () {
  return `${this.lastName} ${this.otherNames ? this.otherNames : ''} ${
    this.firstName
  }`;
};

/**
 * Removes sensitive data from the formatted User object
 * @param {*} userJsonData formatted user data
 * @returns Object containing unsinsitive data
 */
function formatUser(userJsonData) {
  const {
    passwordHash,
    passwordResetToken,
    passwordResetExpires,
    passwordChangedAt,
    ...formatedUserData
  } = userJsonData;

  return formatedUserData;
}

module.exports = User;
