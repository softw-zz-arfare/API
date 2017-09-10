var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

  first_name: String,
  last_name: String,
  password: String,
  email_id: String

});

module.exports = mongoose.model('User', UserSchema);
