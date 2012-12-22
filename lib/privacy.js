var assert = PROJECTX.assert;
var logger = PROJECTX.logger;
var db = PROJECTX.db;

db.collection('privacy', function(err, collection) {
	assert.equal(err, null);
	privacy = collection;
	logger.info("privacy collection defined and connected to");
});

var Privacy = function() {
};

Privacy.retrieve = function(jid, list, cb) {
	privacy.findOne({"jid":jid}, function(err, doc){
		if (doc){
			cb (doc[list]);
		}
		else{
			privacy.save({"jid":jid, "default":[]}, function(){
				logger.debug("No privacy list for the user found. Default created");
				cb([]);
			});
		}
	});
};

Privacy.edit = function(jid, list, item, cb) {
	logger.debug(list);
	logger.debug(item.attrs.value);
	privacy.findOne({"jid":jid, "default.value":item.attrs.value}, function(err, doc){
		if (doc){
			if(item.attrs.action == 'deny')
				cb(null);
			else {
				privacy.update({"jid":jid}, {$pull:{"default":{"value":item.attrs.value}}}, function(error){
					cb(error);
				});
			}
		}
		else{
			if(item.attrs.action === 'allow')
				cb(null);
			else {
				privacy.update({"jid":jid}, {"$push":{"default":{"type":"jid", "value":item.attrs.value, "action":item.attrs.action}}}, {"upsert":true}, function(error){
					cb(error);
				});
			}
		}
	});	
};

Privacy.validate = function(from, to, cb) {
	privacy.findOne({$or:[{"jid":from, "default.value":to}, {"jid":to, "default.value":from}]}, function(err, doc){
		cb(doc);
	});
}


exports.Privacy = Privacy;

function isEmpty(ob){
   for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
  return true;
}
