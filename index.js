const express = require('express');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const FormData = require('form-data');
const favicon = require("serve-favicon");

const app = express();
const port = 3000;

// middleware
app.set("view engine", "ejs");
app.use("/static", express.static("public"));
app.use(favicon("./public/zanixon-icon.webp"));
const upload = multer({ dest: 'uploads/' });

// main page
app.get('/', (req, res) => {
  res.render("index", { data: {
    message: ""
  }});
});

// Handle file upload
app.post('/', upload.single('file'), async (req, res) => {
  try {
    if(!req?.file?.path) return res.render("index", { data: {
      message: "Please select a video to upload!"
    }})
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req?.file?.path), {
      filename: Date.now() + ".mp4", // Specify original filename
      contentType: req.file.mimetype, // Specify content type
    });

    const response = await axios.post('https://videy.co/api/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Delete the temporary file after upload
    fs.unlinkSync(req?.file?.path);
    const id = response.data.id;
    res.render("index", { data: {
      message: "",
      url: `https://cdn.videy.co/${id}.mp4`
    }});
  } catch (error) {
    console.error('Error uploading file:', error);
    res.render("index", { data: {
      message: "Failed to upload video!"
    }})
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
