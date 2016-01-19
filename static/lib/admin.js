'use strict';

define('admin/plugins/grab', ['settings'], function(Settings) {

  var ACP = {};

  ACP.init = function() {
    Settings.load('grab', $('.grab-settings'));

    $('#save').on('click', function() {
      Settings.save('grab', $('.grab-settings'), function() {
        app.alert({
          type: 'success',
          alert_id: 'grab-saved',
          title: 'Settings Saved',
          message: 'Please reload your NodeBB to apply these settings',
          clickfn: function() {
            socket.emit('admin.reload');
          }
        });
      });
    });

    $('#reset').click(function(event) {
      event.preventDefault();
      socket.emit('admin.settings.clearSettings', null, function(err, data) {
        app.alert({
          type: 'success',
          alert_id: 'grab-saved',
          title: 'Settings Saved',
          message: 'Please reload your NodeBB to apply these settings',
          clickfn: function() {
            socket.emit('admin.reload');
          }
        });
      });
    });
  };

  return ACP;
});