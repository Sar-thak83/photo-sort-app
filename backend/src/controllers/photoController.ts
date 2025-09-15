// import { Request, Response } from 'express';
// import path from 'path';
// import fs from 'fs';
// import * as tf from '@tensorflow/tfjs-node';
// import { FaceExtractorService } from '../services/faceExtractorService';
// import { FileService } from '../services/fileService';

// // Initialize services
// const faceExtractorService = new FaceExtractorService();
// const fileService = new FileService();

// // Handle file uploads
// export const uploadFiles = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
//     if (!files.eventPhotos || !files.portrait) {
//       return res.status(400).json({ error: 'Missing required files' });
//     }

//     const eventPhotosPath = files.eventPhotos[0].path;
//     const portraitPath = files.portrait[0].path;
//     const userName = req.body.userName || 'user';

//     // Return file paths for processing
//     res.status(200).json({
//       eventPhotosPath,
//       portraitPath,
//       userName,
//       message: 'Files uploaded successfully',
//     });
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     res.status(500).json({ error: 'Failed to upload files' });
//   }
// };

// // Process photos using face recognition
// export const processPhotos = async (req: Request, res: Response) => {
//   try {
//     const { eventPhotosPath, portraitPath, userName } = req.body;

//     if (!eventPhotosPath || !portraitPath || !userName) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Initialize TensorFlow.js model if not already loaded
//     await faceExtractorService.loadModels();

//     // Extract event photos from ZIP
//     const extractedPath = await fileService.extractZip(eventPhotosPath);

//     // Get face embedding from portrait
//     const portraitEmbedding = await faceExtractorService.getFaceDescriptor(portraitPath);
    
//     if (!portraitEmbedding) {
//       return res.status(400).json({ error: 'Failed to process portrait image' });
//     }

//     // Process event photos to find matches
//     const matchedPhotos = await faceExtractorService.findMatchingPhotos(extractedPath, portraitEmbedding);

//     // Clean up tensor
//     portraitEmbedding.dispose();

//     if (matchedPhotos.length === 0) {
//       return res.status(404).json({ error: 'No matching photos found' });
//     }

//     // Create result ZIP file
//     const resultZipPath = await fileService.createResultZip(matchedPhotos, userName);

//     // Clean up temporary files
//     fileService.cleanupFiles([eventPhotosPath, portraitPath, extractedPath]);

//     // Schedule cleanup of the result ZIP file after 1 hour
//     fileService.scheduleCleanup(resultZipPath, 3600000);

//     // Return the path to the result ZIP file
//     res.status(200).json({
//       resultZipPath: path.basename(resultZipPath),
//       matchCount: matchedPhotos.length,
//       message: 'Photos processed successfully',
//     });
//   } catch (error) {
//     console.error('Error processing photos:', error);
//     res.status(500).json({ error: 'Failed to process photos' });
//   }
// };

// import { Request, Response } from 'express';
// import path from 'path';
// import fs from 'fs';
// import * as tf from '@tensorflow/tfjs-node';
// import { FaceExtractorService } from '../services/faceExtractorService';
// import { FileService } from '../services/fileService';

// // Initialize services
// const faceExtractorService = new FaceExtractorService();
// const fileService = new FileService();

// // Handle file uploads
// export const uploadFiles = async (req: Request, res: Response) => {
//   try {
//     // Debug logging
//     console.log('Content-Type:', req.headers['content-type']);
//     console.log('req.files:', req.files);
//     console.log('req.body:', req.body);
//     console.log('req.file:', req.file);
    
//     // Check if files exist
//     if (!req.files) {
//       console.error('No files object found in request');
//       return res.status(400).json({ 
//         error: 'No files uploaded',
//         debug: {
//           contentType: req.headers['content-type'],
//           hasFiles: !!req.files,
//           hasFile: !!req.file
//         }
//       });
//     }

//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
//     // More detailed logging
//     console.log('Available file fields:', Object.keys(files));
    
//     if (!files.eventPhotos || !files.portrait) {
//       return res.status(400).json({ 
//         error: 'Missing required files',
//         received: Object.keys(files),
//         expected: ['eventPhotos', 'portrait']
//       });
//     }

//     // Check if files arrays have content
//     if (!files.eventPhotos[0] || !files.portrait[0]) {
//       return res.status(400).json({ 
//         error: 'Empty file arrays',
//         eventPhotos: files.eventPhotos?.length || 0,
//         portrait: files.portrait?.length || 0
//       });
//     }

//     const eventPhotosPath = files.eventPhotos[0].path;
//     const portraitPath = files.portrait[0].path;
//     const userName = req.body.userName || 'user';

//     // Verify files exist on disk
//     if (!fs.existsSync(eventPhotosPath)) {
//       return res.status(400).json({ error: 'Event photos file not found on disk' });
//     }
//     if (!fs.existsSync(portraitPath)) {
//       return res.status(400).json({ error: 'Portrait file not found on disk' });
//     }

//     console.log('Files uploaded successfully:', {
//       eventPhotos: eventPhotosPath,
//       portrait: portraitPath,
//       userName
//     });

