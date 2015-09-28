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
//  9.2.4 Range
//
pTips("\nLoading rfc6020.js...\n");

module.exports = {
    //range "0..4294967295";
    // grouping: {
    //     yang2json: function (node, json_prop) {
    //         var arg = node.name;
    //         var key = node.type;
    //         p("Call yang2json and grouping's arg: " + arg);
    //     }
    // },

    //In JSON, property parser, input YANG node. Set JSON property if key matches YANG type
    property: {
        leaf: {
            yang2json: function (node, json_prop) {
                var arg = node.name;
                var key = node.type;
                //p("Call yang2json and leaf's arg: " + arg);
            }
        },
        type: {
            yang2json: function (node, json_prop) {
                var arg = node.name;
                var key = node.type;
                //p("Call yang2json and type's arg: " + arg);
                json_prop.type = com.type_mapping_yang_schema.get(arg);
            }
        },
        range: {
            //min: 0,
            //max: 4294967295
            yang2json: function (node, json_prop) {
                var arg = node.name;
                var key = node.type;
                //p("Call yang2json and range's arg: " + arg);

                if (-1 != arg.indexOf("|")) {
                    pNoS("Sorry, '|' is not supported now.");
                }

                var ary = arg.match(/\d+/g);
                if (null == ary) {
                    pErr("Formation does not match range. It is: " + arg);
                } else {
                    json_prop.min = +ary[0];
                    json_prop.max = +ary[1];
                }
            }
        },
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
        }
    }
}


