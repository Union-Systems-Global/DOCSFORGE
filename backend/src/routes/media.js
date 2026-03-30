const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Generic file upload (Images / Videos)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const serverIP = process.env.SERVER_IP || 'localhost';
    const fileUrl = `http://${serverIP}:5000/uploads/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Document Ingestion / Parsing (PDF & Word)
router.post('/document-parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    console.log(`PARSING_DOCUMENT: ${req.file.originalname} (${req.file.size} bytes)`);
    const extension = path.extname(req.file.originalname).toLowerCase();
    let result = { text: '', html: '' };

    if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdf(dataBuffer);
      result.text = data.text;
      result.html = data.text.split('\n\n').map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
    } else if (extension === '.docx') {
      try {
        const docResult = await mammoth.convertToHtml({ path: req.file.path });
        result.html = docResult.value;
        // Strip HTML tags to get plain text
        result.text = result.html.replace(/<[^>]*>/g, '');
        console.log(`WORD_PARSE_SUCCESS: Generated ${result.html.length} chars of HTML`);
      } catch (mammothErr) {
        console.error('MAMMOTH_PARSE_ERROR:', mammothErr.message);
        return res.status(500).json({ error: 'Failed to extract content from Word document' });
      }
    } else {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Unsupported format. Please use PDF or DOCX.' });
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error) {
    console.error('DOCUMENT_PARSE_FATAL_ERROR:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'System error during document parsing' });
  }
});

module.exports = router;
