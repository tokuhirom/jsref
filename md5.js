var crypto = require('crypto');

console.log(md5_hex('All your base are belongs to us.'));

function md5_hex(src) {
    var md5 = crypto.createHash('md5');
    md5.update(src);
    return md5.digest('hex');
}
