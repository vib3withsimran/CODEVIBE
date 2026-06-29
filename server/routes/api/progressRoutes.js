const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware');
const progressController = require('../../controller/progress/progresscontroller');

router.put('/goal', verifyToken, progressController.updateDailyGoal);
router.get('/export/:email', verifyToken, progressController.exportProgress);
router.get('/leaderboard', progressController.getLeaderboard);
router.get('/:email', verifyToken, progressController.getProgress);

module.exports = router;
