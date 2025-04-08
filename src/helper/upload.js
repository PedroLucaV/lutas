import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'images/campeonato/users/competidor';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    let filename;

    if (file.fieldname === 'fotoCompetidor') {
      filename = `competidor-${timestamp}${ext}`;
    } else if (file.fieldname === 'equipeImg') {
      filename = `equipe-${timestamp}${ext}`;
    } else if (file.fieldname === 'fotoResp') {
      filename = `docRes-${timestamp}${ext}`;
    } else {
      filename = `arquivo-${timestamp}${ext}`;
    }

    cb(null, filename);
  }
});

const upload = multer({ storage });

export default upload;
