import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';

const uploadsPath = path.resolve(process.cwd(), env.uploadsDir);
fs.mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
