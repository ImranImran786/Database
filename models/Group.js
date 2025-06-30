// models/Group.js (Mongoose example)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  name:        { type: String, required: true },
  clientIds:   [{ type: Schema.Types.ObjectId, ref: 'Client' }],  // members
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', GroupSchema);
