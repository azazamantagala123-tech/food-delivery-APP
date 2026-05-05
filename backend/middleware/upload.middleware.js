const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ ensure folder exists
const uploadPath = path.join(__dirname, "../uploads/kyc");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, png, pdf allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;