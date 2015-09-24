var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";

var com = require('./common.js');
pTips = com.pTips;
p = com.p;
pErr = com.pErr;

var yangInterpreter = require('./YangInterpreter.js').yangInterpreter;
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


//Test parts
var yang_str = read(dir + "data-rate-profile-body.yang");
p("Read file and get string: " + yang_str);
yangInterpreter(yang_str);

//write(dir + "schema", "this is an output schema file");
//write(dir + "html", "this is an output html File");

//read("./Taiji/output2");

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
//p(yang2Schema(drProf));

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
//p(yang2Template(drProf));

