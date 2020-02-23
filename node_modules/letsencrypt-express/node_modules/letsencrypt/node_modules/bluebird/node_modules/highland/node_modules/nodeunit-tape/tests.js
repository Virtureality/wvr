exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testSomethingElse = function(test){
    test.ok(false, "this assertion should fail");
    test.done();
};

exports.group = {
    test2: function (test) {
        test.ok(true, "i'm in a group");
        test.done();
    },
    test3: function (test) {
        test.ok(true, "i'm on a boat");
        test.done();
    }
}