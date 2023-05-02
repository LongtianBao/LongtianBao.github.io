const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const uploadedFiles = [];

app.use(bodyParser.json());
// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({ storage: storage });

// Serve static files
app.use(express.static(__dirname));

// Upload route
app.post('/upload', upload.single('music'), (req, res) => {
    // Add comments array to fileInfo object in the upload route
    const fileInfo = {
        name: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        votes: 0,
        comments: []
    };
    uploadedFiles.push(fileInfo);
    res.redirect('/');
});

// Add this new route in the server.js file
app.post('/vote/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const file = uploadedFiles.find(file => file.name === fileName);

    if (file) {
        file.votes += 1;
        res.status(200).json({ message: 'Vote added successfully' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});


// Add this new route in the server.js file
app.get('/leaderboard', (req, res) => {
    res.json(uploadedFiles);
});

// Add new routes to handle comments
app.get('/comments/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const file = uploadedFiles.find(file => file.name === fileName);

    if (file) {
        res.status(200).json(file.comments);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

app.post('/comments/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const file = uploadedFiles.find(file => file.name === fileName);

    if (file) {
        const comment = req.body.comment;
        file.comments.push(comment);
        res.status(200).json({ message: 'Comment added successfully' });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
