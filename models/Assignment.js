// const mongoose = require("mongoose");

// const extensionSchema = new mongoose.Schema({
//   extendedByMinutes: { type: Number, required: true },
//   reason: { type: String, required: true },
//   extendedAt: { type: Date, default: Date.now },
// });

// const slotSchema = new mongoose.Schema({
//   startTime: { type: Date, required: true },
//   endTime: { type: Date, required: true },
//   extensions: [extensionSchema], // Array of extensions per slot
// });

// const assignmentSchema = new mongoose.Schema(
//   {
//     clientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     driverId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     slots: [slotSchema],
//     recurrence: {
//       type: String,
//       default: "none",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Assignment", assignmentSchema);


const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date }, // ✅ Optional initially; set by driver later
});

const assignmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slots: [slotSchema],
    recurrence: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
