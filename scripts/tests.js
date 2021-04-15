function updateView() {} // Dummy function.

QUnit.test("shuffleDeck - If supplied argument is null, return false", function (assert) {
    let deck = null;
    const succeeded = shuffleDeck(deck);

    assert.strictEqual(deck, null, "Assert that deck is still null.");
    assert.equal(succeeded, false, "Assert that shuffle failed.");
});

QUnit.test("shuffleDeck - If supplied argument is undefined, return false", function (assert) {
    let deck = undefined;
    const succeeded = shuffleDeck(deck);

    assert.strictEqual(deck, undefined, "Assert that deck is still undefined.");
    assert.equal(succeeded, false, "Assert that shuffle failed.");
});

QUnit.test("shuffleDeck - If supplied argument is Object, return false", function (assert) {
    let myObj = Object();
    let deck = myObj;
    const succeeded = shuffleDeck(deck);

    assert.deepEqual(deck, myObj, "Assert that deck has not been modified.");
    assert.equal(succeeded, false, "Assert that shuffle failed.");
});

QUnit.test("shuffleDeck - If supplied argument is [] (empty Array), return false", function (assert) {
    let myArr = [];
    let deck = myArr;
    let succeeded = shuffleDeck(deck);

    assert.strictEqual(deck, myArr, "Assert that deck has not been modified.");
    assert.equal(succeeded, false, "Assert that shuffle failed.");
});

QUnit.test("shuffleDeck - Modified (int array) deck is an Array.", function (assert) {
    let deck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    const succeeded = shuffleDeck(deck);
    
    assert.strictEqual(deck instanceof Array, true, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("shuffleDeck - Modified (string array) deck is an Array.", function (assert) {
    let deck = ["lorem", "ipsum", "dolor", "sit", "amet"];
    const succeeded = shuffleDeck(deck);
    
    assert.strictEqual(deck instanceof Array, true, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("shuffleDeck - Modified (Mixed string/int array) deck is an Array.", function (assert) {
    let deck = ["lorem", 1, "dolor", 5, "amet"];
    const succeeded = shuffleDeck(deck);
    
    assert.strictEqual(deck instanceof Array, true, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("shuffleDeck - Returned value is random", function (assert) {
    const originalDeck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let deck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let succeeded = shuffleDeck(deck);
    assert.notEqual(deck, originalDeck, "Assert that deck no longer holds its original value.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});