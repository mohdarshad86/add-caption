const fs = require('fs');
const srtToAss = require('srt-to-ass');

// Read the SRT content from the file
const srtContent = fs.readFileSync('sample.srt', 'utf-8');

// Convert SRT to ASS format using srt-to-ass library
const assCaptions = srtToAss.convert(srtContent);

// Display the converted ASS captions
console.log(assCaptions);