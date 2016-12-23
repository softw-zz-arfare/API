var express = require('express');
var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var FeedSchema = new Schema({

  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  story_id:{
    type: Schema.Types.ObjectId
  },
  action_type: Number, //0- Liked, 1- Disliked, 2- Followed, 3- Started new Story, 4- Added a Scene
  time: Date,
  security_mode: Number, //0- Public, 1- Private
  text_to_show: String,
  user_name: String,
  story_name: String,
  user_dp: String  

});

FeedSchema.plugin(paginate);

module.exports = mongoose.model('Feed', FeedSchema);
