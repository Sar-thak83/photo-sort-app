
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-8 bg-gradient-to-br from-purple-200 via-blue-100 to-teal-100 shadow-2xl rounded-3xl p-10 border border-blue-200 animate-fade-in"
    >
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-2 text-purple-700 animate-fade-in">Upload Your Files</h2>
        <p className="text-base text-blue-600 mb-6 animate-fade-in-slow">
          Upload a ZIP of event photos and your portrait to find your pictures using face recognition.
        </p>
      </div>

  <div className="space-y-6">
        <div className="transition-all duration-300">
          <label className="block text-sm font-semibold text-purple-700 mb-1">Event Photos (ZIP file)</label>
          <input
            type="file"
            accept=".zip"
            onChange={handleEventPhotosChange}
            disabled={isUploading}
            className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-200 file:to-blue-200 file:text-blue-700 hover:file:bg-blue-200 focus:file:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          {eventPhotos && (
            <p className="mt-2 text-xs text-purple-600 animate-fade-in">
              Selected: <span className="font-semibold">{eventPhotos.name}</span> ({(eventPhotos.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="transition-all duration-300">
          <label className="block text-sm font-semibold text-purple-700 mb-1">Your Portrait Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePortraitChange}
            disabled={isUploading}
            className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-200 file:to-blue-200 file:text-blue-700 hover:file:bg-blue-200 focus:file:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          {portrait && (
            <div className="mt-3 flex items-center animate-fade-in">
              <div className="w-16 h-16 overflow-hidden rounded-full border-2 border-purple-200 shadow-lg animate-scale-in">
                <Image
                  src={URL.createObjectURL(portrait)}
                  alt="Portrait preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="ml-3 text-xs text-purple-600">
                <span className="font-semibold">{portrait.name}</span> ({(portrait.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>

        <div className="transition-all duration-300">
          <label className="block text-sm font-semibold text-purple-700 mb-1">Your Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isUploading}
            className="mt-1 block text-black font-semibold w-full px-3 py-2 border border-purple-200 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            placeholder="Enter your name"
            required
          />
        </div>
      </div>

      {isUploading && (
        <div className="mt-6 animate-fade-in-slow">
          <div className="w-full bg-gradient-to-r from-purple-200 via-blue-100 to-teal-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 h-3 rounded-full animate-progress"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-purple-700 mt-2 text-center animate-pulse">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={resetForm}
          disabled={isUploading}
          className="px-5 py-2 text-sm font-semibold text-purple-700 bg-white border border-purple-200 rounded-lg shadow hover:bg-purple-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isUploading || !eventPhotos || !portrait || !userName}
          className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 border border-transparent rounded-lg shadow hover:scale-105 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload Files'}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;

