// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const connectDB = require("./config/db");
// const Image = require("./models/Image");

// dotenv.config();
// connectDB();

// const app = express();
// const httpServer = http.createServer(app);

// // Socket.IO setup
// const io = new Server(httpServer, {
//   cors: {
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://localhost:3002",
//     ],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:3001",
//     "http://localhost:3002",
//   ],
//   methods: ["GET", "POST", "DELETE", "PUT"],
//   credentials: true,
// }));
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/assignments", require("./routes/assignments"));
// app.use("/api/client", require("./routes/clientRoutes"));

// // Multer for file uploads
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage });

// // Namespace setup
// const adminNamespace = io.of("/admin");
// const clientNamespace = io.of("/client");
// const driverNamespace = io.of("/driver");

// // In-memory tracking
// let clients = {};
// let admins = {};
// let drivers = {};

// // Global namespace
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   socket.on("register_driver", (driverId) => {
//     drivers[driverId] = socket.id;
//     console.log(`📌 Driver registered: ${driverId}`);
//   });

//   socket.on("register_client", (clientId) => {
//     clients[clientId] = socket.id;
//     console.log(`📌 Client registered: ${clientId}`);
//   });

//   socket.on("request_video", ({ adminEmail, driverId }) => {
//     if (drivers[driverId]) {
//       console.log(`📡 Admin ${adminEmail} requesting video from Driver ${driverId}`);
//       io.to(drivers[driverId]).emit("start_video_stream", { adminEmail });
//     }
//   });

//   socket.on("send_offer", ({ signal, adminEmail, driverId }) => {
//     if (admins[adminEmail]) {
//       io.to(admins[adminEmail]).emit("receive_offer", { signal, driverSocket: socket.id });
//     }
//   });

//   socket.on("send_ice_candidate", ({ candidate, adminEmail }) => {
//     if (admins[adminEmail]) {
//       io.to(admins[adminEmail]).emit("receive_ice_candidate", { candidate });
//     }
//   });

//   socket.on("send_answer", ({ signal, driverSocket }) => {
//     io.to(driverSocket).emit("receive_answer", { signal });
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ User disconnected: ${socket.id}`);
    
//     for (const [driverId, sockId] of Object.entries(drivers)) {
//       if (sockId === socket.id) {
//         delete drivers[driverId];
//         break;
//       }
//     }

//     for (const [adminEmail, sockId] of Object.entries(admins)) {
//       if (sockId === socket.id) {
//         delete admins[adminEmail];
//         break;
//       }
//     }

//     for (const [clientId, sockId] of Object.entries(clients)) {
//       if (sockId === socket.id) {
//         delete clients[clientId];
//         break;
//       }
//     }
//   });
// });

// // Admin namespace
// adminNamespace.on("connection", (socket) => {
//   console.log("✅ Admin connected:", socket.id);

//   socket.on("registerAdmin", (adminEmail) => {
//     admins[adminEmail] = socket.id;
//     socket.join(adminEmail);
//     console.log(`✅ Admin ${adminEmail} registered.`);
//   });

//   socket.on("approveRequest", (data) => {
//     const clientSocketId = clients[data.clientEmail];
//     if (clientSocketId) {
//       clientNamespace.to(clientSocketId).emit("requestStatus", {
//         message: "✅ Request Approved"
//       });
//     }
//   });

//   socket.on("denyRequest", (data) => {
//     const clientSocketId = clients[data.clientEmail];
//     if (clientSocketId) {
//       clientNamespace.to(clientSocketId).emit("requestStatus", {
//         message: "❌ Request Denied"
//       });
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Admin disconnected: ${socket.id}`);
//     for (const [email, id] of Object.entries(admins)) {
//       if (id === socket.id) {
//         delete admins[email];
//         break;
//       }
//     }
//   });
// });

// // Driver namespace
// driverNamespace.on("connection", (socket) => {
//   console.log("✅ Driver connected to /driver:", socket.id);

//   socket.on("sendLocation", ({ clientId, lat, lng }) => {
//     if (clientId && clients[clientId]) {
//       clientNamespace.to(clients[clientId]).emit("receiveLocation", { lat, lng });
//     }
//   });
// });

// // API to check client connection status
// app.get('/api/client/check-connection/:clientId', (req, res) => {
//   const { clientId } = req.params;
//   if (!clientId) {
//     return res.status(400).json({ message: 'Client ID is required' });
//   }

//   const clientSocketId = clients[clientId];
//   if (clientSocketId) {
//     return res.status(200).json({ message: 'Client is connected' });
//   } else {
//     return res.status(404).json({ message: 'Client not found' });
//   }
// });

// // Upload image
// app.post("/api/upload", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const imageUrl = `http://localhost:5005/uploads/${req.file.filename}`;
//     const newImage = new Image({ imageUrl });
//     await newImage.save();

//     res.status(201).json({ message: "Image uploaded", imageUrl });
//   } catch (error) {
//     console.error("❌ Upload error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Fetch images
// app.get("/api/images", async (req, res) => {
//   try {
//     const images = await Image.find();
//     res.status(200).json({ images });
//   } catch (error) {
//     console.error("❌ Fetch images error:", error);
//     res.status(500).json({ message: "Failed to load images" });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 5005;
// httpServer.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
















// this code is ok for live location according to new approach
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Image = require("./models/Image");
const User = require("./models/User");
const clientRoutes = require('./routes/clientRoutes');
const socketIdToDriverId = {};
const driverIdToSocketId = {};
const reportRoutes = require('./routes/reports')


dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://admin-frontend-alpha-olive.vercel.app",
  "https://client-frontend-7wfw.vercel.app",
  "https://driver-frontend-zeta.vercel.app"
],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://admin-frontend-alpha-olive.vercel.app",
      "https://client-frontend-7wfw.vercel.app",
      "https://driver-frontend-zeta.vercel.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/client", clientRoutes);
