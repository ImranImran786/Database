// // routes/reports.js (or similar)
// const express = require('express');
// const router = express.Router();
// const Assignment = require('../models/Assignment');
// // const Client = require('../models/Client');
// // const Driver = require('../models/Driver');

// router.get('/driver-slots', async (req, res) => {
//   const { date } = req.query;

//   if (!date) return res.status(400).json({ message: 'Date is required' });

//   const startOfDay = new Date(date);
//   const endOfDay = new Date(date);
//   endOfDay.setHours(23, 59, 59, 999);

//   try {
//     const assignments = await Assignment.find({
//       'slots.startTime': { $lte: endOfDay },
//       'slots.endTime': { $gte: startOfDay },
//     })
//       .populate('driverId')
//       .populate('clientId');

//     const result = assignments.map((a) => ({
//       driver: a.driverId,
//       client: a.clientId,
//       slots: a.slots.filter((s) => {
//         const start = new Date(s.startTime);
//         const end = new Date(s.endTime);
//         return start <= endOfDay && end >= startOfDay;
//       }),
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error('Report fetch error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

router.get('/driver-slots', async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .populate('driverId')
      .populate('clientId');

    const result = assignments.map((a) => ({
      driver: a.driverId,
      client: a.clientId,
      slots: a.slots || [],
    }));

    res.json(result);
  } catch (err) {
    console.error('Report fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Express Route (Node.js + MongoDB)
router.get('/users/summary', async (req, res) => {
  try {
    const drivers = await User.countDocuments({ role: 'driver' });
    const clients = await User.countDocuments({ role: 'client' });
    const admin = await User.countDocuments({ role: 'admin' });
    res.json({ drivers, clients, admin });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});


module.exports = router;
