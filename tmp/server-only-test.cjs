// Match Next's server-only alias solely in the isolated Node test harness.
const Module = require('node:module');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(id, ...rest) {
 return resolve.call(this, id === 'server-only' ? 'next/dist/compiled/server-only/empty' : id, ...rest);
};
