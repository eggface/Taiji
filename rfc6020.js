var com = require('./common.js');
pTips = com.pTips;
p = com.p;
pErr = com.pErr;
pNoS = com.pNoS;


//
//*******************************************************************************************//
//RFC 6020 parser
// Mainly focus on converting from YANG to Schema or others
//Support:
//  7.4 Type
//      9.2.4 Range
//      enum
//
pTips("\nLoading rfc6020.js...\n");

var schema_prop_key = new Set();
schema_prop_key.add(com.KEY_LEAF);

var schema_yang_type_mapping = new Map([
    ["typedef", "SimpleType"],
    ["grouping", "RecordType"]
    //["container", "schema"],
]);

module.exports = {
    //Mapping YANG object type to Schema object type
    //YANG: typedef -> Schema SimpleType
    //YANG: grouping -> Schema RecordType
    getSchemaParserObj: function (yang_type) {
        return schema_yang_type_mapping.get(yang_type);
    },

    //ABC-DEF => abc_def
    convertTypedefName: function (yang_name) {
        return yang_name.toLowerCase().replace(/-/g, "_");
    },
    //exa:abc => EXA_abc, type or name should be converted
    convertNameSpaceExa: function (str) {
        return str.replace(/exa:/g, "EXA_");
    },
    ///abc/def => __abc__def
    convertNamePath: function (yang_name) {
        return yang_name.replace(/\//g, "__");
    },

//SimpleType.meter_action = new SimpleSchema({
//    meter_action: {
//        type: String,
//        allowedValues: ['DEI', 'DROP', 'NONE'],
//		//label: "Meter Action",
//        defaultValue: 'DEI',
//        autoform: {
//          options: [
//            {label: "DEI", value: "DEI"},
//            {label: "DROP", value: "DROP"},
//            {label: "NONE", value: "NONE"}
//          ]
//        }
//	}
//});

    //Parser Object
    SimpleType: {
        //return properties[]
        fetchPropNodes: function (node) {
            var arg = node.name;
            var key = node.type;
            //p("Call typedf decode and arg: " + arg);
            //For typedef, itself is the only property
            //    |METER-ACTION (typedef)
            //|enumeration (type)
            //|DEI (enum)
            //|DROP (enum)
            //|NONE (enum)
            var propNodes = [];
            propNodes[0] = node;
            return propNodes;
        }
    },

    //Parser Object
    RecordType: {
        //return node properties[] to be parsed
        fetchPropNodes: function (node) {
            var arg = node.name;
            var key = node.type;
            //p("Call schema decode and arg: " + arg);
            //get all properties from the node
            var propNodes = [];

            var i;
            for (i = 0; i < node.subNodes.length; i++) {
                var sub_node = node.subNodes[i];
                //p("sub_node type is: " + sub_node.type);
                //Is it a property supported in schema object?
                if (schema_prop_key.has(sub_node.type)) {
                    propNodes.push(sub_node);
                }
            }
            return propNodes;
        }
    },

    Property: {
        type: {
            yang2json: function (node, json_prop) {
                var arg = node.name;
                var key = node.type;
                //p("Call yang2json and type's arg: " + arg);
                json_prop.type = com.type_mapping_yang_schema.get(arg);
                if (null == json_prop.type) {
                    json_prop.type = arg;
                }

                var i;
                //Go thr all type's nodes
                for (i = 0; i < node.subNodes.length; i++) {
                    switch (node.subNodes[i].type) {
                        case com.KEY_RANGE:
                            //min: 0,
                            //max: 4294967295
                            var sub_arg = node.subNodes[i].name;
                            //p("push enum: " + node.subNodes[i].name);
                            if (-1 != sub_arg.indexOf("|")) {
                                pNoS("Sorry, '|' is not supported now.");
                            }

                            var ary = sub_arg.match(/\d+/g);
                            if (null == ary) {
                                pErr("Formation does not match range. It is: " + sub_arg);
                            } else {
                                json_prop.min = +ary[0];
                                json_prop.max = +ary[1];
                            }
                            break;
                        case com.KEY_ENUM:
                            //enum "meter-mef"
                            //Init if it is null.
                            if (null == json_prop.allowedValues) {
                                json_prop.allowedValues = [];
                            }

                            //p("push enum: " + node.subNodes[i].name);
                            json_prop.allowedValues.push(com.help.trimOutQuo(node.subNodes[i].name));
                            //json_prop.allowedValues.push(node.subNodes[i].name);

                            break;
                        default:
                            pNoS("Sorry, type " + node.subNodes[i].type + " is not supported now.");
                            break;
                    }
                }//for
            }//yang2json
        },//type
        default: {
            yang2json: function (node, json_prop) {
                var arg = node.name;
                var key = node.type;
                //p("Call yang2json and defaultValue's arg: " + arg);
                var ary = arg.match(/\d+/g);
                if (null == ary) {
                    pErr("Formation does not match default. It is: " + arg);
                } else {
                    json_prop.defaultValue = +ary[0];
                }
            }
        }//default
    }//Property
}


