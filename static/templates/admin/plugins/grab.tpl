<div class="row">
  <div class="col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading">Grab Settings</div>
      <div class="panel-body">
        <form role="form" class="grab-settings">
          <div class="form-group">
            <label for="appId">Application ID</label>
            <input type="text" id="appId" name="appId" title="Application ID" class="form-control" placeholder="Application ID"><br />
          </div>
          <div class="form-group">
            <label for="appSecret">App Secret</label>
            <input type="text" id="appSecret" name="appSecret" title="App Secret" class="form-control" placeholder="App Secret">
          </div>
          <div class="form-group">
            <label for="interalUpdate">Interval Update (minutes)</label>
            <input type="number" id="interalUpdate" name="interalUpdate" title="Interval update" class="form-control" placeholder="Recommend 60 min">
          </div>
          <div class="form-group">
            <label for="cid">Category ID</label>
            <input type="text" id="cid" name="cid" title="Category ID" class="form-control" placeholder="Category ID">
          </div>
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" title="Title" class="form-control" placeholder="Title">
          </div>
          <div class="form-group">
            <label for="uid">User ID</label>
            <input type="text" id="uid" name="uid" title="User ID" class="form-control" placeholder="User ID">
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
  <i class="material-icons">save</i>
</button>