const Comment = require('../models/Comment')

// GET /api/phones/:phoneId/comments
exports.getComments = async (req, res) => {
  try {
    const { phoneId } = req.params
    const comments = await Comment.find({ phone: phoneId }).sort('-createdAt')
    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// POST /api/phones/:phoneId/comments
exports.addComment = async (req, res) => {
  try {
    const { phoneId } = req.params
    const { user, userName, content } = req.body
    
    if (!user || !content) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    
    const comment = await Comment.create({ 
      phone: phoneId, 
      user, 
      userName: userName || 'Anonymous',
      content 
    })
    
    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}