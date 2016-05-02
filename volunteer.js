ShiftList = new Mongo.Collection('shifts');
BuildList = new Mongo.Collection('builds');



if(Meteor.isClient){
  //BUILDS

  Router.route('/', function(){
    this.render('home');
  },  {name:'home'});
  Router.route('/manage',{name:'manage'});
  Router.route('/volunteer',{name:'volunteer'});
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });

  //builds
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

  if(true){
    Template.cart.helpers({
      'signed_up_shifts' : function() {
        var signed_up_shifts_ids = Session.get('signed_up_shifts');
        console.log(signed_up_shifts_ids)
        if(signed_up_shifts_ids)
          return ShiftList.find({_id: {$in: (signed_up_shifts_ids || []) }});
        else
          return [];
      }
    });
    // Template.shifts.events({
    //   'click .shift': function(){
    //     if(this._id)
    //       Session.set('selectedShift', this._id == Session.get('selectedShift') ? null : this._id);
    //     else
    //       Session.set('selectedShift', this._id);
    //   },
    //   'click .remove': function(){
    //     var selectedShift = Session.get('selectedShift');
    //     ShiftList.remove(selectedShift);
    //   }
    // });
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
      'isInCart' : function(){
        console.log(Session.get('signed_up_shifts'));
        return _.contains(Session.get('signed_up_shifts'), this._id);
      },
      'showSelectedShift' : function () {
        var selectedShift = Session.get('selectedShift');

        return ShiftList.findOne(selectedShift, {sort: { name: -1}});
      },
      'allowSignup': function () {
        // var controller = Iron.controller();
        return true;
        },
      'getBuildName' : function(buildID) {
        //console.returnfa
        return BuildList.findOne(buildID).name;
      },
      'grouped_shifts' : function () {
        var shifts = ShiftList.find({}, {sort: {date: 1}}).fetch();
        var grouped_shifts = _.groupBy(shifts, function(shift){
          return shift.build;
        });
        var paired = _.pairs(grouped_shifts);
        //debugger;
        var grouped = _.map(paired, function  (kv) {
          console.log("***************");
          console.log(kv);
          console.log(BuildList.findOne(kv[0]));
          return {
            build : BuildList.findOne(kv[0]).name,
            shifts : kv[1]
          };
        });
        return grouped;
      },
      'build_name': function(shift_group){
        return BuildList.findOne(shift_group[1][0].build).name;
      },
      'formatted_date': function(shift){
        var fd = [shift.date.getMonth()+1, shift.date.getDate()+1, shift.date.getFullYear()].join('/');
        return fd;
      }
    });

    Template.shifts.events({
      'click .shift': function(e){
        if(e.target.name == 'add_to_cart'){
          if(this._id)
            Session.set('selectedShift', this._id == Session.get('selectedShift') ? null : this._id);
          else
            Session.set('selectedShift', this._id);
        }
      },
      'change .add_to_cart': function(e){
       // debugger;
        var existing_signed_up_shifts_array
        if(!(_.isArray(Session.get('signed_up_shifts'))))
            existing_signed_up_shifts_array =  [];
        else
          existing_signed_up_shifts_array = Session.get('signed_up_shifts');
        var checked = $(e.target).is(":checked");
        if(checked){
          // if(Session.get('signed_up_shifts')){
          //   Session.set(Session.get('signed_up_shifts').push(this._id));
          // }else {
          existing_signed_up_shifts_array.push(this._id);
          Session.set('signed_up_shifts', existing_signed_up_shifts_array.push(this._id));
          //}
        }else
          _.without(existing_signed_up_shifts_array, this._id)
          Session.set('signed_up_shifts', existing_signed_up_shifts_array);
        return false;
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
      },
      'showSelectedShiftDate' : function () {
        var selectedShiftID = Session.get('selectedShift');
        if(!selectedShiftID)
          return null;
        var selectedShift = ShiftList.findOne(selectedShiftID);
        var ssd = new Date(selectedShift.date);

        var monthNum = ssd.getMonth()+1;
        var monthStr = monthNum > 9 ? monthNum + '' : '0'+monthNum;

        var dateNum = ssd.getDate()+1;
        var dateStr = dateNum > 9 ? dateNum + '' : '0'+dateNum;
        var fds =  [ssd.getFullYear(), monthStr, dateStr].join('-');
        return fds;
      },
      'matchesSelectedShiftBuildId': function (val) {
        
        var selectedShiftID = Session.get('selectedShift');
        if(!selectedShiftID)
          return null;
        var selectedShift = ShiftList.findOne(selectedShiftID);
        return selectedShift.build == val;
      }
    });

    // Template.shift_form.onRendered(function(){

    // });

    Template.shift_form.events({
      'submit form': function (e) {
        e.preventDefault();
        //var currentUserId = Meteor.userId();
        var selectedShift = Session.get('selectedShift');
        var t = e.target;
        var formData = {
          'name': t.name.value,
          'date': new Date(t.date.value),
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

  if(true){
    Template.shift_render.helpers({
      'formatted_date': function(){
        var fd = [this.date.getMonth()+1, this.date.getDate()+1,this.date.getFullYear()].join('/');
        return fd;
      },
      'selectedShiftClass': function () {
        return this._id == Session.get('selectedShift') ? 'selected-shift' : null;
      }
    })
  }

}