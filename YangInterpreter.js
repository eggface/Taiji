var com = require('./common.js');
pTips = com.pTips;
p = com.p;
pErr = com.pErr;
pNoS = com.pNoS;

//var rfc = require('./rfc6020.js');
//rfc.range();

var NODE_ROOT_TYPE = "submodule";

var BOBR = "{";
var EOBR = "}";
var EOL = ";";

var CMT_LINE = "//";
var CMT_MLINE_BEGIN = "/*";
var CMT_MLINE_END = "*/";
var QUO_SINGLE = "'";
var QUO_DOUBLE = "\"";
var ENTER = "\n";

var key_words = new Set();
key_words.add(com.KEY_GROUPING);
key_words.add(com.KEY_LEAF);
key_words.add(com.KEY_TYPE);
key_words.add(com.KEY_RANGE);
key_words.add(com.KEY_DEFAULT);
key_words.add(com.KEY_LIST);
key_words.add(com.KEY_CONTAINER);
key_words.add(com.KEY_AUGMENT);


//
//*******************************************************************************************//
//
pTips("\nLoading YangInterpreter.js...\n");

pTips("In reading YANG process:")
pTips(" File -> String -> Shink(Removing comments, spaces, enters) -> Array")
pTips(" -> Looking for and splited into TypeKey(Like: leaf maxndr or type uint32) and body({})")
pTips(" ==> Loop until no more TypeKey")

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
    obj.display = display;
    obj.nodeAddSubs = nodeAddSubs;

    return obj;
}

function display(level) {
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
    if (null != this.subNodes && this.subNodes.length > 0) {
        var i;
        level++;
        for (i = 0; i < this.subNodes.length; i++) {
            this.subNodes[i].display(level);
        }
    }
}

function nodeAddSubs(subNode) {
    //p(this.name + " add subNode " + subNode.name);
    this.subNodes[this.subNodes.length] = subNode;
}

//var drProf = createNode({name: "data-rate-profile", type: "grouping"});
//var maxndr = createNode({name: "maxndr", type: "leaf"});
//var minetr = createNode({name: "minetr", type: "leaf"});
//var mingdr = createNode({name: "mingdr", type: "leaf"});
//var maxgdr = createNode({name: "maxgdr", type: "leaf"});
//var uint32 = createNode({name: "uint32", type: "type"});
//
//drProf.nodeAddSubs(maxndr);
//drProf.nodeAddSubs(minetr);
//drProf.nodeAddSubs(maxgdr);
//drProf.nodeAddSubs(mingdr);
//
//maxndr.nodeAddSubs(uint32);
//minetr.nodeAddSubs(uint32);
//mingdr.nodeAddSubs(uint32);
//maxgdr.nodeAddSubs(uint32);
//drProf.display();

