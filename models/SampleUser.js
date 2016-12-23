var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SampleUserSchema = new Schema({

  first_name: String,
  last_name: String

});

SampleUserSchema.pre('save', function(next){

  console.log('saving user ');
  next();

})

SampleUserSchema.post('save', function(user){

  console.log('user saved : ' + user.first_name);

})

module.exports = mongoose.model('SampleUser', SampleUserSchema);
