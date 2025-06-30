const User = require("../models/User");
const Assignment = require("../models/Assignment");

// ✅ Assign driver
const assignDriver = async (req, res) => {
  try {
    const { clientId, driverId, slots, recurrence } = req.body;

    if (!clientId || !driverId) {
      return res.status(400).json({ message: "Missing clientId or driverId" });
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // driver.status = "Connected";
    driver.connectedClientId = clientId;
    await driver.save();

    const assignment = new Assignment({
      clientId,
      driverId,
      slots: slots || [],
      recurrence: recurrence || "none",
    });

    await assignment.save();
    res.status(200).json({ message: "Driver assigned and assignment saved" });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
};

// ✅ Extend slot time
// const extendSlot = async (req, res) => {
//   try {
//     const { assignmentId, slotIndex, extensionMinutes, reason } = req.body;

//     if (!assignmentId || slotIndex === undefined || !extensionMinutes || !reason) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (extensionMinutes > 60 || extensionMinutes <= 0) {
//       return res.status(400).json({ message: "Extension must be between 1 and 60 minutes" });
//     }

//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) return res.status(404).json({ message: "Assignment not found" });

//     const slot = assignment.slots[slotIndex];
//     if (!slot) return res.status(404).json({ message: "Slot not found" });

//     const now = new Date();
//     const slotStart = new Date(slot.startTime);
//     const slotEnd = new Date(slot.endTime);

//     if (now.toDateString() !== slotStart.toDateString()) {
//       return res.status(400).json({ message: "Extension only allowed on the same date as slot" });
//     }

//     if (now < slotStart || now > slotEnd) {
//       return res.status(400).json({ message: "You can only extend an active slot during its timeframe" });
//     }

//     const newEnd = new Date(slot.endTime);
//     newEnd.setMinutes(newEnd.getMinutes() + extensionMinutes);

//     slot.endTime = newEnd;
//     slot.extensions.push({
//       extendedByMinutes: extensionMinutes,
//       reason,
//       extendedAt: new Date()
//     });

//     await assignment.save();

//     res.status(200).json({
//       message: "Time slot extended successfully",
//       newEndTime: newEnd,
//       updatedSlot: slot
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Extension failed", error: error.message });
//   }
// };

// ✅ Get all assignments for a driver
const getDriverAssignments = async (req, res) => {
  try {
    const { driverId } = req.params;
    const assignments = await Assignment.find({ driverId });
    if (!assignments.length) {
      return res.status(404).json({ message: "No assignments found" });
    }
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments", error: err.message });
  }
};

// ✅ Update a specific slot
const updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start and end time are required" });
    }

    const assignment = await Assignment.findOne({ "slots._id": slotId });
    if (!assignment) {
      return res.status(404).json({ message: "Slot not found in any assignment" });
    }

    const slot = assignment.slots.id(slotId); // <- Mongoose way to get subdoc by ID
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    slot.startTime = new Date(startTime);
    slot.endTime = new Date(endTime);

    await assignment.save();
    res.status(200).json({ message: "Slot updated successfully", slot });
  } catch (error) {
    res.status(500).json({ message: "Failed to update slot", error: error.message });
  }
};

// ✅ Delete a specific slot
const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const assignment = await Assignment.findOne({ "slots._id": slotId });
    if (!assignment) {
      return res.status(404).json({ message: "Slot not found in any assignment" });
    }

    assignment.slots = assignment.slots.filter(
      (slot) => slot._id.toString() !== slotId
    );

    await assignment.save();
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete slot", error: error.message });
  }
};


// ✅ Driver completes a slot and sets endTime
const completeSlot = async (req, res) => {
  try {
    const { assignmentId, slotIndex } = req.body;

    if (!assignmentId || slotIndex === undefined) {
      return res.status(400).json({ message: "assignmentId and slotIndex are required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const slot = assignment.slots[slotIndex];
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.endTime) {
      return res.status(400).json({ message: "Slot is already completed" });
    }

    slot.endTime = new Date(); // ✅ Set current time as endTime
    await assignment.save();

    // Optional: Set driver status to Available if all today's active slots are completed
    const remaining = assignment.slots.some((s) => !s.endTime);
    if (!remaining) {
      const driver = await User.findById(assignment.driverId);
      if (driver) {
        driver.status = "Available";
        driver.connectedClientId = null;
        await driver.save();
      }
    }

    res.status(200).json({ message: "Slot marked as completed", slot });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark slot complete", error: error.message });
  }
};


module.exports = {
  assignDriver,
  completeSlot,
  // extendSlot,
  getDriverAssignments,
  updateSlot,
  deleteSlot, // <== must be exported
};
