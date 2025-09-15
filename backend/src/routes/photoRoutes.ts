import express, { Router } from 'express';
import { uploadFiles, processPhotos } from '../controllers/photoController';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router: Router = express.Router();

// Route for uploading event photos and portrait
router.post('/upload', uploadMiddleware, uploadFiles);

// Route for processing photos and creating ZIP
router.post('/process', processPhotos);

// Route for downloading the resulting ZIP
router.get('/download/:fileName', (req, res) => {
  const { fileName } = req.params;
  const filePath = `${process.cwd()}/temp/${fileName}`;
  res.download(filePath, fileName, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
});

export default router;