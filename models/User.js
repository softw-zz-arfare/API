var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

  facebook_id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: String,
  last_name: String,
  user_type: Number, //0- Super Admin, 1- Moderator, 2- User
  location: {
    location_name: String, //City, Country
    lat: String,
    long: String
  },
  profile_pic_url: String, //URL to Profile Picture (Facebook profile picture)
  gender: Number, //0- Male, 1- Female, 2- Not specified
  last_active_date: Date,
  state: Number, //0- Inactive, 1- Active, 2- Suspended, 3- Removed
  signup_date: Date,
  dob: Date,
  registration_source: Number, //0- Facebook
  device: {
    device_type: Number, //0- Android, 1- iOS
    device_token: String
  },
  following: [Schema.Types.ObjectId]

});

module.exports = mongoose.model('User', UserSchema);
