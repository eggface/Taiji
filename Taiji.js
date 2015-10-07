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

//
//*******************************************************************************************//
//
pTips("\nLoading Taiji.js...\n");

function tryDelete(path){
    var fs = require('fs');
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}


function write(file, str) {
    var fs = require('fs');
    fs.writeFile(file, str, function (err) {
        if (err) {
            return p(err);
        }

        p("The file [" + file + "] was saved!");
    });
}

function append(file, str) {
    var fs = require('fs');
    fs.appendFile(file, str, function (err) {
        if (err) {
            return p(err);
        }

        p("The file [" + file + "] was appended!");
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

    var node_index;
    tryDelete(dir_output + node_tree.name + ".js");
    for (node_index = 0; node_index < node_tree.subNodes.length; node_index++) {
        pTips("\nNamespace: exa: is converted as EXA_ \n");
        pTips("\nPath flag '/': is converted as '__', might be fixed in the future. \n");
        var sub_node_tree = preYang2Json(node_tree.subNodes[node_index]);
        var json_obj = yang2Json(sub_node_tree);
        p("JSON object: ");
        p(json_obj);
        p("\n");

        var yang_name = node_tree.subNodes[node_index].name;
        var schema_name = yangName2SchemaName(yang_name);
        writeSchemaFile(node_tree.name, schema_name, json_obj);
    }
    /*
     //Write Template HTML
     var template_str = yang2Template(node_tree);
     //p(template_str);
     write(dir_output + node_tree.name + ".html", template_str);
     pTips("Finish writing template file.");
     */
}();

function writeSchemaFile(file_name, schema_name, json_obj) {
    var output = "\n";
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

    append(dir_output + file_name + ".js", output);
    pTips("Finish writing schema file.");
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

//function before Yang2Json
function preYang2Json(node) {
    var tmp_node = node;
    tmp_node.name = rfc.convertNamePath(rfc.convertNameSpaceExa(node.name));
    tmp_node.type = rfc.convertNameSpaceExa(node.type);
    var j;
    //Loop sub nodes
    for (j = 0; j < node.subNodes.length; j++) {
        var sub_node = node.subNodes[j];
        sub_node = preYang2Json(sub_node);
    }
    return tmp_node;
}

//Return JSON object with decoded properties from YANG node
function yang2Json(node) {
    p("Call yang2Json and node name is: " + node.name);
    //assume it begins from grouping level, not root from submodel
    //Ignore unsupported node and subnodes

    //It might be grouping, typedef or others
    var schemaParserObj = rfc.getSchemaParserObj(node.type);
    //p("schemaParserObj is " + schemaParserObj);

    var propNodes = [];
    //It might be decoded as schema obj or typedef obj. They have different layer
    if (null != schemaParserObj) {
        propNodes = rfc[schemaParserObj].fetchPropNodes(node);
    }
    //
    var json_obj = {};
    var i = 0;
    //Loop properties
    for (i = 0; i < propNodes.length; i++) {
        var prop_node = propNodes[i];

        //p(prop_node.type + " to be parsed.");
        //parse property (to lower case and - => _)
        var prop_name = rfc.convertTypedefName(prop_node.name);
        json_obj[prop_name] = {};

        var j;
        //Loop attributes
        for (j = 0; j < prop_node.subNodes.length; j++) {
            var att_node = prop_node.subNodes[j];
            //p("schemaParserObj: " + schemaParserObj + " and prop node type: " + prop_node.type + " prop node name is: " + prop_name);
            //p("attribute type: " + att_node.type + " attribute name: " + att_node.name);
            //p("Gonna parse property: " + prop_name);
            rfc.Property[att_node.type].yang2json(att_node, json_obj[prop_name]);
        }
    }

    return json_obj;
}//End yang2Json

//Recursive function to parse Property, the node might has sub-nodes
//Function Canceled
function parseProp(leaf_node, json_prop) {
    p("Call parseProp and node name is: " + leaf_node.name);
    rfc.property[leaf_node.type].yang2json(leaf_node, json_prop);
    //var sub = leaf_node.subNodes;

    //Sub nodes are not parsed here. They should be decoded in side property parser.
    //var i;
    //for (i = 0; i < leaf_node.subNodes.length; i++) {
    //    parseProp(leaf_node.subNodes[i], json_prop)
    //}
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

