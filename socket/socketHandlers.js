// socket/socketHandlers.js
const { Server } = require("socket.io");
const User = require("../models/User"); // Adjust path to match your structure

let availableDrivers = new Map(); // driverSocketId => driverId
let connectedClients = new Map(); // clientSocketId => driverId
let clientSockets = new Map(); // driverId => clientSocketId
let driverSockets = new Map(); // driverId => driverSocketId

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const driverNamespace = io.of("/driver");
  const clientNamespace = io.of("/client");
  const adminNamespace = io.of("/admin");

  // DRIVER logic
  driverNamespace.on("connection", (socket) => {
    console.log("Driver connected:", socket.id);

    socket.on("register_driver", async ({ driverId }) => {
      availableDrivers.set(socket.id, driverId);
      driverSockets.set(driverId, socket.id);

      await User.findByIdAndUpdate(driverId, {
        status: "Available",
        connectedClientId: null,
      });

      emitDriverStatusToAdmin();
      emitAvailableDriversToClients();
    });

    socket.on("send_location", ({ driverId, lat, lng }) => {
      const clientSocketId = clientSockets.get(driverId);
      if (clientSocketId) {
        clientNamespace.to(clientSocketId).emit("location_update", { driverId, lat, lng });
      }
    });

    socket.on("disconnect", async () => {
      const driverId = availableDrivers.get(socket.id);
      if (driverId) {
        await User.findByIdAndUpdate(driverId, {
          status: "Offline",
          connectedClientId: null,
        });

        availableDrivers.delete(socket.id);
        driverSockets.delete(driverId);
        clientSockets.delete(driverId);

        emitDriverStatusToAdmin();
        emitAvailableDriversToClients();
      }
      console.log("Driver disconnected:", socket.id);
    });
  });

  // CLIENT logic
  clientNamespace.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("request_driver", async ({ clientId, driverId }) => {
      const driverSocketId = driverSockets.get(driverId);
      if (driverSocketId) {
        connectedClients.set(socket.id, driverId);
        clientSockets.set(driverId, socket.id);
        availableDrivers.delete(driverSocketId);

        await User.findByIdAndUpdate(driverId, {
          status: "Connected",
          connectedClientId: clientId,
        });

        emitDriverStatusToAdmin();
        emitAvailableDriversToClients();

        socket.emit("driver_approved", { driverId });
      } else {
        socket.emit("driver_unavailable");
      }
    });

    socket.on("disconnect_driver", async ({ clientId }) => {
      const driverId = connectedClients.get(socket.id);
      if (driverId) {
        const driverSocketId = driverSockets.get(driverId);
        if (driverSocketId) availableDrivers.set(driverSocketId, driverId);

        await User.findByIdAndUpdate(driverId, {
          status: "Available",
          connectedClientId: null,
        });

        connectedClients.delete(socket.id);
        clientSockets.delete(driverId);

        emitDriverStatusToAdmin();
        emitAvailableDriversToClients();
      }
    });

    socket.on("disconnect", async () => {
      const driverId = connectedClients.get(socket.id);
      if (driverId) {
        const driverSocketId = driverSockets.get(driverId);
        if (driverSocketId) availableDrivers.set(driverSocketId, driverId);

        await User.findByIdAndUpdate(driverId, {
          status: "Available",
          connectedClientId: null,
        });

        connectedClients.delete(socket.id);
        clientSockets.delete(driverId);

        emitDriverStatusToAdmin();
        emitAvailableDriversToClients();
      }

      console.log("Client disconnected:", socket.id);
    });
  });

  // ADMIN logic
  adminNamespace.on("connection", (socket) => {
    console.log("Admin connected:", socket.id);
    emitDriverStatusToAdmin();
  });

  async function emitDriverStatusToAdmin() {
    const drivers = await User.find({ role: "driver" }).select("name status connectedClientId");
    adminNamespace.emit("updateDriverStatuses", drivers);
  }

  async function emitAvailableDriversToClients() {
    const drivers = await User.find({ role: "driver", status: "Available" }).select("name _id");
    clientNamespace.emit("available_drivers", drivers);
  }
}

module.exports = setupSocket;
