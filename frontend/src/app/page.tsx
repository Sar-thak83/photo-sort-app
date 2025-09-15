'use client';

import { useState} from 'react';
import UploadForm from '@/components/UploadForm';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultDownload from '@/components/ResultDownload';

export default function Home() {

  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'download'>('upload');
  const [uploadData, setUploadData] = useState<{
    eventPhotosPath: string;
    portraitPath: string;
    userName: string;
  } | null>(null);
  const [resultData, setResultData] = useState<{
    resultZipPath: string;
    matchCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Called when upload is successful
  const handleUploadSuccess = (data: {
    eventPhotosPath: string;
    portraitPath: string;
    userName: string;
    message: string;
  }) => {
    setUploadData({
      eventPhotosPath: data.eventPhotosPath,
      portraitPath: data.portraitPath,
      userName: data.userName,
    });
    setCurrentStep('processing');
    processPhotos({
      eventPhotosPath: data.eventPhotosPath,
      portraitPath: data.portraitPath,
      userName: data.userName,
    });
  };

  // Call /api/process with file paths
  const processPhotos = async (data: {
    eventPhotosPath: string;
    portraitPath: string;
    userName: string;
  }) => {
    try {
      const response = await fetch('http://localhost:3001/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process photos');
      }

      setResultData({
        resultZipPath: result.resultZipPath,
        matchCount: result.matchCount,
      });
      setCurrentStep('download');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCurrentStep('upload');
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadData(null);
    setResultData(null);
    setError(null);
  };

  return (
    <main className="flex h-[100px]  w-[100vw] flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold mb-8 text-purple-700 text-center ">Photo Sort App</h1>
        <p className="text-center text-blue-600 mb-12 text-lg">
          Extract your photos from event collections using face recognition
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4  rounded mb-6" role="alert">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* <div className=" shadow-xl rounded-lg p-6"> */}
          {currentStep === 'upload' && (
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          )}

          {currentStep === 'processing' && (
            <ProcessingStatus />
          )}

          {currentStep === 'download' && resultData && uploadData && (
            <ResultDownload 
              resultUrl={`http://localhost:3001/api/download/${resultData.resultZipPath}`}
              userName={uploadData.userName}
              matchCount={resultData.matchCount}
              onReset={handleReset} 
            />
          )}
        {/* </div> */}
      </div>
    </main>
  );
}
