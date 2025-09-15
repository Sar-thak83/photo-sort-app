'use client';

import { useEffect, useState } from 'react';

const ProcessingStatus: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    const messages = [
      'Extracting photos from ZIP...',
      'Analyzing your portrait...',
      'Scanning event photos...',
      'Matching faces...',
      'Collecting matching photos...',
      'Creating your personalized collection...',
      'Finalizing...',
    ];

    let currentStep = 0;
    const totalSteps = messages.length;

    // Simulate processing steps
    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        setStatusMessage(messages[currentStep]);
        setProgress(Math.floor((currentStep / totalSteps) * 100));
        currentStep++;
      } else {
        setProgress(99); // Keep at 99% until actual completion
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-6">Processing Your Photos</h2>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="text-lg font-medium text-gray-700 mb-2">{statusMessage}</p>
      <p className="text-sm text-gray-500">
        This may take a few minutes depending on the number of photos.
      </p>

      <div className="mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
};

export default ProcessingStatus;