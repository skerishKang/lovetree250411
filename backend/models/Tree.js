const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TreeSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  media: [{
    type: String,
    trim: true
  }],
  thumbUrl: {
    type: String,
    default: ''
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tree', TreeSchema); 