app.use('/api/reports', reportRoutes);


app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});


// Multer config for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Namespaces
const adminNamespace = io.of("/admin");
const clientNamespace = io.of("/client");
const driverNamespace = io.of("/driver");

// In-memory maps
const clients = {};
const admins = {};
const drivers = {};

// Global namespace
io.on("connection", (socket) => {
  console.log("✅ Global user connected:", socket.id);

  // ✅ Driver Registration (with MongoDB ID check)
  // socket.on("register_driver", (driverId) => {
  //   console.log(`📥 Received register_driver with ID: ${driverId}`);
  // });
   socket.on("register_driver", (driverId) => {
    drivers[driverId] = socket.id;
    console.log(`📌 Driver registered: ${driverId}`);
  });
  
  socket.on("send-location", () => {
    console.log("📍 Received send-location data:");
  });
  

  // Store driverId <-> socket.id mapping

socket.on("register_driver", (driverId) => {
  if (!driverId || typeof driverId !== "string") {
    console.error("❌ Invalid driverId received:", driverId);
    return;
  }

  console.log("✅ Registered Driver ID:", driverId);
  // console.log(`📥 Received register_driver with ID: ${driverId}`);
  console.log("📍 Received send-location data:");

  // Save mappings
  driverIdToSocketId[driverId] = socket.id;
  socketIdToDriverId[socket.id] = driverId;
});


  // ✅ Client Registration
  // socket.on("register_client", (clientId) => {
  //   if (!clientId || typeof clientId !== "string") {
  //     console.warn("❌ Invalid clientId:", clientId);
  //     return;
  //   }
  //   clients[clientId] = socket.id;
  //   console.log(`📌 Client registered: ${clientId}`);
  // });




  // // ✅ Admin Requests Driver Video
  // socket.on("request_video", ({ adminEmail, driverId }) => {
  //   if (drivers[driverId]) {
  //     io.to(drivers[driverId]).emit("start_video_stream", { adminEmail });
  //     console.log(`📡 Admin ${adminEmail} requested video from Driver ${driverId}`);
  //   }
  // });

  // // ✅ WebRTC: Offer
  // socket.on("send_offer", ({ signal, adminEmail, driverId }) => {
  //   if (admins[adminEmail]) {
  //     io.to(admins[adminEmail]).emit("receive_offer", { signal, driverSocket: socket.id });
  //   }
  // });

  // // ✅ WebRTC: ICE
  // socket.on("send_ice_candidate", ({ candidate, adminEmail }) => {
  //   if (admins[adminEmail]) {
  //     io.to(admins[adminEmail]).emit("receive_ice_candidate", { candidate });
  //   }
  // });

  // // ✅ WebRTC: Answer
  // socket.on("send_answer", ({ signal, driverSocket }) => {
  //   io.to(driverSocket).emit("receive_answer", { signal });
  // });





  socket.on("register_client", (clientEmail) => {
        clients[clientEmail] = socket.id;
        console.log(`📌 Client registered: ${clientEmail}`);
      });
    
      socket.on("request_video", ({ clientEmail, driverId }) => {
        if (drivers[driverId]) {
          console.log(`📡 Client ${clientEmail} requesting video from Driver ${driverId}`);
          io.to(drivers[driverId]).emit("start_video_stream", { clientEmail });
        }
      });
    
      socket.on("send_offer", ({ signal, clientEmail, driverId }) => {
        if (clients[clientEmail]) {
          io.to(clients[clientEmail]).emit("receive_offer", { signal, driverSocket: socket.id });
        }
      });
    
      socket.on("send_ice_candidate", ({ candidate, clientEmail }) => {
        if (clients[clientEmail]) {
          io.to(clients[clientEmail]).emit("receive_ice_candidate", { candidate });
        }
      });
    
      socket.on("send_answer", ({ signal, driverSocket }) => {
        io.to(driverSocket).emit("receive_answer", { signal });
      });

  // // ✅ Handle Disconnect
  // socket.on("disconnect", () => {
  //   console.log(`❌ Disconnected: ${socket.id}`);

  //   for (const [driverId, id] of Object.entries(drivers)) {
  //     if (id === socket.id) {
  //       delete drivers[driverId];
  //       break;
  //     }
  //   }

  //   for (const [email, id] of Object.entries(admins)) {
  //     if (id === socket.id) {
  //       delete admins[email];
  //       break;
  //     }
  //   }

  //   for (const [clientId, id] of Object.entries(clients)) {
  //     if (id === socket.id) {
  //       delete clients[clientId];
  //       break;
  //     }
  //   }
  // });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    Object.keys(drivers).forEach((id) => { if (drivers[id] === socket.id) delete drivers[id]; });
    Object.keys(admins).forEach((id) => { if (admins[id] === socket.id) delete admins[id]; });
  });
});







