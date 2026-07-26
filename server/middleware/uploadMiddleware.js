const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", "mentors")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `mentor-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (/^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files (jpg, png, webp) are allowed."));
}

const uploadMentorPhoto = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", "resources")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resource-${Date.now()}${ext}`);
  },
});

function videoFileFilter(req, file, cb) {
  const allowed = /^video\//.test(file.mimetype) ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (allowed) return cb(null, true);
  cb(new Error("Only video, PDF, or Word document files are allowed."));
}

const uploadResourceVideo = multer({
  storage: resourceStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

// A generic profile-photo uploader (users & mentors editing their own photo)
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", "profiles")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const uploadProfilePhoto = multer({ storage: profileStorage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

const certStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads", "certificates")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `certificate-${Date.now()}${ext}`);
  },
});

function certFileFilter(req, file, cb) {
  const allowed = file.mimetype === "application/pdf" || /^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype);
  if (allowed) return cb(null, true);
  cb(new Error("Only PDF or image files are allowed for certificates."));
}

const uploadCertificate = multer({ storage: certStorage, fileFilter: certFileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadMentorPhoto, uploadResourceVideo, uploadProfilePhoto, uploadCertificate };
