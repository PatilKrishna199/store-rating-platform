const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

// GET /api/store-owner/dashboard
// Returns the raters and average rating for the store owned by req.user.
exports.dashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });

    if (!store) {
      return res.status(404).json({ message: 'No store is registered to this account yet' });
    }

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['updatedAt', 'DESC']],
    });

    const avgResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'avg']],
      raw: true,
    });

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating: Number(parseFloat(avgResult.avg).toFixed(2)),
      raters: ratings.map((r) => ({
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        rating: r.rating,
        ratedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};
