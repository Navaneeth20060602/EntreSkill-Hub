const asyncHandler = require("express-async-handler");
const certificateService = require("../services/certificateService");
const { sendSuccess, sendError } = require("../utils/response");

const issueCertificate = asyncHandler(async (req, res) => {
  const { userId, businessTitle } = req.body;
  if (!userId || !businessTitle || !req.file) {
    return sendError(res, { status: 400, message: "userId, businessTitle and a certificate file are required." });
  }

  const fileUrl = `/uploads/certificates/${req.file.filename}`;
  const certificate = await certificateService.issueCertificate({ userId, businessTitle, fileUrl });
  sendSuccess(res, { status: 201, message: "Certificate issued.", data: { certificate } });
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.listForUser(req.user.id);
  sendSuccess(res, { data: { certificates } });
});

const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.listAll();
  sendSuccess(res, { data: { certificates } });
});

module.exports = { issueCertificate, getMyCertificates, getAllCertificates };
