const User = require("../models/User");

async function getUserById(id) {
  return User.findUnique({ where: { id } });
}

async function updateUser(id, { fullName, mobile, bio, photo }) {
  const data = {};
  if (fullName !== undefined) data.fullName = fullName;
  if (mobile !== undefined) data.mobile = mobile;
  if (bio !== undefined) data.bio = bio;
  if (photo !== undefined) data.photo = photo;

  return User.update({ where: { id }, data });
}

module.exports = { getUserById, updateUser };
