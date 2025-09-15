// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Ensure upload directories exist
// const uploadDir = path.join(process.cwd(), 'uploads');
// const tempDir = path.join(process.cwd(), 'temp');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Generate unique filename with timestamp
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//   },
// });

// // File filter to accept only images and zip files
// const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   // Accept images and zip files
//   if (
//     file.mimetype.startsWith('image/') ||
//     file.mimetype === 'application/zip' ||
//     file.mimetype === 'application/x-zip-compressed'
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images and ZIP files are allowed'));
//   }
// };

// // Configure multer
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB max file size
//   },
// });

// // Middleware to handle file uploads
// export const uploadMiddleware = upload.fields([
//   { name: 'eventPhotos', maxCount: 1 }, // ZIP file containing event photos
//   { name: 'portrait', maxCount: 1 }, // User's portrait photo
// ]);

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads');
const tempDir = path.join(process.cwd(), 'temp');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Storing file ${file.fieldname} in ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log(`Generated filename: ${filename} for field: ${file.fieldname}`);
    cb(null, filename);
  },
});

// File filter to accept only images and zip files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log(`Filtering file: ${file.originalname}, mimetype: ${file.mimetype}, fieldname: ${file.fieldname}`);
  
  // Accept images and zip files
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/zip' ||
    file.mimetype === 'application/x-zip-compressed' ||
    file.mimetype === 'application/octet-stream' // Sometimes zip files come as this
  ) {
    console.log(`File ${file.originalname} accepted`);
    cb(null, true);
  } else {
    console.log(`File ${file.originalname} rejected - invalid mimetype: ${file.mimetype}`);
    cb(new Error(`Only images and ZIP files are allowed. Received: ${file.mimetype}`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 2, // Maximum 2 files
  },
});

// Create the multer middleware
const multerMiddleware = upload.fields([
  { name: 'eventPhotos', maxCount: 1 }, // ZIP file containing event photos
  { name: 'portrait', maxCount: 1 }, // User's portrait photo
]);

// Wrapper middleware with better error handling
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('Upload middleware triggered');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request method:', req.method);
  
  multerMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ 
            error: 'File too large. Maximum size is 50MB.',
            code: err.code 
          });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({ 
            error: 'Too many files. Maximum is 2 files.',
            code: err.code 
          });
        case 'LIMIT_FIELD_KEY':
          return res.status(400).json({ 
            error: 'Field name too long.',
            code: err.code 
          });
        case 'LIMIT_FIELD_VALUE':
          return res.status(400).json({ 
            error: 'Field value too long.',
            code: err.code 
          });
        case 'LIMIT_FIELD_COUNT':
          return res.status(400).json({ 
            error: 'Too many fields.',
            code: err.code 
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({ 
            error: 'Unexpected field. Expected: eventPhotos, portrait',
            code: err.code 
          });
        default:
          return res.status(400).json({ 
            error: 'Upload error: ' + err.message,
            code: err.code 
          });
      }
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: err.message || 'File upload failed' 
      });
    }
    
    // Log successful upload
    console.log('Files processed by multer:', req.files);
    next();
  });
};