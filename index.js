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

// Multer setup
const upload = multer({ dest: "uploads/" });

// Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let resultData;

    // PDF Extraction
    if (fileType.includes("pdf")) {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      resultData = {
        type: "pdf",
        fileName: req.file.originalname,
        content: data.text,
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
        fileName: req.file.originalname,
        content: rows,
      };
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(filePath);

    res.json(resultData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});