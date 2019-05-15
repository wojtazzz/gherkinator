var fs = require('fs');
const appConfig = require('./config')


// make Promise version of fs.readdir()
fs.readdirAsync = function (dirname) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dirname, function (err, filenames) {
            if (err)
                reject(err);
            else
                resolve(filenames);
        });
    });
};

// make Promise version of fs.readFile()
fs.readFileAsync = function (filename, enc) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, enc, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                console.log(data);
                resolve(data);
            }
        });
    });
};

// utility function, return Promise
function getFile(filename) {
    return fs.readFileAsync(filename, 'utf8');
}


async function parseStepsAsync() {
    let file = await fs.readFileAsync(appConfig['stepsFile']);

    let lines = file.toString().split("\n");
    return lines[6];
}

function storeStepsFile(json) {
    fs.appendFile('steps.json', json, 'utf8', function (err) {
        if (err) throw err;
        console.log('File was created successfully.');
    });
}

function parseSteps() {

    const folder = appConfig.stepsFolder;


    fs.unlink('./steps.json', (err) => {
        if (err) console.log('No steps file');
        console.log('steps file was deleted');
    });

    let files = fs.readdirSync(folder)
    let stepObjects = [];

    files.forEach(fileName => {
        let file = fs.readFileSync(folder + fileName, 'utf8');
        let lines = file.toString().split("\n");
        
        let steps = lines.filter(line => line.includes("^"))
            .map(line => 
                ({
                     type: getSubstringToChar(line, '('),
                     definition: getSubstring(line, '^', '$')
                })
            );

        steps.forEach(function (step) {
            
            stepObjects.push({
                "definition": step['definition'],
                "category": fileName,
                "type": step['type']
            })
        });
    })

    console.log(stepObjects);
    storeStepsFile(JSON.stringify(stepObjects));

    return stepObjects;
}

function getSubstringToChar(string, endChar) {
    return string.substring(0, string.indexOf(endChar));
}

function getSubstring(string, startChar, endChar) {
    return string.substring(
        string.indexOf(startChar) + 1,
        string.lastIndexOf(endChar)
    );
}

module.exports.parseSteps = parseSteps;