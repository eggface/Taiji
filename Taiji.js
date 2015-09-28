var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";
var dir_output = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/output/";
//var input = "data-rate-profile-body.yang";
var input = "qos@2015-05-05.yang";

var OUTPUT_INDENT = "    ";

var com = require('./common.js');
pTips = com.pTips;
p = com.p;
pErr = com.pErr;
pNoS = com.pNoS;

var yangInterpreter = require('./YangInterpreter.js').yangInterpreter;
var rfc = require('./rfc6020.js');

var as_prop = new Set();
as_prop.add(com.KEY_LEAF);

//
//*******************************************************************************************//
//
pTips("\nLoading Taiji.js...\n");

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


//
//*******************************************************************************************//
//
//Logic
//YANG Interpreter
main = function () {
    var yang_str = read(dir + input);
    //p("Read file and get string: " + yang_str);
    var node_tree = yangInterpreter(yang_str);

/*
    var node_index;
    for (node_index = 0; node_index < node_tree.subNodes.length; node_index++) {
        var json_obj = yang2Json(node_tree.subNodes[node_index]);
        p("JSON object: ");
        p(json_obj);

        var yang_name = node_tree.subNodes[node_index].name;
        var schema_name = yangName2SchemaName(yang_name);
        writeSchemaFile(node_tree.name, schema_name, json_obj);
    }
    //Write Template HTML
    var template_str = yang2Template(node_tree);
    //p(template_str);
    write(dir_output + node_tree.name + ".html", template_str);
    pTips("Finish writing template file.");
    */
}();

function writeSchemaFile(file_name, schema_name, json_obj) {
    var output = "";
    //JSON object -> JSON String
    //indent as 4 spaces
    var json_txt = JSON.stringify(json_obj, null, 4);

    //p("JSON Text: " + json_txt);
    //p("Trim quotations before writing schema file, quotations before : and quotations of type name");
    json_txt = json_txt.replace(/\"(.*)\":/g, "$1:");
    json_txt = json_txt.replace(/(type: )\"(.*)\"/g, "$1$2");
    //p("After trimming, JSON Text: " + json_txt);

    output += "Schemas." + schema_name + " = new SimpleSchema(\n";
    output += json_txt;
    output += ");\n\n" + schema_name + " = new Mongo.Collection(\"" + schema_name + "\");";
    //p(output);

    //write(dir_output + file_name + ".js", output);
    //pTips("Finish writing schema file.");
}


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
pTips("All nodes should end with ',', if it is not the last one.\n");

function yangType2SchemaType(type) {
    //p("Gonna convert YANG type to Schema type with type mapping. Yang type is: " + type);
    return com.type_mapping_yang_schema.get(type);
}

//abc-def-ghi -> abcDefGhi
function yangName2SchemaName(name) {
    //p("Gonna convert YANG with removing '-' and change to CamelStyle. Yang name is: " + name);
    return name.replace(/-./gi, function upper(x) {
        return x.slice(1).toUpperCase();
    });
}

//Return JSON object with decoded properties from YANG node
function yang2Json(node) {
    //p("Call yang2Json and node name is: " + node.name);
    //assume it begins from grouping level, not root from submodel
    //Ignore unsupported node and subnodes

    var json_obj = {};
    //Loop leaves
    for (i = 0; i < node.subNodes.length; i++) {
        var sub_node = node.subNodes[i];
        if (false == as_prop.has(sub_node.type)) {
            continue;
        }

        p(sub_node.type + " is defined as property's key word.");
        //parse leaf
        //var json_prop = {}
        var prop_name = sub_node.name;
        json_obj[prop_name] = {};
        parseProp(sub_node, json_obj[prop_name]);
    }
    return json_obj;
}//End yang2Json

//Recursive function to parse Property, the node might has sub-nodes
function parseProp(leaf_node, json_prop) {
    p("Call parseProp and node name is: " + leaf_node.name);
    rfc.property[leaf_node.type].yang2json(leaf_node, json_prop);
    var sub = leaf_node.subNodes;

    var i;
    for (i = 0; i < leaf_node.subNodes.length; i++) {
        parseProp(leaf_node.subNodes[i], json_prop)
    }
}//End parseProp


//
//*******************************************************************************************//
//
pTips("Here is the place to convert yang object to schema html template. \n");
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
    node = node.subNodes[0];
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

