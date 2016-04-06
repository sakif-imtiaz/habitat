ShiftList = new Mongo.Collection('shifts');
BuildList = new Mongo.Collection('builds');



if(Meteor.isClient){
  //BUILDS
  if(true){
    Template.builds.helpers({
      'builds': function(){
        return BuildList.find({}, {sort: {name: 1}});
      },
      'selectedBuildClass' : function () {
        var buildID = this._id;
        var selectedBuild = Session.get('selectedBuild');
        if(selectedBuild == buildID)
          return "selected-build";
      },
      'showSelectedBuild' : function () {
        var selectedBuild = Session.get('selectedBuild');
        return BuildList.findOne(selectedBuild);
      }
    });

    Template.builds.events({
      'click .build': function(){
        console.log(this._id);
        if(this._id)
          Session.set('selectedBuild', this._id == Session.get('selectedBuild') ? null : this._id);
      },
      'click .remove': function(){
        var selectedBuild = Session.get('selectedBuild');
        BuildList.remove(selectedBuild);
        Session.set('selectedBuild',null);
      }
    });
  }


  //BUILD FORM
  if(true){
    Template.build_form.helpers({
      'showSelectedShift' : function () {
        var selectedBuild = Session.get('selectedBuild');
        return BuildList.findOne(selectedBuild);
      }
    });

    Template.build_form.events({
      'submit form': function (e) {
        e.preventDefault();
        //var currentUserId = Meteor.userId();
        var selectedBuild = Session.get('selectedBuild');
        var t = e.target;
        var formData = {
          'name': t.buildName.value
        };
        if(selectedBuild){
          BuildList.update(selectedBuild, {$set: {'name': formData.name}});
        } else {
          BuildList.insert(formData);
        }
      }
    });
  }

  //SHIFTS
  if(true){
    Template.shifts.helpers({
      'shifts': function(){
        return ShiftList.find({}, {sort: {name: 1}});
      },
      'selectedShiftClass' : function () {
        var shiftID = this._id;
        var selectedShift = Session.get('selectedShift');
        if(selectedShift == shiftID)
          return "selected-shift";
      },
      'showSelectedShift' : function () {
        var selectedPlayer = Session.get('selectedShift');
        return ShiftList.find({}, {sort: { name: -1}});
      },
      'getBuildName' : function(buildID) {
        //console.log
        return BuildList.findOne(buildID).name;
      }
    });

    Template.shifts.events({
      'click .shift': function(){
        if(this._id)
          Session.set('selectedShift', this._id == Session.get('selectedShift') ? null : this._id);
      },
      'click .remove': function(){
        var selectedShift = Session.get('selectedShift');
        ShiftList.remove(selectedShift);
      }
    });
  }
  //SHIFT FORM
  if(true){
    Template.shift_form.helpers({
      'showSelectedShift' : function () {
        var selectedShift = Session.get('selectedShift');
        return ShiftList.findOne(selectedShift);
      },
      'builds' : function () {
        //var selectedShift = Session.get('selectedShift');
        return BuildList.find();
      }
    });

    Template.shift_form.events({
      'submit form': function (e) {
        e.preventDefault();
        //var currentUserId = Meteor.userId();
        var selectedShift = Session.get('selectedShift');
        var t = e.target;
        var formData = {
          'name': t.name.value,
          'date': Date(t.date.value),
          'build': t.build.value,
          'time': t.time.value
        };
        if(selectedShift){
          ShiftList.update(selectedShift, {$set: formData});
        } else {
          ShiftList.insert(formData);
        }
      }
    });
  }


}