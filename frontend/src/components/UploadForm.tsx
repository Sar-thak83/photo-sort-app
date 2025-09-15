
'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';

interface UploadFormProps {
  onUploadSuccess: (data: {
    eventPhotosPath: string;
    portraitPath: string;
    userName: string;
    message: string;
  }) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [eventPhotos, setEventPhotos] = useState<File | null>(null);
  const [portrait, setPortrait] = useState<File | null>(null);
  const [userName, setUserName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleEventPhotosChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventPhotos(e.target.files[0]);
    }
  };

  const handlePortraitChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPortrait(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!eventPhotos || !portrait || !userName) {
      alert('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('eventPhotos', eventPhotos);
    formData.append('portrait', portrait);
    formData.append('userName', userName);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      // Pass the correct shape to parent
      onUploadSuccess({
        eventPhotosPath: data.eventPhotosPath,
        portraitPath: data.portraitPath,
        userName: data.userName,
        message: data.message,
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setEventPhotos(null);
    setPortrait(null);
    setUserName('');
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload Your Files</h2>
        <p className="text-sm text-gray-600 mb-6">
          Upload a ZIP file containing all event photos and your portrait photo to find your pictures.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Photos (ZIP file)
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={handleEventPhotosChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          {eventPhotos && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {eventPhotos.name} ({(eventPhotos.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Portrait Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePortraitChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          {portrait && (
            <div className="mt-2 flex items-center">
              <div className="w-16 h-16 overflow-hidden rounded-md">
                {/* Use Next.js Image for optimization */}
                <Image
                  src={URL.createObjectURL(portrait)}
                  alt="Portrait preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="ml-3 text-xs text-gray-500">
                {portrait.name} ({(portrait.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isUploading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your name"
            required
          />
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={resetForm}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isUploading || !eventPhotos || !portrait || !userName}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;


