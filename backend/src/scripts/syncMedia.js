const fs = require('fs');
const path = require('path');
const db = require('../db');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function syncMedia() {
  const uploadDir = path.join(__dirname, '../../uploads');
  const serverIP = process.env.SERVER_IP || 'localhost';
  const dbHost = process.env.PGHOST || 'localhost';
  
  console.log(`Starting migration...`);
  console.log(`DB Host: ${dbHost}`);
  console.log(`DB User: ${process.env.PGUSER || 'postgres'}`);
  console.log(`Upload Dir: ${uploadDir}`);

  if (!fs.existsSync(uploadDir)) {
    console.error(`Upload directory not found at: ${uploadDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(uploadDir);
  console.log(`Found ${files.length} files in uploads folder. Syncing to database...`);

  let count = 0;
  for (const filename of files) {
    // Skip system files like .gitignore etc if any
    if (filename.startsWith('.')) continue;

    const filePath = path.join(uploadDir, filename);
    const stats = fs.statSync(filePath);
    
    // Check if file already exists in DB
    const [existing] = await db.query('SELECT id FROM media WHERE filename = $1', [filename]);
    
    if (existing.length === 0) {
      const fileUrl = `http://${serverIP}:5000/uploads/${filename}`;
      const mimetype = getMimeType(filename);
      
      await db.query(
        'INSERT INTO media (filename, url, mimetype, size) VALUES ($1, $2, $3, $4)',
        [filename, fileUrl, mimetype, stats.size]
      );
      console.log(`Synced: ${filename}`);
      count++;
    } else {
      console.log(`Skipped (already exists): ${filename}`);
    }
  }

  console.log(`Sync complete. ${count} new files registered.`);
  process.exit(0);
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimes[ext] || 'application/octet-stream';
}

syncMedia().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
