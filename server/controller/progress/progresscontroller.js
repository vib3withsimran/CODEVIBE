const Progress = require('../../models/progress');
const { getRedisClient } = require('../../config/redis');

exports.getProgress = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const progress = await Progress.findOne({ email });

    if (req.user && req.user.email !== email) {
      return res.status(403).json({ message: 'Forbidden: you can only access your own progress' });
    }
    
    if (!progress) {
      return res.json({ 
        email, 
        completedLessons: [], 
        scores: {},
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        dailyGoal: 1,
      });
    }

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDailyGoal = async (req, res) => {
  try {
    const { dailyGoal } = req.body;
    const email = req.user.email;

    if (!dailyGoal || dailyGoal < 1 || dailyGoal > 10) {
      return res.status(400).json({ message: "Daily goal must be between 1 and 10" });
    }

    const progress = await Progress.findOneAndUpdate(
      { email },
      { dailyGoal },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.json({ success: true, dailyGoal: progress.dailyGoal });
  } catch (err) {
    console.error("UPDATE GOAL ERROR:", err);
    res.status(500).json({ message: "Failed to update goal" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `leaderboard:global:page:${page}:limit:${limit}`;
    const redisClient = getRedisClient();

    // 1. Try to fetch from cache
    if (redisClient) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      } catch (err) {
        console.warn('⚠️ Redis get error:', err);
      }
    }

    // Single aggregation pipeline replaces two separate queries.
    // Uses the compound index { xp: -1, level: -1 } for efficient sorting.
    // $facet lets us compute paginated data AND total count in one database round-trip.
    const [result] = await Progress.aggregate([
      {
        $facet: {
          data: [
            { $sort: { xp: -1, level: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                username: 1,
                xp: 1,
                level: 1,
                badges: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
        },
      },
    ]);

    const responsePayload = {
      data: result.data,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };

    // 2. Save result to cache (TTL: 10 minutes)
    if (redisClient) {
      try {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(responsePayload));
      } catch (err) {
        console.warn('⚠️ Redis setEx error:', err);
      }
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
};