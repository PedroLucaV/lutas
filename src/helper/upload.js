// src/utils/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'comp';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.body.id;
    let filename;

    if (file.fieldname === 'fotoCompetidor') {
      filename = `competidor${id}${ext}`;
    } else if (file.fieldname === 'equipeImg') {
      filename = `equipe${id}${ext}`;
    } else if (file.fieldname === 'fotoResp') {
      filename = `docRes${id}${ext}`;
    } else {
      filename = `arquivo-${id}-${Date.now()}${ext}`;
    }

    cb(null, filename);
  }
});

const upload = multer({ storage });

export default upload;
