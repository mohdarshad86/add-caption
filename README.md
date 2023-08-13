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

    // Process video using FFmpeg
    const ffmpegProcess = spawn(app.get('ffmpegPath'), [
        '-i', videoPath, // Use the path to the uploaded video
        '-vf', `drawtext=text='${captionText}':x=(w-tw)/2:y=(h-lh)/2:fontsize=24:fontcolor=red:enable='between(t,2,4)'`,
        '-c:a', 'copy',
        `./output/output${Math.random()*1000}.mp4`// // Provide the full output file path
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

    if (!videoPath) {
        return res.status(400).json({ error: 'Video file and caption are required.' });
    }

    // Process video using FFmpeg

    const captionBlocks = [];
const srtContent = fs.readFileSync('sample.srt', 'utf-8');
const captionParts = srtContent.trim().split(/\r?\n\s*\r?\n/);

for (const part of captionParts) {
    const lines = part.split(/\r?\n/);
    if (lines.length >= 3) {
        const timecodes = lines[1].split(' --> ');
        const startTime = convertSRTTimeToFFmpegTime(timecodes[0]);
        const endTime = convertSRTTimeToFFmpegTime(timecodes[1]);
        const text = lines.slice(2).join('\n').trim(); // Remove trailing whitespace
        captionBlocks.push({ startTime, endTime, text });
    }
}

    function convertSRTTimeToFFmpegTime(srtTime) {
        // Convert SRT time format: 00:00:00,000
        // to FFmpeg time format: 00:00:00.000
        const [hms, ms] = srtTime.split(',');
        const timeParts = hms.split(':');

        return timeParts.join(':') + '.' + ms;
    }
    console.log(captionBlocks);

    const drawtextFilters = captionBlocks.map((block) => {
        return `drawtext=text='${block.text}':x=(w-tw)/2:y=(h-lh)/2:fontsize=24:fontcolor=red:enable='between(t,${block.startTime},${block.endTime})'`;
    });
    // console.log(drawtextFilters);

    const ffmpegProcess = spawn(app.get('ffmpegPath'), [
        '-i', videoPath,
        '-vf', drawtextFilters.join(', '),
        '-c:a', 'copy',
        `./output/output${Math.random() * 1000}.mp4`
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
