const express = require('express');
const dotenv = require('dotenv');
const database = require("./config/database");
const port = process.env.PORT || 4000;
const userRoute = require('./Routes/userRoutes.js');
const chatRoutes = require('./Routes/chatRoutes.js');
const messageRoutes = require('./Routes/messageRoutes.js');

const { notFound, errorHandler } = require('./Middleware/errorMiddleware.js');
const { cloudinaryConnect } = require("./config/Cloudinary");
const fileUpload = require("express-fileupload");
const cors = require("cors");

// Connect to database
database.connect();

const app = express();
dotenv.config();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp",
}));
app.use(
	cors({
		origin:"http://localhost:5173",
		credentials:true,
	})
)

// Connect to Cloudinary
cloudinaryConnect();

// Routes
app.use('/api/v1/auth', userRoute);
app.use('/api/v1/chat',chatRoutes);
app.use('/api/v1/message',messageRoutes)

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Dummy route
app.get('/', (req, res) => {
  res.send("API is running");
});

// Start the server

const server = app.listen(
  port,
  console.log(`Server running on PORT ${port}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.userIds) return console.log("chat.users not defined");

    chat.userIds.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});