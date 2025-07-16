// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');  // ✅ for message persistence

// Create the Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set the port number
const PORT = process.env.PORT || 4000;

// Middleware to handle form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, images) from the 'public' folder
app.use(express.static('public'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// 📦 Load messages from file if it exists
let messages = [];
const messageFilePath = path.join(__dirname, 'data', 'messages.json');

// Ensure messages.json exists or create it
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

if (fs.existsSync(messageFilePath)) {
  const fileData = fs.readFileSync(messageFilePath);
  try {
    messages = JSON.parse(fileData);
  } catch (e) {
    console.error('❌ Error parsing messages.json:', e);
  }
}

// 📝 Letter Page
app.get('/letter', (req, res) => {
  const folderPath = path.join(__dirname, 'public/images_1');
  fs.readdir(folderPath, (err, files) => {
    if (err) return res.send('Error loading handwritten letters');

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
  fs.readdir('./public/images', (err, files) => {
    if (err) return res.send('Error loading images');
    res.render('gallery', { images: files });
  });
});

// 💬 Chat Page
app.get('/chat', (req, res) => {
  res.render('chat');
});

// 🎂 Cake Page
app.get('/cake', (req, res) => {
  res.render('cake');
});

// ❤️ Touch Me Page
app.get('/touchme', (req, res) => {
  res.render('touchme');
});

// 🧠 Quiz Page
app.get('/quiz', (req, res) => {
  res.render('quiz');
});

// 🏠 Welcome Page (Home)
app.get('/', (req, res) => {
  res.render('welcome');
});

// 🔌 Socket.IO Chat Handling
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  // Load previous messages
  socket.emit('load messages', messages);

  // When a new chat message is sent
  socket.on('chat message', (data) => {
    const msg = {
      name: data.name,
      message: data.message,
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    messages.push(msg);

    // Save updated messages to file
    fs.writeFile(messageFilePath, JSON.stringify(messages, null, 2), (err) => {
      if (err) console.error('❌ Error saving message:', err);
    });

    io.emit('chat message', msg); // broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🎉 Birthday website running at http://localhost:${PORT}`);
});
