'use strict';
var PouchDB = require('pouchdb');
var through = require('through2').obj;
PouchDB.plugin(require('pouch-stream'));
var xtend = require('xtend');

module.exports = function (dat, pouch, opts){
  opts = opts || {};
  opts = xtend({
    live: true,
    include_docs: true
  }, opts);
  var stream = pouch.createReadStream(opts);
  var out = stream.pipe(through(function (ch, _, next) {
    var doc = ch.doc;
    dat.get(doc._id, function (err, datDoc) {
      if (err) {
        return next(null, doc);
      }
      doc.version = datDoc.version + 1;
      return next(null, doc);
    });
  })).pipe(dat.createWriteStream({
    primary: '_id'
  }));
  out.cancel = function () {
    return stream.cancel();
  };
  return out;
};