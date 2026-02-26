const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Configure Firestore settings
const db = admin.firestore();
db.settings({
  timestampsInSnapshots: true,
  maxRetries: 3
});

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse"); 
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Serve public
app.use(express.static("public"));

// Configuration
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  const uploadId = Date.now().toString();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;

    let resultData;

    // PDF Extraction
    if (fileType.includes("pdf")) {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      resultData = {
        type: "pdf",
        fileName: fileName,
        content: data.text,
        pageCount: data.numpages
      };
    }

    // CSV Extraction
    else if (fileType.includes("csv")) {
      const rows = [];

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", resolve)
          .on("error", reject);
      });

      resultData = {
        type: "csv",
        fileName: fileName,
        content: rows,
        rowCount: rows.length
      };
    }

    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type (only PDF/CSV)" });
    }

    // Delete temp file
    fs.unlinkSync(filePath);

    // Save to Firestore with simplified data
    const docRef = await db.collection("extracted_files").add({
      uploadId,
      fileName: fileName,
      fileType: resultData.type,
      extractedData: resultData.content,
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      pageCount: resultData.pageCount || resultData.rowCount || 0
    });

    res.json({
      success: true,
      message: "File processed and saved",
      uploadId,
      fileId: docRef.id,
      fileName: fileName,
      type: resultData.type,
      contentPreview: typeof resultData.content === 'string' 
        ? resultData.content.substring(0, 200) + "..." 
        : `${resultData.content.length} rows`
    });

  } catch (error) {
    console.error("Upload error:", error);
    
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false,
      error: error.message,
      uploadId
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});