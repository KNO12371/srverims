const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to fetch video description and download
app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required!' });
    }

    // Fetch video description
    const command = `yt-dlp --get-description "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: `Metadata Error: ${error.message}` });
        }

        let caption = stdout.trim();
        if (caption.length > 25) {
            caption = caption.substring(0, 25);
        }
        caption = caption.replace(/[^a-zA-Z0-9_\-]/g, '_'); // Sanitize filename

        // Define the final filename
        const filePathWithCaption = `downloads/${caption}.mp4`;

        const downloadCommand = `yt-dlp -o "${filePathWithCaption}" "${url}"`;

        exec(downloadCommand, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: `Download Error: ${error.message}` });
            }
            res.json({ message: 'Download completed successfully!', filePath: filePathWithCaption });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
