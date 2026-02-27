const admin = require("firebase-admin");
const fs = require("fs");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_KEY) {
 
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY);
} else if (fs.existsSync("./serviceAccountKey.json")) {
  
  serviceAccount = require("./serviceAccountKey.json");
} else {
  throw new Error(
    "Firebase credentials not found. Set FIREBASE_SERVICE_KEY environment variable or add serviceAccountKey.json file"
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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

    if (fileType.includes("pdf")) {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      resultData = {
        type: "pdf",
        fileName,
        content: data.text,
        count: data.numpages,
      };
    } else if (fileType.includes("csv")) {
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
        fileName,
        content: rows,
        count: rows.length,
      };
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(filePath);

    const docRef = await db.collection("extracted_files").add({
      uploadId,
      fileName,
      fileType: resultData.type,
      extractedData: resultData.content,
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      count: resultData.count,
    });

    res.json({
      success: true,
      uploadId,
      fileId: docRef.id,
      fileName,
      type: resultData.type,
      preview:
        typeof resultData.content === "string"
          ? resultData.content.substring(0, 200) + "..."
          : `${resultData.content.length} rows`,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      uploadId,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});