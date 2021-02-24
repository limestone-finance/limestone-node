const fs = require('fs');
const runner = require('./runner');

//TODO: Handle incorrect filename and provide info if run without parameters

let configFileName = process.argv[2];

let config = JSON.parse(fs.readFileSync(configFileName, 'utf-8'));
runner.run(config);


