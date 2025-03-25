const express = require('express');
const prisma = require('./db')

const app = express();

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.listen(3000, () => console.log("Listening on port 3000"));
