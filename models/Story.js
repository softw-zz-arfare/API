var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SceneSchema = new Schema({

  writer_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  scene_text: {
    type: String,
    required: true,
    notEmpty: true
  },
  time: Date,
  like_count: Number,
  dislike_count: Number,
  status_approved: Boolean,
  position_in_story: Number

});

SceneSchema.path('scene_text').validate(function(v){
  if(v.length < 24 || v.length > 1024){
    return false;
  }
  return true;

}, "Scene cannot be lessthan 24 and morethan 1024 characters");

var StorySchema = new Schema({

  title: {
    type: String,
    required: true,
    notEmpty: true
  },
  description: {
    type: String,
    required: true,
    notEmpty: true
  },
  owner_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  start_date: Date,
  key_words: [String],
  genre: String,
  scenes: [SceneSchema],
  is_deleted: Boolean,
  moderator_comments: String

});

StorySchema.path('title').validate(function(v){
  if(v.length < 8 || v.length > 48){
    return false;
  }
  return true;
}, "Story title cannot be lessthan 8 and morethan 48 characters");

module.exports = mongoose.model('Story', StorySchema);
