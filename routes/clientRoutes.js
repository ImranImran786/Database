// // routes/clientRoutes.js
// router.get('/connected-driver/:clientId', async (req, res) => {
//     const { clientId } = req.params;
//     const client = await User.findById(clientId);
//     if (client?.connectedDriverId) {
//       const driver = await User.findById(client.connectedDriverId);
//       return res.json({ driverId: driver._id });
//     }
//     return res.status(404).json({ message: "No driver connected" });
//   });
  





// routes/clientRoutes.js

// const express = require('express');
// const router = express.Router();
// const User = require('../models/User'); // Make sure the path to User model is correct

// // GET connected driver for a client
// router.get('/connected-driver/:clientId', async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const client = await User.findById(clientId);

//     if (client?.connectedDriverId) {
//       const driver = await User.findById(client.connectedDriverId);
//       return res.json({ driverId: driver._id });
//     }

//     return res.status(404).json({ message: 'No driver connected' });
//   } catch (error) {
//     console.error('Error fetching connected driver:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;









const express = require('express');
const router = express.Router();
const { checkClientConnection } = require('../controllers/clientController');
const clientController = require('../controllers/clientController');


// router.get('/check-connection/:clientId', checkClientConnection);
router.get('/check-connection/:clientId', clientController.checkClientConnection);


module.exports = router;

