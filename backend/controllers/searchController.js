const User = require('../models/user');
const Post = require('../models/Post');

// @desc    통합 검색
// @route   GET /api/search
// @access  Public
exports.searchAll = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 사용자 검색
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email profileImage')
    .limit(limit)
    .skip(skip);

    // 게시물 검색
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      isPublic: true
    })
    .populate('author', 'name profileImage')
    .limit(limit)
    .skip(skip);

    res.json({
      users,
      posts,
      currentPage: page,
      totalPages: Math.ceil(Math.max(users.length, posts.length) / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '검색에 실패했습니다.', error: error.message });
  }
};

// @desc    사용자 검색
// @route   GET /api/search/users
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email profileImage')
    .limit(limit)
    .skip(skip);

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '사용자 검색에 실패했습니다.', error: error.message });
  }
};

// @desc    게시물 검색
// @route   GET /api/search/posts
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      isPublic: true
    })
    .populate('author', 'name profileImage')
    .limit(limit)
    .skip(skip);

    const total = await Post.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      isPublic: true
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '게시물 검색에 실패했습니다.', error: error.message });
  }
}; 