# Photo Sort App

A web application that helps users find their photos in large event photo collections using facial recognition technology.

## Features

- Upload a ZIP file containing event photos
- Upload a portrait photo of yourself
- Automatic facial recognition using TensorFlow.js
- Download a ZIP file containing only photos with your face

## Tech Stack

### Frontend
- Next.js 15.5
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- TensorFlow.js for facial recognition
- Multer for file uploads

## Project Structure

```
photo-sort-app/
├── frontend/            # Next.js frontend application
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/   # React components
│   │   └── ...
│   └── ...
└── backend/             # Express backend application
    ├── src/
    │   ├── controllers/ # Request handlers
    │   ├── middlewares/ # Express middlewares
    │   ├── routes/      # API routes
    │   ├── services/    # Business logic
    │   ├── utils/       # Utility functions
    │   └── index.ts     # Entry point
    ├── uploads/         # Temporary storage for uploaded files
    ├── temp/            # Temporary storage for processing
    └── ...
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/Sar-thak83/photo-sort-app.git
cd photo-sort-app
```

2. Install dependencies for both frontend and backend

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server

```bash
cd backend
npm run build  # Compile TypeScript
npm start      # Start the server
```

2. Start the frontend development server

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your name in the form
2. Upload a ZIP file containing event photos
3. Upload a portrait photo of yourself
4. Click "Upload Files" to start the process
5. Wait for the processing to complete
6. Download the ZIP file containing photos with your face

## How It Works

1. The frontend sends the ZIP file and portrait photo to the backend
2. The backend extracts the ZIP file and processes the photos
3. TensorFlow.js is used to extract facial features from the portrait and event photos
4. Photos with matching faces are identified using cosine similarity
5. Matching photos are compressed into a new ZIP file
6. The frontend provides a download link for the result
