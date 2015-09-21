var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";

var TYPE_LEAF = "leaf";
var TYPE_TYPE = "type";
var OUTPUT_INDENT = "    ";

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
var mingdr = createNode({name: "mingdr", type: "leaf"});
var maxgdr = createNode({name: "maxgdr", type: "leaf"});
var uint32 = createNode({name: "uint32", type: "type"});

drProf.nodeAddSubs(maxndr);
drProf.nodeAddSubs(minetr);
drProf.nodeAddSubs(maxgdr);
drProf.nodeAddSubs(mingdr);

maxndr.nodeAddSubs(uint32);
minetr.nodeAddSubs(uint32);
mingdr.nodeAddSubs(uint32);
maxgdr.nodeAddSubs(uint32);

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
p("");
//var key_1_words= ["grouping"];
var key_1_words = new Set();
key_1_words.add("grouping");

var type_mapping_yang_schema = new Map([
    ["uint32", "Number"]
])

if (key_1_words.has("grouping")) {
    p("grouping is in set.");
}
//p("Test to get uint32's schema type: " + type_mapping_yang_schema.get("uint32"));

function yangType2SchemaType(type) {
    //p("Gonna convert YANG type to Schema type with type mapping. Yang type is: " + type);
    return type_mapping_yang_schema.get(type);
}

function yangName2SchemaName(name) {
    //p("Gonna convert YANG with removing '-' and change to CamelStyle. Yang name is: " + name);
    return name.replace(/-./gi, function upper(x) {
        return x.slice(1).toUpperCase();
    });
}
//p(yangName2SchemaName("abc-def-ghi"));

function yang2Schema(node, level) {
    if (null == level) {
        level = 0;
    }
    //p("Convert YANG node to Schema JS. node name is: " + node.name + " and level is: " + level);

//Schemas.dataRateProfile = new SimpleSchema({
//    maxndr: {
//        type: Number,

    var prefix = "";
    var j;
    for (j = 0; j < level; j++) {
        prefix = prefix + OUTPUT_INDENT;
    }

    var output = "";
    if (0 == level) {
        level = 0;
        output += "Schemas." + yangName2SchemaName(node.name) + " = new SimpleSchema({\n";
    } else if (TYPE_LEAF == node.type) {
        //display node attributes, name and type
        //leaf
        output += prefix + yangName2SchemaName(node.name) + ": {\n"
    } else if (TYPE_TYPE == node.type) {
        //type
        output += prefix + "type: " + yangType2SchemaType(node.name) + ",\n"
    }

    var i;
    level++;
    for (i = 0; i < node.subNodes.length; i++) {
        output += yang2Schema(node.subNodes[i], level);
    }
    //remove the last ','
    if ("," == output.charAt(output.length - 2)) {
        output = output.substring(0, output.length - 2);
        output += "\n";
    }

    output += prefix + "}";
    if (0 == level) {
        output += "\n";
    } else {
        output += ",\n";
    }
    return output;
}
p(yang2Schema(drProf));

//
//*******************************************************************************************//
//
pTips("Here is the place to convert yang object to schema html template.");
p("");
//<body>
//    <div class="container">
//      <h2>Bandwidth Profile Provisioning</h2>
//      {{> dataRateProfileForm}}
//    </div>
//</body>
//<template name="dataRateProfileForm">
//    {{#autoForm id="dataRateProfileForm" schema=Schemas.dataRateProfile}}
//        {{> afQuickField name="maxndr"}}
//        {{> afQuickField name="minetr"}}
//        {{> afQuickField name="maxgdr"}}
//        {{> afQuickField name="mingdr"}}
//      <div>
//        <button type="submit" id="testRestSubmit" class="btn btn-primary">Submit</button>
//      </div>
//    {{/autoForm}}
//</template>

function yang2Template(node) {
    pErr("It is just a draft for simple, one layer structure. No further check.");
    var output = "";
    var schema_name = yangName2SchemaName(node.name);
    var template_name = yangName2SchemaName(node.name) + "Form";

    output = "<body>\n\
    <div class=\"container\">\n\
      <h2>" + schema_name + "</h2>\n\
      {{>  " + template_name + " }}\n\
    </div>\n\
</body>\n\
<template name=\"" + template_name + "\">\n\
    {{#autoForm id=\"" + template_name + "\" schema=Schemas." + schema_name + "}}\n";

    var i;
    for (i = 0; i < node.subNodes.length; i++) {
        output += "        {{> afQuickField name=\"" + node.subNodes[i].name + "\"}}\n"
    }


    output += "      <div>\n\
        <button type=\"submit\" id=\"click" + template_name + "Submit\" class=\"btn btn-primary\">Submit</button>\n\
      </div>\n\
    {{/autoForm}}\n\
</template>\n"

    return output;
}
p(yang2Template(drProf));


