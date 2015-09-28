//
//*******************************************************************************************//
//
module.exports = {

    KEY_GROUPING: "grouping",
    KEY_AUGMENT: "augment",
    KEY_LEAF: "leaf",
    KEY_TYPE: "type",
    KEY_RANGE: "range",
    KEY_DEFAULT: "default",
    KEY_LIST: "list",
    KEY_CONTAINER: "container",


    type_mapping_yang_schema: new Map([
        ["uint32", "Number"]
    ]),

    p: function (msg) {
        console.log(msg);
    },
    pTips: function (msg) {
        //36: CYAN
        console.log('\x1b[36m', msg, '\x1b[0m');
    },
    pErr: function (msg) {
        //41: red
        console.log('\x1b[41m', "[Error] " + msg, '\x1b[0m');
    },
    pNoS: function (msg) {
        //41: red
        console.log('\x1b[35m', "[Not Supported] " + msg, '\x1b[0m');
    }
}
//If it is required in other JS, this line will be called.
//module.exports.p("JJJJJJJJJJJJJJJJJJJJJJJJJJJJJ");
