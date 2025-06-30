const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/assign-driver', assignmentController.assignDriver);
// router.post('/extend-slot', assignmentController.extendSlot);
router.get('/driver-assignments/:driverId', assignmentController.getDriverAssignments);
router.put('/complete-slot', assignmentController.completeSlot);

// ✅ Fixed route handlers
router.put('/slots/update/:slotId', assignmentController.updateSlot);
router.delete('/slots/delete/:slotId', assignmentController.deleteSlot);

module.exports = router;

