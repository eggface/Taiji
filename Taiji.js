var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";

function p(msg) {
    console.log(msg);
}
function pTips(msg) {
    //36: CYAN
    console.log('\x1b[36m', msg,'\x1b[0m');
}
function pErr(msg) {
    //41: red
    console.log('\x1b[41m', msg,'\x1b[0m');
}

pTips("This is Taiji used to interpret YANG");

function write(file, str) {
    var fs = require('fs');
    fs.writeFile(file, str, function (err) {
        if (err) {
            return p(err);
        }

        p("The file [" + file + "] was saved!");
    });
}

function read(file) {
    var fs = require("fs");

    // Synchronous read
    return fs.readFileSync(file).toString();
}


//Test parts
var read_str = read(dir + "YANG");
p("Read file and get string: " + read_str);

write(dir + "schema", "this is an output schema file");
write(dir + "html", "this is an output html File");

//read("./Taiji/output2");
