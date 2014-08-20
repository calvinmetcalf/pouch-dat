pouch-dat
====

`npm install pouch-dat`

replicate data from pouchdb to dat, usage

```js
var PouchDB = require('pouchdb');
var dat = require('dat');
var pouchDat = require('pouch-dat');
pouchDat(PouchDB('./path/to/pouchDatabase', dat('./path/to/datDatabase'), {
  //to be passed to pouchdb defaults are
  live: true,
  include_docs: true
}))
```
