const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  phone: { type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true },
  user: { type: String, required: true },
  userName: { type: String, default: 'Anonymous' },
  content: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Comment', commentSchema)