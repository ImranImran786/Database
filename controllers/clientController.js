const User = require('../models/User');

const checkClientConnection = async (req, res) => {
  try {
    // ✅ Trim newline or spaces from clientId
    const clientId = req.params.clientId.trim();
    if (!clientId || clientId === 'undefined') {
        return res.status(400).json({ success: false, message: "Invalid client ID" });
      }
    // Find the driver connected to this client
    const connectedDriver = await User.findOne({
      role: 'driver',
      status: 'Connected',
      connectedClientId: clientId,
    }).select('name phone licenseNumber _id status connectedClientId');

    if (!connectedDriver) {
      return res.status(404).json({ message: 'Client not connected with any driver' });
    }

    res.status(200).json({
      message: 'Client is connected with a driver',
      driver: connectedDriver,
    });
  } catch (error) {
    console.error('Error checking client-driver connection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  checkClientConnection,
};