//Entrance of Yang Interpreter
//Return node
function yangInterpreter(yang) {
    //pTips("Input YANG: \n" + yang);

    //Accepted elements: [ Words \ { } " ; \n ' // /* */] 
    var ele = yang.match(/\b\S+\b|\{|\}|\"|;|\n|'|\/\/|\/\*|\*\//g);
    //p("Counts of ele: " + ele.length);
    //var i;
    //for (i = 0; i < ele.length; i++) {
    //p(ele[i]);
    //}

    pTips("Shrink Words.");
    ele = shrinkWords(ele);
    //for (i = 0; i < ele.length; i++) {
    //    p(ele[i]);
    //}

    pTips("Go through words and generate nodes and sub-nodes");
    //submodule is the signal of begin of node statement
    var root_name = ele[ele.indexOf(NODE_ROOT_TYPE) + 1];
    var root_node = createNode({name: root_name, type: NODE_ROOT_TYPE});

    var index = 0;
    parseNode(ele, root_node, index);

    root_node.display();
    return root_node;
}

function isKeyWord(word) {
    if (key_words.has(word)) {
        //p(word + " is defined as Key words.");
        return true;
    }
    return false;
}

//BOBR: Begin of the node, {
//EOBR: End of the node, }
//index_begin: start of parse of the array
//index_end: the end index of this array, in case of {} block.
function parseNode(eleAry, the_node, index_begin, index_end) {
    //pTips("Gonna parse Node from index: " + index_begin);
    //pTips("It is a recursive call.");
    var index = index_begin;
    //Loop element array
    while (null != eleAry[index]) {
        if (NODE_ROOT_TYPE != the_node.type && BOBR == eleAry[index]) {
            //p(eleAry[index - 1] + ", index is " + index);
            //Found an unsupported {}, not key word found in advance. Ignore this braces block 
            var sub_index_end = lookForIgnBR(eleAry, index + 1, EOBR);
            //p("sub_index is " + sub_index_end);
            index = sub_index_end + 1;
        } else if (isKeyWord(eleAry[index])) {
            //Word is a type defined
            //Parsing statement
            // New node with name, type and check BOBR
            var node_key = eleAry[index];
            var node_id = eleAry[index + 1];

            //Node could be started with { or just one line end with ;
            if (BOBR != eleAry[index + 2] && EOL != eleAry[index + 2]) {
                pErr(BOBR + " is not found after " + node_id + " (" + node_key + ").");
                break;
            } else {
                //p("Find new node: " + node_id + " (" + node_key + ").");
                var node = createNode({name: node_id, type: node_key});
                //Add as sub-node
                the_node.nodeAddSubs(node);

                //has {, means has substatements
                if (BOBR == eleAry[index + 2]) {
                    index += 3;
                    //Looking for the } and mark the index
                    var sub_index_end = lookForIgnBR(eleAry, index, EOBR);
                    //Recursive down to sub nodes and get EOBR index as return
                    index = parseNode(eleAry, node, index, sub_index_end);
                } else {
                    //has ;, means no substatements
                    index += 3;
                }
            }
        } else if ((NODE_ROOT_TYPE != the_node.type) && (EOBR == eleAry[index]) && (index == index_end)) {
            //Looking for the '}', there might be other {} couples in side.
            // End of the_node parsing && it is in Node parsing
            //p("Node end: " + the_node.name + " (" + the_node.type + ").");
            return ++index;
        } else {
            //To be extended for new supporting.
            index++;
        }
    }// while end
    pTips("Finish node parsing: " + the_node.name + " (" + the_node.type + ").");
    return index;
}

function shrinkWords(eleAry) {
    pTips("Gonna handle: comments[//, /*, */], quotations [\", '], remove ENTER ");

    var new_ary = new Array();
    pTips("Copy a new array and copy needed or merged value into cells.");
    var index = 0;
    while (undefined != eleAry[index]) {
        var ele = eleAry[index];
        //Loop Array, any cell matching special word to be copied
        switch (ele) {
            case CMT_LINE:
                //pTips("Comments: // to ENTER");
                //looking for the end
                var end_index = lookFor(eleAry, index + 1, ENTER);
                if (-1 == end_index) {
                    pErr("No ENTER for //");
                    break;
                }
                //clone a tmp array and join to a string
                var merged = eleAry.slice(index, end_index).join(" ");
                //p(merged);
                //copy back to new array
                new_ary.push(merged);
                index = end_index;
                break;
            case CMT_MLINE_BEGIN:
                //pTips("Comments: /* to */");
                //looking for the end
                var end_index = lookFor(eleAry, index + 1, CMT_MLINE_END);
                if (-1 == end_index) {
                    pErr("No */ for /*");
                    break;
                }
                //clone a tmp array and join to a string
                var merged = eleAry.slice(index, end_index + 1).join(" ");
                //p(merged);
                //copy back to new array
                new_ary.push(merged);
                index = end_index + 1;
                break;
            case QUO_SINGLE:
                //pTips("Quotation: ' to '");
                //looking for the end
                var end_index = lookFor(eleAry, index + 1, QUO_SINGLE);
                if (-1 == end_index) {
                    pErr("No ' for '");
                    break;
                }
                //clone a tmp array and join to a string
                var merged = eleAry.slice(index, end_index + 1).join(" ");
                //p(merged);
                //copy back to new array
                new_ary.push(merged);
                index = end_index + 1;
                break;
            case QUO_DOUBLE:
                //pTips("Quotation: \" to \"");
                //looking for the end
                var end_index = lookFor(eleAry, index + 1, QUO_DOUBLE);
                if (-1 == end_index) {
                    pErr("No \" for \"");
                    break;
                }
                //clone a tmp array and join to a string
                var merged = eleAry.slice(index, end_index + 1).join(" ");
                //p(merged);
                //copy back to new array
                new_ary.push(merged);
                index = end_index + 1;
                break;
            case ENTER:
                //pTips("Remove ENTER");
                index++;
                break;
            default:
                new_ary.push(ele);
                index++;
        }
    }
    return new_ary;
}

function lookFor(ary, index_start, str) {
    //p("Look for " + str + " in ary from index " + index_start);
    var index = -1;
    var i;
    for (i = index_start; i < ary.length; i++) {
        if (str == ary[i]) {
            return i;
        }
    }
    return index;
}

function lookForIgnBR(ary, index_start, str) {
    //p("Look for " + str + " in ary from index " + index_start);
    var index = -1;
    var i;
    var block_count = 0;
    for (i = index_start; i < ary.length; i++) {
        //skip blocks
        //
        if (str == ary[i]) {
            if (0 == block_count) {
                //p("Found " + str + " with index " + i);
                return i;
            }
        }

        if ("{" == ary[i]) {
            block_count++;
        } else if ("}" == ary[i]) {
            block_count--;
        }
    }
    return index;
}

//To be commented
//var dir = "/Users/JamesWang/Documents/workspace/Repo/Taiji/Taiji/";
//var yang_str = read(dir + "data-rate-profile-body.yang");
//p("Read file and get string: " + yang_str);
//var node_tree = yangInterpreter(yang_str);
//function read(file) {
//    var fs = require("fs");
//
//    // Synchronous read
//    return fs.readFileSync(file).toString();
//}

//
//*******************************************************************************************//
//
module.exports.yangInterpreter = yangInterpreter;