// ✅ Admin Namespace
adminNamespace.on("connection", (socket) => {
  console.log("✅ Admin connected:", socket.id);

  socket.on("registerAdmin", (adminEmail) => {
    admins[adminEmail] = socket.id;
    console.log(`📌 Admin registered: ${adminEmail}`);
  });

  socket.on("approveRequest", ({ clientEmail }) => {
    const clientSocketId = clients[clientEmail];
    if (clientSocketId) {
      clientNamespace.to(clientSocketId).emit("requestStatus", { message: "✅ Request Approved" });
    }
  });

  socket.on("denyRequest", ({ clientEmail }) => {
    const clientSocketId = clients[clientEmail];
    if (clientSocketId) {
      clientNamespace.to(clientSocketId).emit("requestStatus", { message: "❌ Request Denied" });
    }
  });

  socket.on("disconnect", () => {
    for (const [email, id] of Object.entries(admins)) {
      if (id === socket.id) {
        delete admins[email];
        break;
      }
    }
    console.log(`❌ Admin disconnected: ${socket.id}`);
  });
});

// ✅ Driver Namespace: Send Location
driverNamespace.on("connection", (socket) => {
  console.log("✅ Driver connected to /driver:", socket.id);

  socket.on("sendLocation", ({ clientId, lat, lng }) => {
    if (clientId && clients[clientId]) {
      clientNamespace.to(clients[clientId]).emit("receiveLocation", { lat, lng });
    }
  });
});

// ✅ Check if client is connected
app.get('/api/client/check-connection/:clientId', (req, res) => {
  const { clientId } = req.params;
  const socketId = clients[clientId];

  if (socketId) {
    res.status(200).json({ message: "Client is connected" });
  } else {
    res.status(404).json({ message: "Client not connected" });
  }
});

// ✅ Image Upload
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = `http://localhost:5005/uploads/${req.file.filename}`;
    const newImage = new Image({ imageUrl });
    await newImage.save();

    res.status(201).json({ message: "Image uploaded", imageUrl });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch Images
app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json({ images });
  } catch (error) {
    console.error("❌ Fetch error:", error);
    res.status(500).json({ message: "Failed to load images" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5005;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
