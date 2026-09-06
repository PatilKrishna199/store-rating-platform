const { Op, fn, col, literal } = require('sequelize');
const { Store, Rating } = require('../models');

const ALLOWED_SORT_FIELDS = ['name', 'address', 'overallRating'];

// GET /api/stores?name=&address=&sortBy=&sortOrder=
// Available to any authenticated normal user. Returns every store together
// with its overall average rating and, if the caller has rated it, their
// own submitted rating.
exports.listStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const order = ALLOWED_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : 'name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [
          [fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'overallRating'],
          [fn('COUNT', col('ratings.id')), 'ratingCount'],
        ],
      },
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: ['Store.id'],
      order:
        order === 'overallRating'
          ? [[literal('"overallRating"'), direction]]
          : [[order, direction]],
      subQuery: false,
    });

    // Attach the current user's own rating for each store
    const userRatings = await Rating.findAll({
      where: { userId: req.user.id },
    });
    const ratingByStore = Object.fromEntries(
      userRatings.map((r) => [r.storeId, r.rating])
    );

    const result = stores.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      overallRating: Number(parseFloat(s.get('overallRating')).toFixed(2)),
      ratingCount: Number(s.get('ratingCount')),
      userRating: ratingByStore[s.id] || null,
    }));

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};

// POST /api/stores/:id/rating  body: { rating: 1-5 }
// Creates the caller's rating for a store, or updates it if one already exists.
exports.submitRating = async (req, res) => {
  try {
    const storeId = Number(req.params.id);
    const { rating } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const [record, created] = await Rating.findOrCreate({
      where: { userId: req.user.id, storeId },
      defaults: { rating },
    });

    if (!created) {
      record.rating = rating;
      await record.save();
    }

    res.status(created ? 201 : 200).json({
      message: created ? 'Rating submitted' : 'Rating updated',
      rating: record.rating,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
};
