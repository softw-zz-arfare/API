var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var router = express.Router();

var Story = require('../models/Story');
var User = require('../models/User');
var Feed = require('../models/Feed');

/* GET home page. */
router.get('/', function(req, res, next) {

  var stories_no;
  var users_no;
  var feed_no;
  Story.find({}, function(err, stories){
    if(err){
      stories_no = -1;
    }else{
      stories_no = stories.length;

      User.find({}, function(err, users){
        if(err){
          users_no = -1;
        }else{
          users_no = users.length;

          var timestamp = new Date(Date.now() - 1 * 60 * 60 * 1000);

          Feed.find({"time": {$gt: timestamp}}, function(err, feeds){
            if(err){
              stories_no = -1;
            }else{
              feed_no = feeds.length;
              res.render('index', { title: 'letstory', no_stories: stories_no, no_users: users_no, no_feeds: feed_no });

            }
          });
        }
      });
    }
  });
});

module.exports = router;
