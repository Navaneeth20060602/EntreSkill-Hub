const asyncHandler = require("express-async-handler");
const userService = require("../services/userService");
const { sendSuccess } = require("../utils/response");
const { sanitizeUser } = require("../utils/helpers");

const updateMe = asyncHandler(async (req, res) => {
  const { fullName, mobile, bio } = req.body;
  const photo = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;

  const user = await userService.updateUser(req.user.id, { fullName, mobile, bio, photo });

  sendSuccess(res, {
    message: "Profile updated successfully.",
    data: { user: sanitizeUser(user) },
  });
});

module.exports = { updateMe };
