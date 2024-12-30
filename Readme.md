# College Appointment System

## Overview
A simple web-based application for students to book appointments with professors. Professors can manage their availability, while students can view slots and book appointments.

## Tech Stack
- **Frontend**: React.js, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: AWS DynamoDB

## Prerequisites
- **Node.js** and **npm**
- AWS DynamoDB set up with tables:
  - `Users`: Stores user data
  - `Availabilities`: Stores professor availability
  - `Appointments`: Stores appointment details

## Setup

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with AWS credentials:
   ```
   AWS_REGION=your-aws-region
   ACESS_KEY=your-aws-access-key
   SECRET_KEY=your-aws-secret-key
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

## Usage
1. Start the backend server on `http://localhost:8000`.
2. Start the frontend on `http://localhost:3000`.

---