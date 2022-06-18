const fs = require('fs');
const util = require("util");

const deleteFile = async (filePath) => {
  await util.promisify(fs.unlink)(filePath);
}

module.exports = {
  deleteFile
}