//     // Return file paths for processing
//     res.status(200).json({
//       eventPhotosPath,
//       portraitPath,
//       userName,
//       message: 'Files uploaded successfully',
//     });
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     res.status(500).json({ 
//       error: 'Failed to upload files',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// // Process photos using face recognition
// export const processPhotos = async (req: Request, res: Response) => {
//   try {
//     const { eventPhotosPath, portraitPath, userName } = req.body;

//     if (!eventPhotosPath || !portraitPath || !userName) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Verify files still exist
//     if (!fs.existsSync(eventPhotosPath)) {
//       return res.status(400).json({ error: 'Event photos file not found' });
//     }
//     if (!fs.existsSync(portraitPath)) {
//       return res.status(400).json({ error: 'Portrait file not found' });
//     }

//     // Initialize TensorFlow.js model if not already loaded
//     await faceExtractorService.loadModels();

//     // Extract event photos from ZIP
//     const extractedPath = await fileService.extractZip(eventPhotosPath);

//     // Get face embedding from portrait
//     const portraitEmbedding = await faceExtractorService.getFaceDescriptor(portraitPath);
    
//     if (!portraitEmbedding) {
//       return res.status(400).json({ error: 'Failed to process portrait image' });
//     }

//     // Process event photos to find matches
//     const matchedPhotos = await faceExtractorService.findMatchingPhotos(extractedPath, portraitEmbedding);

//     // Clean up tensor
//     portraitEmbedding.dispose();

//     if (matchedPhotos.length === 0) {
//       return res.status(404).json({ error: 'No matching photos found' });
//     }

//     // Create result ZIP file
//     const resultZipPath = await fileService.createResultZip(matchedPhotos, userName);

//     // Clean up temporary files
//     fileService.cleanupFiles([eventPhotosPath, portraitPath, extractedPath]);

//     // Schedule cleanup of the result ZIP file after 1 hour
//     fileService.scheduleCleanup(resultZipPath, 3600000);

//     // Return the path to the result ZIP file
//     res.status(200).json({
//       resultZipPath: path.basename(resultZipPath),
//       matchCount: matchedPhotos.length,
//       message: 'Photos processed successfully',
//     });
//   } catch (error) {
//     console.error('Error processing photos:', error);
//     res.status(500).json({ 
//       error: 'Failed to process photos',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';
import { FaceExtractorService } from '../services/faceExtractorService';
import { FileService } from '../services/fileService';

// Initialize services
const faceExtractorService = new FaceExtractorService();
const fileService = new FileService();

// Handle file uploads
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    // Debug logging
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    // Check if files exist
    if (!req.files) {
      console.error('No files object found in request');
      return res.status(400).json({ 
        error: 'No files uploaded',
        debug: {
          contentType: req.headers['content-type'],
          hasFiles: !!req.files,
          hasFile: !!req.file
        }
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // More detailed logging
    console.log('Available file fields:', Object.keys(files));
    
    if (!files.eventPhotos || !files.portrait) {
      return res.status(400).json({ 
        error: 'Missing required files',
        received: Object.keys(files),
        expected: ['eventPhotos', 'portrait']
      });
    }

    // Check if files arrays have content
    if (!files.eventPhotos[0] || !files.portrait[0]) {
      return res.status(400).json({ 
        error: 'Empty file arrays',
        eventPhotos: files.eventPhotos?.length || 0,
        portrait: files.portrait?.length || 0
      });
    }

    const eventPhotosPath = files.eventPhotos[0].path;
    const portraitPath = files.portrait[0].path;
    const userName = req.body.userName || 'user';

    // Verify files exist on disk
    if (!fs.existsSync(eventPhotosPath)) {
      return res.status(400).json({ error: 'Event photos file not found on disk' });
    }
    if (!fs.existsSync(portraitPath)) {
      return res.status(400).json({ error: 'Portrait file not found on disk' });
    }

    console.log('Files uploaded successfully:', {
      eventPhotos: eventPhotosPath,
      portrait: portraitPath,
      userName
    });

    // Return file paths for processing
    res.status(200).json({
      eventPhotosPath,
      portraitPath,
      userName,
      message: 'Files uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ 
      error: 'Failed to upload files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process photos using face recognition
export const processPhotos = async (req: Request, res: Response) => {
  try {
    // Debug logging for process endpoint
    console.log('Process endpoint - Content-Type:', req.headers['content-type']);
    console.log('Process endpoint - req.body:', req.body);
    
    const { eventPhotosPath, portraitPath, userName } = req.body;

    if (!eventPhotosPath || !portraitPath || !userName) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        received: { eventPhotosPath, portraitPath, userName }
      });
    }

    // Verify files still exist
    if (!fs.existsSync(eventPhotosPath)) {
      return res.status(400).json({ error: 'Event photos file not found' });
    }
    if (!fs.existsSync(portraitPath)) {
      return res.status(400).json({ error: 'Portrait file not found' });
    }

    // Initialize TensorFlow.js model if not already loaded
    await faceExtractorService.loadModels();

    // Extract event photos from ZIP
    const extractedPath = await fileService.extractZip(eventPhotosPath);

    // Get face embedding from portrait
    const portraitEmbedding = await faceExtractorService.getFaceDescriptor(portraitPath);
    
    if (!portraitEmbedding) {
      return res.status(400).json({ error: 'Failed to process portrait image' });
    }

    // Process event photos to find matches
    const matchedPhotos = await faceExtractorService.findMatchingPhotos(extractedPath, portraitEmbedding);

    // Clean up tensor
    portraitEmbedding.dispose();

    if (matchedPhotos.length === 0) {
      return res.status(404).json({ error: 'No matching photos found' });
    }

    // Create result ZIP file
    const resultZipPath = await fileService.createResultZip(matchedPhotos, userName);

    // Clean up temporary files
    fileService.cleanupFiles([eventPhotosPath, portraitPath, extractedPath]);

    // Schedule cleanup of the result ZIP file after 1 hour
    fileService.scheduleCleanup(resultZipPath, 3600000);

    // Return the path to the result ZIP file
    res.status(200).json({
      resultZipPath: path.basename(resultZipPath),
      matchCount: matchedPhotos.length,
      message: 'Photos processed successfully',
    });
  } catch (error) {
    console.error('Error processing photos:', error);
    res.status(500).json({ 
      error: 'Failed to process photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};