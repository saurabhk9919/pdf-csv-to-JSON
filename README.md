# 📄 PDF & CSV Extractor API

A full-stack web application that allows users to upload PDF or CSV files, extracts structured data from them, and stores the results in Firebase Firestore.

This project was built as part of a Backend Development Internship Assessment.

## 🚀 Live Demo

🔗 Backend API:  
https://pdf-csv-to-json-production.up.railway.app

Health Check:  
https://pdf-csv-to-json-production.up.railway.app/health

---

## ✨ Features

- Upload PDF or CSV files via web UI
- Extract text content from PDFs
- Parse structured rows from CSV files
- Store extracted JSON data in Firebase Firestore
- Live deployed backend API
- Clean and responsive frontend interface
- Error handling and status tracking

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- pdf-parse (PDF extraction)
- csv-parser (CSV parsing)
- Firebase Admin SDK
- Firestore Database

### Frontend
- HTML
- CSS
- JavaScript (Fetch API)

### Deployment
- Railway (Backend Hosting)
- Firebase (Firestore)

## 📂 Project Structure
pdf-csv-to-JSON/
├── public/
│ ├── index.html
│ └── script.js
├── uploads/
├── index.js
├── package.json
└── README.md

## ⚙️ How It Works
1. User uploads a file via frontend.
2. Backend receives file using Multer.
3. Based on file type:
   - PDF → text extracted into JSON using pdf-parse
   - CSV → rows parsed into JSON
4. Extracted data is saved into Firestore.
5. Response returned to frontend.

