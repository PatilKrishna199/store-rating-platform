const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating } = require('../models');

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

// POST /api/admin/users  - create a normal user or an admin
// body: { name, email, password, address, role }  role in ['user','admin','store_owner']
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    if (!['user', 'admin', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role });

    const { id, createdAt } = user;
    res.status(201).json({ user: { id, name, email, address, role, createdAt } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// POST /api/admin/stores  - register a new store, optionally attached to an
// existing store_owner user via ownerId.
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A store with this email already exists' });
    }

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'store_owner') {
        return res.status(400).json({ message: 'ownerId must reference an existing store_owner user' });
      }
    }

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    res.status(201).json({ store });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create store', error: err.message });
  }
};

const USER_SORT_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&sortOrder=
exports.listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (role) where.role = role;

    const order = USER_SORT_FIELDS.includes(sortBy) ? sortBy : 'name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[order, direction]],
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

const STORE_SORT_FIELDS = ['name', 'email', 'address', 'overallRating'];

// GET /api/admin/stores?name=&email=&address=&sortBy=&sortOrder=
exports.listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const order = STORE_SORT_FIELDS.includes(sortBy) ? sortBy : 'name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'overallRating']],
      },
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: ['Store.id'],
      order:
        order === 'overallRating'
          ? [[literal('"overallRating"'), direction]]
          : [[order, direction]],
      subQuery: false,
    });

    const result = stores.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      overallRating: Number(parseFloat(s.get('overallRating')).toFixed(2)),
    }));

    res.json({ stores: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stores', error: err.message });
  }
};

// GET /api/admin/users/:id - full detail; includes rating if store owner
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Store, as: 'ownedStore' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let rating = null;
    if (user.role === 'store_owner' && user.ownedStore) {
      const avg = await Rating.findOne({
        where: { storeId: user.ownedStore.id },
        attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'avg']],
        raw: true,
      });
      rating = Number(parseFloat(avg.avg).toFixed(2));
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// GET /api/admin/store-owners - lightweight list, used to populate the
// "assign owner" dropdown when creating a store
exports.listStoreOwners = async (req, res) => {
  try {
    const owners = await User.findAll({
      where: { role: 'store_owner' },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']],
    });
    res.json({ owners });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch store owners', error: err.message });
  }
};
