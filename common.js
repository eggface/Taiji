//
//*******************************************************************************************//
//
module.exports = {
    p: function (msg) {
        console.log(msg);
    },
    pTips: function (msg) {
        //36: CYAN
        console.log('\x1b[36m', msg, '\x1b[0m');
    },
    pErr: function (msg) {
        //41: red
        console.log('\x1b[41m', msg, '\x1b[0m');
    }
}
//If it is required in other JS, this line will be called.
//module.exports.p("JJJJJJJJJJJJJJJJJJJJJJJJJJJJJ");
