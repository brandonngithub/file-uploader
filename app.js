const express = require('express');
const path = require("path");
const prisma = require('./db');
const upload = require('./middlewares/upload');

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static('public'));

// Display upload form
app.get('/upload', async (req, res) => {
    try {
        const folders = await prisma.folder.findMany();
        res.render('upload', {
            folders: folders,
            error: '',
            success: ''
        });
    } catch (error) {
        res.render('upload', { 
            folders: [], 
            error: 'Failed to load folders',
            success: ''
        });
    }
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.render('upload', {
                folders: await prisma.folder.findMany(),
                error: 'No file selected',
                success: ''
            });
        }

        const newFile = await prisma.file.create({
            data: {
                name: req.file.originalname,
                type: path.extname(req.file.originalname).substring(1),
                size: req.file.size,
                path: req.file.path,
                url: `/uploads/${req.file.filename}`,
                parentId: req.body.folderId || null
            }
        });

        res.render('upload', {
            folders: await prisma.folder.findMany(),
            error: '',
            success: 'File uploaded successfully!' 
        });
    } catch (error) {
        res.render('upload', { 
            folders: await prisma.folder.findMany(),
            error: error.message,
            success: ''
        });
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
