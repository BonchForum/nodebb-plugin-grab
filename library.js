/**
 * Проверять посты - если есть новые, то публиковать от имени подслушано, затем сохранять дату только последнего поста. 
 */

(function(module) {
  "use strict";

  var VKSdk = require('vksdk'),
    Topics = require.main.require('./src/topics'),
    meta = module.parent.require('./meta'),
    winston = module.parent.require('winston'),
    SocketAdmin = module.parent.require("./socket.io/admin");

  var grab = {},
    timeUpdateSec = 60 * 30,
    timer = {},
    requestCountPosts = 100,
    lastPostDate = -1,
    vk = {};

  const groupID = -59914468;

  grab.init = function(params, callback) {
    function render(req, res) {
      res.render('admin/plugins/grab', {});
    }

    var router = params.router,
      hostMiddleware = params.middleware;

    router.get('/admin/plugins/grab', hostMiddleware.admin.buildHeader, render);
    router.get('/api/admin/plugins/grab', render);

    callback();

    grab.setSettings()
      .then(function() {
        vk = new VKSdk({
          'appId': grab.settings.appId,
          'appSecret': grab.settings.appSecret,
          'language': 'ru'
        });

        lastPostDate = grab.settings.lastPostDate || -1;

        winston.info("[nodebb-plugin-grab] LAST POST DATE: " + lastPostDate);
        timer = setInterval(grab.cicleTick, grab.settings.interalUpdate * 60 * 1000);
        if (lastPostDate == -1) {
          grab.firstRun();
        } else {
          grab.cicleTick();
        }
      });
  };

  grab.addAdminNavigation = function(header, callback) {
    header.plugins.push({
      route: '/plugins/grab',
      icon: 'fa-tint',
      name: 'Grab'
    });

    callback(null, header);
  };

  grab.clearSettings = function() {
    winston.info('[nodebb-plugin-grab] Settings reset!');

    lastPostDate = grab.settings.lastPostDate = -1;
    grab.saveSettings()
      .then(function() {
        grab.firstRun();
      });
  }

  grab.cicleTick = function() {
    grab.getPosts()
      .then(grab.publicatePosts)
      .catch(function(err) {
        winston.error('[nodebb-plugin-grab] Error: ' + err);
        winston.error('[nodebb-plugin-grab] Error stack: ' + err.stack);
      });
  }

  /**
   * Функция для публикации постов
   * @param  {Array} posts Массив постов
   * @return {Promise}
   */
  grab.publicatePosts = function(posts) {
    return new Promise(function(res, err) {
      winston.info('[nodebb-plugin-grab] lastPostDate: ' + lastPostDate)
      posts = posts.filter(function(element) {
        return element.date > lastPostDate;
      }, this);

      if (posts.length == 0) {
        winston.info('[nodebb-plugin-grab] Nothing to publicate...');
        res();
      }

      grab.settings.lastPostDate = lastPostDate = grab.getLastDatePost(posts);
      grab.saveSettings();

      winston.info('[nodebb-plugin-grab] Will be publicate ' + posts.length + ' posts');

      var promisesTopic = [];
      posts.forEach(function(element) {
        promisesTopic.push(grab.createTopic(element.text));
      });

      Promise.all(promisesTopic)
        .then(function(posts) {
          winston.info('[nodebb-plugin-grab] All posts (' + posts.length + ') publicate');
          res(posts);

        })
        .catch(err);
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

  grab.saveSettings = function() {
    return new Promise(function(res, err) {
      meta.settings.set('grab', grab.settings, function(error, settings) {
        grab.settings = settings;
        res();
      });
    });
  }

  grab.createTopic = function(text) {
    return new Promise(function(res, err) {
      var payload = {
        cid: grab.settings.cid, // The category id
        title: text.substr(0, 30) + "...",
        content: text,
        uid: grab.settings.uid, // The user posting the topic.
        timestamp: Date.now() // When the post was created.
      };

      Topics.post(payload, function(errTopic, data) {
        if (errTopic) err(errTopic);
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
        'offset': offset || 0,
        'count': requestCountPosts,
      }
      vk.request('wall.get', data, function(data) {
        winston.info('[nodebb-plugin-grab] getPosts() call all.items.length: ' + data.response.count);
        res(data.response.items);
      });
    });
  }

  grab.firstRun = function() {
    var promisesPosts = [];
    for (var i = 0; i < 5; i++) {
      promisesPosts.push(grab.getPosts(i * 100));
    }

    Promise.all(promisesPosts)
      .then(function(posts) {
        winston.info("[nodebb-plugin-grab] Ready to publicate: " + posts.length + " posts");
        grab.publicatePosts(posts);
      })
      .catch(function(err) {
        winston.error('[nodebb-plugin-grab] Error: ' + err);
        winston.error('[nodebb-plugin-grab] Error stack: ' + err.stack);
      });
  }

  SocketAdmin.settings.clearSettings = function(socket, data, callback) {
    grab.clearSettings();
    callback();
  }

  module.exports = grab;
}(module));