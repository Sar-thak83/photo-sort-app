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
    <div className="bg-gradient-to-br from-purple-200 via-blue-100 to-teal-100 rounded-3xl shadow-2xl p-8 flex flex-col items-center space-y-6 animate-fade-in">
      <h2 className="text-2xl font-extrabold mb-4 text-purple-700 animate-fade-in">Processing Your Photos</h2>
      <div className="w-full bg-gradient-to-r from-purple-200 via-blue-100 to-teal-200 rounded-full h-4 mb-6 shadow-inner">
        <div
          className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 h-4 rounded-full animate-progress"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-lg font-bold text-blue-700 mb-2 animate-fade-in-slow">{statusMessage}</p>
      <p className="text-sm text-purple-600 animate-fade-in-slow">
        This may take a few minutes depending on the number of photos.
      </p>
      <div className="mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    </div>
  );
};

export default ProcessingStatus;