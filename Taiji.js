function p(msg) {
    console.log(msg);
}

p("hello world! This is Taiji.js");

function write(file, str) {
    var fs = require('fs');
    fs.writeFile(file, str, function (err) {
        if (err) {
            return p(err);
        }

        p("The file [" + file + "] was saved!");
    });
}



//Test parts
write("output", "this is output");
