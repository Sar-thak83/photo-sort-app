import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  private readonly tempDir = path.join(process.cwd(), 'temp');
  
  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Extract a ZIP file to a temporary directory
   */
  async extractZip(zipPath: string): Promise<string> {
    try {
      const extractDir = path.join(this.tempDir, `extract_${uuidv4()}`);

      // Create extraction directory
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }

      // Extract ZIP file
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractDir, true);

      // Log extracted files for debugging
      const extractedFiles = fs.readdirSync(extractDir);
      console.log(`[FileService] Extracted files to ${extractDir}:`, extractedFiles);

      return extractDir;
    } catch (error) {
      console.error('Error extracting ZIP file:', error);
      throw new Error('Failed to extract ZIP file');
    }
  }

  /**
   * Create a ZIP file with matched photos
   */
  async createResultZip(matchedPhotos: string[], userName: string): Promise<string> {
    try {
      const sanitizedUserName = this.sanitizeFileName(userName);
      const resultZipPath = path.join(this.tempDir, `${sanitizedUserName}_photos_${Date.now()}.zip`);
      
      const zip = new AdmZip();
      
      // Add each matched photo to the ZIP
      matchedPhotos.forEach((photoPath, index) => {
        const photoName = path.basename(photoPath);
        zip.addLocalFile(photoPath, '', photoName);
      });
      
      // Write the ZIP file
      zip.writeZip(resultZipPath);
      
      return resultZipPath;
    } catch (error) {
      console.error('Error creating result ZIP:', error);
      throw new Error('Failed to create result ZIP');
    }
  }

  /**
   * Clean up temporary files and directories
   */
  cleanupFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error(`Error cleaning up ${filePath}:`, error);
      }
    });
  }

  /**
   * Schedule cleanup of a file after a delay
   */
  scheduleCleanup(filePath: string, delayMs: number = 3600000): void { // Default: 1 hour
    setTimeout(() => {
      this.cleanupFiles([filePath]);
    }, delayMs);
  }

  /**
   * Sanitize a filename to prevent directory traversal and invalid characters
   */
  private sanitizeFileName(fileName: string): string {
    // Remove path traversal characters and common invalid filename characters
    return fileName
      .replace(/[/\\?%*:|"<>]/g, '_') // Replace invalid chars with underscore
      .replace(/\s+/g, '_')            // Replace spaces with underscore
      .substring(0, 100);              // Limit length
  }
}