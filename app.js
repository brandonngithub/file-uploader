const express = require('express');
const path = require("path");
const prisma = require('./db');
const upload = require('./middlewares/upload');

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

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

// Handle folder creation
app.post('/create-folder', async (req, res) => {
    try {
        const { folderName } = req.body;
        
        if (!folderName) {
            return res.redirect('/upload?error=Folder name is required');
        }

        await prisma.folder.create({
            data: {
                name: folderName
            }
        });

        res.redirect('/upload?success=Folder created successfully');
    } catch (error) {
        let errorMessage = 'Failed to create folder';
        if (error.code === 'P2002') {
            errorMessage = 'A folder with this name already exists';
        }
        res.redirect(`/upload?error=${encodeURIComponent(errorMessage)}`);
    }
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/upload?error=No file selected');
        }

        const fileData = {
            name: req.file.originalname,
            type: path.extname(req.file.originalname).substring(1),
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/${req.file.filename}`
        };

        if (req.body.folderId) {
            fileData.folderId = req.body.folderId;
        }

        await prisma.file.create({
            data: fileData
        });

        res.redirect('/upload?success=File uploaded successfully');
    } catch (error) {
        res.redirect(`/upload?error=${encodeURIComponent(error.message)}`);
    }
});

app.listen(3000, () => console.log("Listening on port 3000"));
