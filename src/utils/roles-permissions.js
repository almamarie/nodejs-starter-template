const user = [
  // user
  'create:user',
  'get:user-details',
  'patch:user-details',
];

const admin = [
  // user
  'get:user',
];

const superadmin = [
  // admin
  'create:admin',
  'get:admin-user',
  'patch:admin-user',
  'delete:admin-user',
  ...admin,
];
const permissions = {
  user,
  admin,
  superadmin,
};

exports.permissions = permissions;
exports.roles = Object.keys(permissions);
