var com = require('./common.js');
pTips = com.pTips;
p = com.p;
pErr = com.pErr;

    var NODE_ROOT_TYPE = "submodule";

    var BON = "{";
    var EON = "}";

    var CMT_LINE = "//";
    var CMT_MLINE_BEGIN = "/*";
    var CMT_MLINE_END = "*/";
    var QUO_SINGLE = "'";
    var QUO_DOUBLE = "\"";
    var ENTER = "\n";

    var key_words = new Set();
    key_words.add("grouping");
    key_words.add(com.TYPE_LEAF);
    key_words.add(com.TYPE_TYPE);


//
//*******************************************************************************************//
//
pTips("\nLoading YangInterpreter.js...\n");

pTips("In reading YANG process:")
pTips(" File -> String -> Shink(Removing comments, spaces, enters) -> Array")
pTips(" -> Looking for and splited into TypeKey(Like: leaf maxndr or type uint32) and body({})")
pTips(" ==> Loop until no more TypeKey")

var input_yang = "submodule data-rate-profile-body {\n\
  belongs-to exa-base {\n\
    prefix exa;\n\
  }\n\
grouping data-rate-profile {\n\
  \n\
    leaf maxndr {\n\
      type uint32 {\n\
        range [0..4294967295];\n\
        }\n\
      description\n\
        [Maximum Net Data Rate (MAXNDR)\n\
         Defines the value of the maximum net data rate (see clause\n\
         11.4.2.2/G.9701).\n\
         Valid values = 0..4294967295];\n\
      units [1000 bits/second];\n\
      default [4294967295];\n\
    }\n\
    leaf minetr {\n\
      type uint32 {\n\
        range 0..4294967295;\n\
        }\n\
      description\n\
        Minimum Expected Throughput (MINETR)\n\
         Defines the value of the minimum expected throughput (see\n\
         clause 11.4.2.1/G.9701).\n\
         Valid values = 0..4294967295;\n\
      units 1000 bits/second;\n\
      default 0;\n\
      //reference ITU-T G.9701 clause 11.4.2.1;\n\
    }\n\
\n\
    leaf maxgdr {\n\
      type uint32 {\n\
        range 0..4294967295;\n\
        }\n\
      description\n\
        Maximum Gamma Data Rate (MAXGDR)\n\
         Defines the maximum value of the GDR (see clause\n\\n\
         7.11.1.3). The GDR shall not exceed MAXGDR at the start of\n\
         showtime and during showtime.\n\
         Valid values = 0..4294967295;\n\
      units 1000 bits/second;\n\
      default 4294967295;\n\
      //reference None;\n\
    }\n\
\n\
    leaf mingdr {\n\
      type uint32 {\n\
        range 0..4294967295;\n\
        }\n\
      description\n\
        Minimum Gamma Data Rate (MINGDR)\n\
         Defines the minimum value of the GDR (see clause\n\
         7.11.1.3). The GDR may be lower than MINGDR. If the GDR is\n\
         lower than MINGDR at initialization or when GDR becomes\n\
         lower than MINGDR during showtime, a threshold crossing\n\
         alert occurs.\n\
         Valid values = 0..4294967295;\n\
      units 1000 bits/second;\n\
      default 0;\n\
      //reference None;\n\
    Double Quotation \"Data rate profile for upstream and downstream\";\n\
    Single Quotation 'Data rate profile for upstream and downstream';\n\
    commentLine //Data rate profile for upstream and downstream;\n\
    commentMulti /*Begin comments. Data rate profile for upstream and downstream;\n\
                   end of comments*/;\n\
    } } }";
//
//*******************************************************************************************//
//
//pTips("Define yang object with YANG file structure.");
//pTips("");

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
    p(this.name + " add subNode " + subNode.name);
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
    for (i = 0; i < ele.length; i++) {
        p(ele[i]);
    }

    pTips("Go through words and generate nodes and sub-nodes");
    //submodule is the signal of begin of node statement
    var root_name = ele[ele.indexOf(NODE_ROOT_TYPE) + 1];
    var root_node = createNode({name: root_name, type: NODE_ROOT_TYPE});

    var index = 0;
    parseNode(ele, root_node, index);

    //root_node.display();
    return root_node;
}

function isKeyWord(word) {
    if (key_words.has(word)) {
        //p(word + " is defined as Key words.");
        return true;
    }
    return false;
}

//BON: Begin of the node, {
//EON: End of the node, }
function parseNode(eleAry, the_node, index_begin) {
    //pTips("Gonna parse Node from index: " + index_begin);
    //pTips("It is a recursive call.");
    var index_end = index_begin;

    var index = index_begin;
    //Loop element array
    while (undefined != eleAry[index]) {
        //Word is a type defined
        if (isKeyWord(eleAry[index])) {
            // New node with name, type and check BON
            var node_type = eleAry[index];
            var node_name = eleAry[index + 1];
            if (BON != eleAry[index + 2]) {
                pErr(BON + " is not found after " + node_name + " (" + node_type + ").");
                break;
            }

            p("Find new node: " + node_name + " (" + node_type + ").");
            var node = createNode({name: node_name, type: node_type});
            //Add as sub-node
            the_node.nodeAddSubs(node);
            index += 3;
            //Recursive down to sub nodes and get EON index as return
            index = parseNode(eleAry, node, index);
        } else if (NODE_ROOT_TYPE != the_node.type && EON == eleAry[index]) {
            // End of the_node parsing && it is in Node parsing
            p("Node end: " + the_node.name + " (" + the_node.type + ").");
            index++;
            return index;
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

//yangInterpreter(input_yang);

//
//*******************************************************************************************//
//
module.exports.yangInterpreter = yangInterpreter;


