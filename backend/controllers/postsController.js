const Post = require('../models/Post');
const User = require('../models/user');
const { createNotification } = require('./notificationController');

// 게시물 목록 조회 (정렬 및 카테고리 필터링)
exports.getPosts = async (req, res) => {
  try {
    const { sort = 'latest', page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    let sortOption = {};
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { likes: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 카테고리 필터링 조건
    const filter = category ? { category } : {};

    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'username profileImage')
      .populate('likes', 'username');

    const totalPosts = await Post.countDocuments(filter);

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    res.status(500).json({ message: '게시물을 불러오는데 실패했습니다.' });
  }
};

// 게시물 생성
exports.createPost = async (req, res) => {
  try {
    const { content, category = '일상' } = req.body;
    const post = new Post({
      content,
      author: req.user.id,
      image: req.file ? req.file.path : null,
      category
    });

    await post.save();
    await post.populate('author', 'username profileImage');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: '게시물 생성에 실패했습니다.' });
  }
};

// 게시물 수정
exports.updatePost = async (req, res) => {
  try {
    const { content, category } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    post.content = content;
    if (category) post.category = category;
    if (req.file) post.image = req.file.path;

    await post.save();
    await post.populate('author', 'username profileImage');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '게시물 수정에 실패했습니다.' });
  }
};

// 게시물 삭제
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await post.remove();
    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '게시물 삭제에 실패했습니다.' });
  }
};

// 게시물 좋아요
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // 좋아요 추가
      post.likes.push(userId);
      
      // 좋아요 알림 생성 (게시물 작성자에게만)
      if (post.author.toString() !== userId.toString()) {
        await createNotification(
          post.author,
          userId,
          'like',
          post._id
        );
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 