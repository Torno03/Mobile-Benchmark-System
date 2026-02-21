const express = require('express')
const router = express.Router({ mergeParams: true })
const commentController = require('../controllers/commentController')

router.get('/:phoneId/comments', commentController.getComments)
router.post('/:phoneId/comments', commentController.addComment)

module.exports = router