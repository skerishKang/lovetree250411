console.log('userController2: 파일 정상 진입');

exports.toggleFollow = (req, res) => {
  res.json({ message: 'toggleFollow 테스트(userController2)' });
};

module.exports = exports; 