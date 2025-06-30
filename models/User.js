// // const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ["admin", "client", "driver"],
//       default: "client",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);






// const mongoose = require("mongoose");
// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ["admin", "client", "driver"],
//       default: "client",
//     },
//     status: {
//       type: String,
//       enum: ['Offline', 'Available', 'Connected'],
//       default: 'Offline'
//     },
//     connectedClientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
    
            
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);




const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cnic: { type: String, required: true },
    phone: { type: String, required: true },
    otherPhone: { type: String }, // optional
    homeAddress: { type: String, required: true },
    licenseNumber: { type: String }, // optional, add required: true if needed
    role: {
      type: String,
      enum: ["admin", "client", "driver"],
      default: "client",
    },

    status: {
            type: String,
            enum: ['Offline', 'Available', 'Connected'],
            default: 'Offline'
          },
          connectedClientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
