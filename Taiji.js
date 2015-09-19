var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";

function p(msg) {
    console.log(msg);
}
function pTips(msg) {
    //36: CYAN
    console.log('\x1b[36m', msg, '\x1b[0m');
}
function pErr(msg) {
    //41: red
    console.log('\x1b[41m', msg, '\x1b[0m');
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
//var read_str = read(dir + "YANG");
//p("Read file and get string: " + read_str);

//write(dir + "schema", "this is an output schema file");
//write(dir + "html", "this is an output html File");

//read("./Taiji/output2");
pTips("In reading YANG process:")
pTips(" File -> String -> Shink(Removing comments, spaces, enters) -> Array")
pTips(" -> Looking for and splited into TypeKey(Like: leaf maxndr or type uint32) and body({})")
pTips(" ==> Loop until no more TypeKey")

pTips("");
pTips("Here is the place to define yang object with YANG file structure.");
//
//*******************************************************************************************//
//
//Node with Name, Type and an array of sub-nodes
function createNode(node) {
    var obj = new Object();
    obj.name = node.name;
    obj.type = node.type;
    obj.subNodes = new Array();

    //Link to functions
    obj.nodeToString = nodeToString;
    obj.nodeAddSubs = nodeAddSubs;

    return obj;
}

function nodeToString(level) {
    if (null == level) {
        p(this.name + ":");
        level = 0;
    }
    var prefix = "";
    var j;
    for (j = 0; j < level; j++) {
        prefix = prefix + "    ";
    }

    p(prefix + "|" + this.name + " (" + this.type + ")");
    var i;
    level++;
    for (i = 0; i < this.subNodes.length; i++) {
        this.subNodes[i].nodeToString(level);
    }
}

function nodeAddSubs(subNode) {
    p(this.name + " add subNode " + subNode.name);
    this.subNodes[this.subNodes.length] = subNode;
}

var drProf = createNode({name: "data-rate-profile", type: "grouping"});
var maxndr = createNode({name: "maxndr", type: "leaf"});
var minetr = createNode({name: "minetr", type: "leaf"});

drProf.nodeAddSubs(maxndr);
drProf.nodeAddSubs(minetr);

drProf.nodeToString();

