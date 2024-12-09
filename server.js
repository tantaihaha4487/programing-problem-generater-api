const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const {API_URL, PORT, PROBLEM_PATH} = process.env;


app = express();
port = PORT || 6969;

app.use(express.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Pequesed-With, Content-Type, Accept'); 
    next();
});

// Set up Multer for file upload with custom storage configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueFileName = `${file.originalname}`;
    cb(null, uniqueFileName);
  },
});


const upload = multer({ storage });

let problems = [];

// Read file
const readProblemsFile = () => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
    } else {
      problems = data.split(/\r?\n/).map(line => line.replace(/\r|\n/g, '')).filter(Boolean);
      console.log('Content of the file:', problems);
    }
  });
};

const filePath = PROBLEM_PATH;
readProblemsFile();

// Set up file-watcher to detect changes in the file
fs.watch(filePath, (eventType, filename) => {
  if (eventType === 'change') {
    console.log(`File ${filename} changed. Updating the data...`);
    readProblemsFile();
  }
});

// Api manager page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// View File in uploads folder
app.get('/uploads', (req, res) => {
  const uploadsFolder = path.join(__dirname, 'uploads');

  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Failed to read directory.' });
    }
    res.json({ files });
  });
});

app.get('/problem', (req, res) => {
  res.json(problems);
});

//Problem file download
app.get('/problem/file/download', (req, res) => {
  const file = path.join(__dirname, filePath);
res.download(file, './problem.txt', (err) => {
  if (err) {
    console.error('Error sending file:', err);
  } else {
    console.log('File sent successfully');
  }
  });
});

// Upload file to ./uploads folder
app.post('/file/upload', upload.single('file'), (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log('Uploaded file details:', uploadedFile);

  res.json({ message: 'File uploaded successfully' });
});

app.listen(port, () => {
      console.log(`Server is running on ${API_URL}:${port}`);
  });
