const multer = require('multer');
const path = require('path');

// Set storage untuk menyimpan file di folder 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // get extension file 
    cb(null, Date.now() + ext); // add timestamp 
  }
});

// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); 
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal file 5MB
  fileFilter: fileFilter
});

module.exports = { uploadImage };
