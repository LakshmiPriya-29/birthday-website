// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');            // ✅ for socket.io support
const { Server } = require('socket.io'); // ✅ socket.io

// Create the Express app
const app = express();
const server = http.createServer(app);   // 🔁 instead of app.listen
const io = new Server(server);           // 🎯 create socket.io server

// Set the port number
const PORT = process.env.PORT || 4000;

// Middleware to handle form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, images) from the 'public' folder
app.use(express.static('public'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// 📦 Temporary in-memory message store (we can later save to file if you want)
let messages = [];


// 📄 ROUTES

// 📝 Letter Page
app.get('/letter', (req, res) => {
  const fs = require('fs');
  const folderPath = path.join(__dirname, 'public/images_1');

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.send('Error loading handwritten letters');
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExtensions = ['.mp4', '.webm', '.ogg'];

    const handwrittenImages = files.filter(file =>
      imageExtensions.includes(path.extname(file).toLowerCase())
    );

    const videos = files.filter(file =>
      videoExtensions.includes(path.extname(file).toLowerCase())
    );

    res.render('letter', { handwrittenImages, videos });
  });
});



// 🖼️ Gallery Page
app.get('/gallery', (req, res) => {
  const fs = require('fs');
  fs.readdir('./public/images', (err, files) => {
    if (err) {
      return res.send('Error loading images');
    }
    res.render('gallery', { images: files });
  });
});

// 💬 Chat Page (no message loading needed)
app.get('/chat', (req, res) => {
  res.render('chat'); // socket.io handles messages
});

app.get('/cake', (req, res) => {
  res.render('cake');
});
app.get('/touchme', (req, res) => {
  res.render('touchme');
});


// 🏠 Home page
app.get('/', (req, res) => {
  res.render('welcome');
});
app.get('/quiz', (req, res) => {
  res.render('quiz');
});



// 🔌 SOCKET.IO SETUP
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  // Send existing messages to new user
  socket.emit('load messages', messages);

  // Listen for chat messages from client
  socket.on('chat message', (data) => {
    const msg = {
      name: data.name,
      message: data.message,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })

    };
    messages.push(msg);

    // Broadcast to all clients
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});


// 🚀 Start the server
server.listen(PORT, () => {
  console.log(`🎉 Real-time birthday website running at http://localhost:${PORT}`);
});
