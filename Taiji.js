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
        p("");
        p(this.name + ": name (type)");
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
var uint32 = createNode({name: "uint32", type: "type"});

drProf.nodeAddSubs(maxndr);
drProf.nodeAddSubs(minetr);

maxndr.nodeAddSubs(uint32);
minetr.nodeAddSubs(uint32);

drProf.nodeToString();

//
//*******************************************************************************************//
//
pTips("Here is the place to convert yang object to schema file.");
//Schemas.dataRateProfile = new SimpleSchema({
//    maxndr: {
//        type: Number,
pTips("type = first level key type, it should be new as a Schema object"); 
pTips("type = 'leaf': name {}"); 
pTips("type = 'type': mapping to schema type"); 
pTips("All nodes should end with ',', if it is not the last one."); 
var key_1_words= ["grouping"];
//var type_mapping_yang_schema = [
//    //{yang_type: "uint32", schema_type: "Number"}
//    {yang_type: "uint32", schema_type: "Number"}
//]
var type_mapping_yang_schema = new Map([
    ["uint32", "Number"]
])

//function getSchemaType(yang_type){
//    p("Try to map yang type: " + yang_type);
//    var i;
//    for(i = 0; i < type_mapping_yang_schema.length; i++){
//        //p("i:" + i + ", yang_type:" + type_mapping_yang_schema[i].yang_type  + ", schema_type:" + type_mapping_yang_schema[i].schema_type);
//        if(yang_type == type_mapping_yang_schema[i].yang_type){
//            return type_mapping_yang_schema[i].schema_type;
//        }
//    }
//}
p("Test to get uint32's schema type: " + type_mapping_yang_schema.get("uint32"));
//var map = new Map();
//map.set("name", "Nicholas"); 
//map.set("book", "Professional JavaScript");
//console.log(map.has("name")); //true 
//console.log(map.get("name")); //”Nicholas”
//map.delete("name");




