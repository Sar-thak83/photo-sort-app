'use client';

import { useState } from 'react';

interface ResultDownloadProps {
  resultUrl: string;
  userName: string;
  matchCount: number;
  onReset: () => void;
}

const ResultDownload: React.FC<ResultDownloadProps> = ({ 
  resultUrl, 
  userName, 
  matchCount, 
  onReset 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `${userName}_photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Processing Complete!</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Results Summary</h3>
        <p className="text-gray-600 mb-1">Name: <span className="font-medium">{userName}</span></p>
        <p className="text-gray-600 mb-4">
          Found <span className="font-medium text-blue-600">{matchCount}</span> photos with your face
        </p>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Your Photos
            </>
          )}
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={onReset}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDownload;