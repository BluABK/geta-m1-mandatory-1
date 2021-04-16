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

QUnit.test(`dealCards - Discards and marks a card as "dead", when odd amount of players with even amount of source deck cards.`, function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let playerDecks = [[], [], []];

    dealCards(playerDecks, cardDeck);

    assert.notStrictEqual(deadCard, null, "Dead card is not null.");
    assert.true(cardDeck.includes(deadCard), "Dead card is one of the ones from the given deck.");
    
    for (let i = 0; i < playerDecks.length; i++) {
        assert.false(playerDecks[i].includes(deadCard), `Dead card is not in player deck #${i}`);
    }
});

QUnit.test("dealCards - Modifies supplied decks.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = []; 
    let playerDecks = [deck1, deck2];

    dealCards(playerDecks, cardDeck);

    const cardDeckHalfLength = cardDeck.length / 2;
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, cardDeckHalfLength, `Modified deck #${i+1}/2 is half (${cardDeckHalfLength}) of cardDeck (${cardDeck.length}).`);
    }
});

QUnit.test("dealCards - All source card decks have been dealt.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = []; 
    let playerDecks = [deck1, deck2];

    dealCards(playerDecks, cardDeck);
    
    // For card in source card deck.
    for (let i = 0; i < cardDeck.length; i++) {
        let cardInDeck = false;
        
        // For deck in playerDecks.
        for (let j = 0; j < playerDecks.length; j++) {
            if (cardInDeck == false) cardInDeck = playerDecks[j].includes(cardDeck[i]);
        }
        
        assert.true(cardInDeck, `Source deck card ${cardDeck[i]} has been dealt to a deck.`);
    }
});

QUnit.test("dealCards - Dealt decks consist of cards from the source card deck.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = [];
    let playerDecks = [deck1, deck2];

    dealCards(playerDecks, cardDeck);

    // For card in source card deck.
    for (let i = 0; i < cardDeck.length; i++) {
        let cardInDeck = false;
        
        // For deck in playerDecks.
        for (let j = 0; j < playerDecks.length; j++) {
            if (cardInDeck == false) cardInDeck = playerDecks[j].includes(cardDeck[i]);
        }

        assert.true(cardInDeck, `Source deck card ${cardDeck[i]} has been dealt to a deck.`);
    }
    
    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        // For card in deck.
        for (let card of playerDecks[i]) {
            assert.true(cardDeck.includes(card), `Card ${card} from deck #${i+1}/${playerDecks.length} is in source card deck.`);
        }
    }
});

QUnit.test("dealCards - Dealt decks have equal length when even amount.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = [];
    let playerDecks = [deck1, deck2];

    dealCards(playerDecks, cardDeck);

    let referenceLength = playerDecks[0].length;

    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, referenceLength, `deck #${i+1}/${playerDecks.length} has equal length as deck #1.`);
    }
});

QUnit.test("dealCards - Dealt decks have equal length when odd amount.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = [];
    let deck3 = [];
    let playerDecks = [deck1, deck2, deck3];

    dealCards(playerDecks, cardDeck);

    let referenceLength = playerDecks[0].length;

    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, referenceLength, `deck #${i+1}/${playerDecks.length} has equal length as deck #1.`);
    }
});

QUnit.test("dealCards - Dealt decks have no card in common.", function (assert) {
    let cardDeck = [1,2,3,4,5,6,7,8,9,10,11,12];
    let deck1 = [];
    let deck2 = [];
    let playerDecks = [deck1, deck2];

    dealCards(playerDecks, cardDeck);

    // Compare decks with eachother:
    // For each deck.
    for (let i = 0; i < playerDecks.length; i++) {
        // For each card in current deck.
        for (let card of playerDecks[i]) {
            // Check if card is in any of the decks
            for (let j = 0; j < playerDecks.length; j++) {
                if (j == i) continue; // Don't check current deck against itself, as it would lead to false positive.

                assert.false(playerDecks[j].includes(card), `deck #${j+1} does NOT contain card ${card}.`);
            }
        }
    }
});