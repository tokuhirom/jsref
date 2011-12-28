var gdbm = require('gdbm');

function DB(path) {
    this.gdbm = new gdbm.GDBM();
    if (!this.gdbm.open(path, 0, gdbm.GDBM_WRCREAT)) {
        throw path + " : " + this.gdbm.strerror();
    }
}
DB.prototype = {
    exists: function (url) {
        return this.gdbm.exists(url);
    },
    insert: function (url, content) {
        return this.gdbm.store(url, content);
    },
    fetch: function (url) {
        return this.gdbm.fetch(url);
    },
    listUrls: function () {
        var ret = new Array();
        var key = this.gdbm.firstkey();
        while (key) {
            ret.push(key);
            key = this.gdbm.nextkey(key);
        }
        return ret;
    }
};
exports.DB = DB;
