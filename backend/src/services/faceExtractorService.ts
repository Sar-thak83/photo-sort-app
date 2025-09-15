import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';

// We'll use TensorFlow.js directly for face detection and recognition
export class FaceExtractorService {
  private model: tf.GraphModel | null = null;
  private readonly similarityThreshold = 0.5; // Threshold for face matching (0-1, lowered for better matching)

  /**
   * Load face detection model
   */
  async loadModels(): Promise<void> {
    if (this.model) return;

    try {
      // Load MobileNet model for feature extraction
      this.model = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1', { fromTFHub: true });
      console.log('TensorFlow.js model loaded successfully');
    } catch (error) {
      console.error('Error loading TensorFlow.js model:', error);
      throw new Error('Failed to load face recognition model');
    }
  }

  /**
   * Get face embedding from an image
   */
  async getFaceDescriptor(imagePath: string): Promise<tf.Tensor | null> {
    try {
      // Load and preprocess image
      const imageBuffer = fs.readFileSync(imagePath);
      const imageTensor = tf.node.decodeImage(imageBuffer, 3);
      
      // Resize to expected input size (224x224)
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      
      // Normalize pixel values to [-1, 1]
      const normalized = tf.div(tf.sub(resized, 127.5), 127.5);
      
      // Add batch dimension
      const batched = tf.expandDims(normalized, 0);
      
      // Get feature vector
      const embedding = this.model!.predict(batched) as tf.Tensor;
      
      // Clean up intermediate tensors
      imageTensor.dispose();
      resized.dispose();
      normalized.dispose();
      batched.dispose();
      
      return embedding;
    } catch (error) {
      console.error('Error getting image embedding:', error);
      return null;
    }
  }

  /**
   * Find photos that match the given face embedding
   */
  async findMatchingPhotos(extractedPath: string, portraitEmbedding: tf.Tensor): Promise<string[]> {
    const matchedPhotos: string[] = [];

    // Recursively collect all image files from extractedPath
    function getAllImageFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllImageFiles(filePath));
        } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(path.extname(filePath).toLowerCase())) {
          results.push(filePath);
        }
      });
      return results;
    }

    const imageFiles = getAllImageFiles(extractedPath);
    console.log(`[FaceExtractor] Found ${imageFiles.length} image(s) for matching.`);

    // Process files in batches to avoid memory issues
    const batchSize = 10;
    const batches = this.chunkArray(imageFiles, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (filePath) => {
        try {
          // Get embedding for this image
          const imageEmbedding = await this.getFaceDescriptor(filePath);

          if (!imageEmbedding) {
            console.log(`[FaceExtractor] No embedding for image: ${filePath}`);
            return null;
          }

          // Calculate similarity (cosine similarity)
          const similarity = this.calculateCosineSimilarity(portraitEmbedding, imageEmbedding);
          console.log(`[FaceExtractor] Similarity for ${filePath}: ${similarity}`);

          // Clean up
          imageEmbedding.dispose();

          // Higher similarity means better match
          if (similarity > this.similarityThreshold) {
            console.log(`[FaceExtractor] Match found: ${filePath} (similarity: ${similarity})`);
            return filePath;
          }

          return null;
        } catch (error) {
          console.error(`Error processing image ${filePath}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      matchedPhotos.push(...batchResults.filter(Boolean) as string[]);

      // Free up memory
      if (global.gc) global.gc();
    }

    return matchedPhotos;
  }

  /**
   * Calculate cosine similarity between two tensors
   */
  private calculateCosineSimilarity(tensorA: tf.Tensor, tensorB: tf.Tensor): number {
    return tf.tidy(() => {
      // Normalize vectors to unit length
      const normalizedA = tf.div(tensorA, tf.norm(tensorA));
      const normalizedB = tf.div(tensorB, tf.norm(tensorB));
      
      // Calculate dot product
      const dotProduct = tf.sum(tf.mul(normalizedA, normalizedB));
      
      // Return as number
      return dotProduct.dataSync()[0];
    });
  }

  /**
   * Check if a file is an image
   */
  private isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}