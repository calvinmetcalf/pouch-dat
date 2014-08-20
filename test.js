var test = require('tape');
var dat = require('dat');
var PouchDB = require('pouchdb');
var pd = require('./');
var i = 0;
var p,d;

function pre(t) {
	t.plan(2);
	i++;
	p = new PouchDB('./.tmp/pouch_test' + i);
	p.then(function () {
		t.ok(true, 'pouch created');
	}, function () {
		t.ok(false, 'pouch screwed up');
	});
	d = dat('./.tmp/dat_test' + i, function (err) {
		t.error(err, 'dat created')
	})
}

function post(t) {
	t.plan(2);
	p.destroy().then(function () {
		t.ok(true, 'pouch destroyed');
	}, function () {
		t.ok(false, 'error destroying pouch');
	});
	d.destroy(function (err) {
		t.error(err,  'error destroying dat')
	});
}

	test('setup', pre);
	test('the meat',  function (t) {
		var rep;
		t.plan(8);
		p.bulkDocs([{foo: 'bar'}, {
			_id:'midnight',
			mood: 'happy'
		}]).then(function () {
			t.ok(true, 'bulk in');
			rep = pd(d, p);
			return p.bulkDocs([{
				_id: 'thalia',
				mood: 'inquisitive'
			},
			{
				_id: 'calliope',
				mood: 'scared'
			}
			]);
		}).then(function () {
			t.ok(true, "2nd bulk in");
			return p.get('midnight');
		}).then(function (doc) {
			t.ok(true, "got midnight");
			doc.mood = 'angry';
			return p.put(doc);
		})
		.delay(100)
		.then(function () {
			t.ok(true, "put and delayed");
			rep.cancel();
			d.createReadStream().on('data', function (d) {
				console.log(d);
				switch (d.key) {
					case 'midnight':
					    t.equals(d.value.mood, 'angry', 'got midnight');
					    return;
					case 'thalia':
					    t.equals(d.value.mood, 'inquisitive', 'got thalia');
					    return;
					case 'calliope':
					    t.equals(d.value.mood, 'scared', 'got calliope');
					    return;
					default:
						console.log(d);
					    t.equals(d.value.foo,  'bar', 'got rando');
				}
			});
		}).catch(function (e){
			t.ok(false, e);
		});
	});
	test('tear down', post);
