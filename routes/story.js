var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var router = express.Router();
var Schema = mongoose.Schema;

var genres = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Satire', 'Science Fiction', 'Thriller'];

var Story = require('../models/Story');
var Feed = require('../models/Feed');
var User = require('../models/User');
var config = require('../helpers/config');

//middleware to check the token from req and generate user_id
router.use(function(req, res, next){
  var token = req.headers['x-access-token'];
  if(token){
    jwt.verify(token, config.secret, function(err, decode){
      if(err){
        console.log(err);
        res.json({status: false, message: 'Authentication failed'});
      }else{
        console.log(decode.u_id);
        req.body.user_id = decode.u_id;
        next();
      }
    })
  }else{
    res.json({status: false, message:'Authorization token not provided'});
  }
});

// router.post('/test/:id', function(req, res){
//   console.log(req.body);
//   UserUtils.getUserName(req.params.id, function(str){
//     res.json({user: str});
//   });
// });

//Get list of all Genres
router.post('/genres', function(req, res){
  res.json(genres);
});

//List all stories, remove later
router.get('/', function(req, res){
  Story.find({}, function(err, stories){
    res.json(stories);
  })
});

//Get a single story by Id
router.get('/:id', function(req, res){

  //check if the id passed is a valid ObjectId
  if(req.params.id.match(/^[0-9a-fA-F]{24}$/)){
    Story.findOne({"_id": req.params.id}, function(err, story){

      if(err){
        console.log(err);
        res.json({status: false, message: err});
      }

      if(story == null){
        res.json({status: false, message: "Story not found"})
      }else{
        res.json(story);
      }
    });
  }else{
    res.json({status: false, message: "Story not found"});
  }
});

//Get user followed stories
router.post('/followed', function(req, res){

  User.findOne({"_id": req.body.user_id}, function(err, user){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err.message});
    }else{

      Story.find({"_id" : { $in: user.following}}, function(err, stories){
        if(err){
          console.log(err);
          res.json({status: false, message: "Something went wrong", error: err.message});
        }else{
          console.log(stories);
          res.json({status: true, stories: stories});
        }
      });
    }
  });
});

//return list of stories created by user
router.post('/created', function(req, res){

  User.findOne({"_id": req.body.user_id}, function(err, user){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err.message});
    }else{

      Story.find({"owner_id": user._id}, function(err, stories){
        if(err){
          console.log(err);
          res.json({status: false, message: "Something went wrong", error: err.message});
        }else{
          console.log(stories);
          res.json({status: true, stories: stories});
        }
      });
    }
  });
});

//Add new story - from user
router.post('/create', function(req, res){

  var story = new Story();
  story.title = req.body.title;
  story.description = req.body.description;
  story.owner_id = req.body.user_id;
  story.start_date = Date.now();
  story.key_words = req.body.key_words;
  story.genre = req.body.genre;

  story.save(function(err){
    if(err){
      console.log(err);
      res.json({status:false, message: "Unable to create story", error: err});
    }else{

      User.findOne({"_id": story.owner_id}, function(err, user){
        if(err){
          console.log(err);
        }else{
          user.following.push(story._id);
        }
      });

      var feed = new Feed();
      feed.user_id = story.owner_id;
      feed.story_id = story._id;
      feed.action_type = 3;
      feed.time = Date.now();
      feed.security_mode = 0;
      saveFeed(feed);

      res.json({status: true, story: story});
    }
  });
});

//Add scene to a story
router.post('/:id/scene', function(req, res){

  Story.findOne({"_id": req.params.id}, function(err, story){

    if(err){
      console.log(err);
      res.json({status: false, message: err});
    }

    if(story == null){
      res.json({status: false, message: "Story not found"})
    }else{

      story.scenes.push({
        "writer_id": req.body.user_id,
        "scene_text": req.body.scene_text,
        "time": Date.now(),
        "like_count": 0,
        "dislike_count": 0,
        "status_approved": false,
        "position_in_story": story.scenes.length
      });

      story.save(function(err){
        if(err){
          console.log(err);
          res.json({status: false, message: "Unable to add Scene now", error: err.message});
        }else{

          var feed = new Feed();
          feed.user_id = req.body.user_id;
          feed.story_id = story._id;
          feed.time = Date.now();
          feed.security_mode = 0;
          feed.action_type = 4;
          saveFeed(feed);

          res.json({status: true, scenes: story.scenes});
        }
      });
    }
  });
});

//Like or dislike a scene
router.post('/:story_id/:scene_id/:action', function(req, res){

  Story.findOne({"_id": req.params.story_id}, function(err, story){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error: err});
    }else{

      var feed = new Feed();
      feed.user_id = req.body.user_id;
      feed.story_id = story._id;
      feed.time = Date.now();
      feed.security_mode = 0;

      if(req.params.action == "like"){
        story.scenes.id(req.params.scene_id).like_count++;
        feed.action_type = 0;
      }else if(req.params.action == "dislike"){
        story.scenes.id(req.params.scene_id).dislike_count++;
        feed.action_type = 1;
      }
      saveFeed(feed);

      story.save(function(err){
        if(err){
          console.log(err);
          res.json({status: false, message: "Something went wrong", error: err.message});
        }else{
          res.json({status: true, message: "Success!"});
        }
      });
    }
  });
});

//Allow user to follow a story
router.post('/:story_id/follow', function(req, res){

  User.findOne({"_id": req.body.user_id}, function(err, user){

    if(err){
      console.log(err);
      res.json({status: false, message: "Something went wrong", error:err.message});
    }else{
      if(user == null){
        res.json({status: false, message: "User not found. Please re-login and try again"});
      }else{
        Story.findOne({"_id": req.params.story_id}, function(err, story){
          if(err){
            console.log(err);
            res.json({status: false, message: "Something went wrong", error:err.message});
          }else{
            if(story == null){
              res.json({status: false, message: "Story not found"});
            }else{
              user.following.push(story._id);
              user.save(function(err){
                if(err){
                  console.log(err);
                  res.json({status: false, message: "Something went wrong", error:err.message});
                }else{
                  var feed = new Feed();
                  feed.user_id = req.body.user_id;
                  feed.story_id = story._id;
                  feed.time = Date.now();
                  feed.security_mode = 0;
                  feed.action_type = 2;
                  saveFeed(feed);
                  res.json({status: true, message: "Success!"});
                }
              })
            }
          }
        });
      }
    }
  });
});

//function to save feed after forming the text to show
function saveFeed(feed){

  var username;
  var storyname;
  var action;
  var user_dp;
  User.findOne({"_id": feed.user_id}, function(err, user){
    if(err){
      console.log(err);
      username = "";
    }else{

      username = user.first_name + " " + user.last_name;
      console.log("username : " + username);
      user_dp = user.profile_pic_url;
      Story.findOne({"_id": feed.story_id}, function(err, story){
        if(err){
          console.log(err);
          storyname = "";
        }else{
          storyname = story.title;
          if(feed.action_type == 0){
            action = "liked";
          }else if(feed.action_type == 1){
            action = "disliked";
          }else if(feed.action_type == 2){
            action = "started following";
          }else if(feed.action_type == 3){
            action = "started new story";
          }else if(feed.action_type == 4){
            action = "added a scene to";
          }

        console.log(username + " " + action + " " + storyname);
        var a = username + " " + action + " " + storyname;
        feed.user_name = username;
        feed.story_name = storyname;
        feed.user_dp = user_dp;
        feed.text_to_show = a;

        feed.save(function(err){
          if(err)
          console.log(err);
        });

        }
      });
    }
  });
}

module.exports = router;
