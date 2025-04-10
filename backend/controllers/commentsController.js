const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('./notificationController');

// 댓글 생성
exports.createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId
    });

    await comment.save();

    // 게시물의 댓글 배열에 새 댓글 추가
    post.comments.push(comment._id);
    await post.save();

    // 댓글 알림 생성 (게시물 작성자에게만, 자기 자신이 아닌 경우)
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification(
        post.author,
        req.user._id,
        'comment',
        postId,
        comment._id
      );
    }

    // 게시물 작성자가 아닌 다른 사용자의 댓글에 대댓글을 남긴 경우
    if (req.body.parentComment) {
      const parentComment = await Comment.findById(req.body.parentComment);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await createNotification(
          parentComment.author,
          req.user._id,
          'comment',
          postId,
          comment._id
        );
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 