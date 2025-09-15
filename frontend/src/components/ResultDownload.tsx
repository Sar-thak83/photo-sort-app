'use client';



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


  return (
    <div className="bg-gradient-to-br from-purple-200 via-blue-100 to-teal-100 rounded-3xl shadow-2xl p-8 flex flex-col items-center space-y-6 animate-fade-in">
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
      <h2 className="text-2xl font-extrabold text-purple-700 animate-fade-in mb-2">Processing Complete!</h2>
      <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-teal-100 rounded-xl p-6 mb-6 max-w-md mx-auto shadow-lg">
        <h3 className="text-lg font-bold text-blue-700 mb-2">Results Summary</h3>
        <p className="text-blue-700 mb-1">Name: <span className="font-semibold">{userName}</span></p>
        <p className="text-blue-700 mb-4">
          Found <span className="font-bold text-purple-600">{matchCount}</span> photos with your face
        </p>
        <a
          href={resultUrl}
          download
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow text-base font-semibold text-white bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Your Photos
        </a>
      </div>
      <div className="mt-6">
        <button
          onClick={onReset}
          className="text-purple-700 hover:text-purple-900 font-bold underline"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultDownload;