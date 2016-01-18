/**
 * Проверять посты - если есть новые, то публиковать от имени подслушано, затем сохранять дату только последнего поста. 
 */

(function(module) {
  "use strict";

  var VKSdk = require('vksdk'),
    Topics = require.main.require('./src/topics'),
    meta = module.parent.require('./meta'),
    winston = module.parent.require('winston');

  var grab = {},
    timeUpdateSec = 60 * 30,
    timer = {},
    requestCountPosts = 100,
    lastPostDate = -1,
    vk = {};

  const groupID = -59914468;

  grab.init = function(params, callback) {
    var router = params.router,
      hostMiddleware = params.middleware,
      hostController = params.controllers;

    router.get('/admin/plugins/grab', hostMiddleware.admin.buildHeader, hostController.renderAdminPage);
    router.get('/api/admin/plugins/grab', hostController.renderAdminPage);

    timer = setInterval(grab.cicleTick, timeUpdateSec * 1000);

    grab.setSettings()
      .then(function() {        
        vk = new VKSdk({
          'appId': grab.settings.appId,
          'appSecret': grab.settings.appSecret,
          'language': 'ru'
        });
      });

    if (callback)
      callback();
  };

  grab.cicleTick = function() {
    return;
    grab.getPosts()
      .then(grab.publicatePosts)
      .catch(function(err) {
        winston.error('[nodebb-plugin-grab] Error: ' + err);
      });
  }

  grab.publicatePosts = function(posts) {
    posts = posts.filter(function(element) {
      return element.date > lastPostDate;
    }, this);

    lastPostDate = grab.getLastDatePost(posts);

    posts.forEach(function(element) {
      grab.createTopic(element.text);
    });
  }

  /**
   * Загружает в настройки приложения в grab.settings
   */
  grab.setSettings = function() {
    return new Promise(function(res, err) {
      if (grab.settings)
        return;

      meta.settings.get('grab', function(err, settings) {
        grab.settings = settings;
        res();
      });
    });
  }

  grab.createTopic = function(text) {
    return new Promise(function(res, err) {
      var payload = {
        cid: setting.cid, // The category id
        title: settings.title,
        content: text,
        uid: settings.uid, // The user posting the topic.
        timestamp: Date.now() // When the post was created.
      };

      Topics.post(payload, function(err2, data) {
        if (err2) err(err2);
        res(data);
      });
    })
  }

  grab.getLastDatePost = function(posts) {
    var lastPost = posts[0];

    posts.forEach(function(element) {
      if (element.date > lastPost.date) {
        lastPost = element;
      }
    }, this);

    return lastPost.date;
  }

  grab.isActualPost = function(post) {
    return post.date > lastPostDate;
  }

  grab.getPosts = function(offset) {
    return new Promise(function(res, err) {
      var data = {
        'owner_id': groupID,
        'offset': offset,
        'count': requestCountPosts,
      }
      vk.request('wall.get', data, res);
    });
  }

  module.exports = grab;
}(module));