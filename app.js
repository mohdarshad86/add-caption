const express = require('express');
const path = require('path'); // Import the 'path' module
const app = express();
const multer = require('multer');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const spawn = require('child_process').spawn;

// Configure multer to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});

const upload = multer({ storage: storage });

// Set the FFmpeg path
app.set('ffmpegPath', ffmpegPath);

// Define a POST route to upload a video and captions
app.post('/addCaption', upload.single('video'), (req, res) => {
    const videoPath = req.file.path; // Use the path to the uploaded video
    const captionText = req.body.caption;

    if (!videoPath || !captionText) {
        return res.status(400).json({ error: 'Video file and caption are required.' });
    }

    const text = [
        {
            text: 'hii',
            start: '0.234',
            end: '0.934',
        }, {
            text: 'hello',
            start: '1.00',
            end: '3.3647534',
        }
    ]

    /*
        font-weight: 900;
    font-size: 32px;
    text-shadow: 2px 2px 5px white, 2px -2px 5px white, -2px -2px 5px white, -2px 2px 5px white;
    */

    let captions = []
    text.forEach(t => {
        captions.push(`drawtext=text='${t.text}':
        x=(w-tw)/2:
        y=(h-lh)/2:
        bordercolor=white:
        borderw=5:
        fontsize=32:
        fontcolor=black:
        enable='between(t,${t.start},${t.end})'
        `)
    });

    console.log(captions.join(','));


    // Process video using FFmpeg
    const ffmpegProcess = spawn(app.get('ffmpegPath'), [
        '-i', videoPath, // Use the path to the uploaded video
        '-vf', captions.join(','),
        '-c:a', 'copy',
        `./output/output${Math.random() * 1000}.mp4`// // Provide the full output file path
    ]);

    ffmpegProcess.on('error', (err) => {
        console.error('FFmpeg Error:', err);
        res.status(500).json({ error: 'An error occurred while processing the video.' });
    });

    ffmpegProcess.on('close', (code) => {
        if (code === 0) {
            // Video processing successful
            res.status(200).json({ message: 'Caption added successfully.' });
        } else {
            res.status(500).json({ error: 'Video processing failed.' });
        }
    });

    ffmpegProcess.stdin.end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});