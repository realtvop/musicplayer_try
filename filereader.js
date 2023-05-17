const fs = require('fs');

exports.getFileText = (path) => {
    const content = fs.readFileSync(path).toString();
    console.log(content)
}