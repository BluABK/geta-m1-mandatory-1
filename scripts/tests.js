function updateView() {} // Dummy function.

/**
 * Cards object
 */

QUnit.test("Cards - Cards constructor items argument must be instance of Array", function (assert) {
    try {
        new Cards(null);
        assert.false(true, "Cards(null) was allowed!");
    } catch(e) {
        if (e instanceof TypeError) {
            assert.true(true, "Cards(null) was not allowed.");
        } else {
            // Re-throw unexpected exception.
            throw e;
        }
    }
    try {
        new Cards("A String");
        assert.false(true, `Cards("A String") was allowed!`);
    } catch(e) {
        if (e instanceof TypeError) {
            assert.true(true, `Cards("A String") was not allowed.`);
        } else {
            // Re-throw unexpected exception.
            throw e;
        }
    }
    try {
        new Cards(Object);
        assert.false(true, `Cards(Object) was allowed!`);
    } catch(e) {
        if (e instanceof TypeError) {
            assert.true(true, `Cards(Object) was not allowed.`);
        } else {
            // Re-throw unexpected exception.
            throw e;
        }
    }
});

QUnit.test("Cards - Cards constructor properly populates items and itemsMap.", function (assert) {
    const originalDeck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let cardObjects = [];

    for (let item of originalDeck) {
        cardObjects.push(new Card(item, "suitless"));
    }

    let cardsObject = new Cards(cardObjects);

    assert.true(cardsObject.items instanceof Array, "cardsObject.items is instance of Array.")
    assert.true(cardsObject.itemsMap instanceof Map, "cardsObject.itemsMap is instance of Map.")
    assert.equal(cardsObject.length, originalDeck.length, "Cards.length is originalDeck.length.")
    assert.equal(cardsObject.itemsMap.size, originalDeck.length, "Cards.itemsMap.size is originalDeck.length.")
    assert.equal(cardsObject.items.length, originalDeck.length, "Cards.items.length is originalDeck.length.")

    let missingObjectsInItemsMap = false;

    for (let card of cardObjects) {
        let itemsMaphasItem = cardsObject.itemsMap.has(card.id);
        let itemsHasItem = cardsObject.items.includes(card);
        if (itemsMaphasItem == false) {
            missingObjectsInItemsMap = true;
            // Only assert missing items, to avoid redundant positive assertion spam.
            assert.false(itemsMaphasItem, `Card missing from Cards.itemsMap: id: ${card.id}, value: ${card.value}`);
        }
        if (itemsHasItem == false) {
            missingObjectsInItemsMap = true;
            // Only assert missing items, to avoid redundant positive assertion spam.
            assert.false(itemsHasItem, `Card missing from Cards.items: id: ${card.id}, value: ${card.value}`);
        }
    }

    if (missingObjectsInItemsMap == false) {
        assert.true(true, "There were no missing Card objects in the populated Cards.itemsMap or Cards.items.")
    }
});

QUnit.test("Cards.shuffle - If Cards.items is empty, return false", function (assert) {
    let cardsObject = new Cards([]);
    let succeeded = cardsObject.shuffle();

    assert.equal(cardsObject.items.length, 0, "Assert that deck has not been modified.");
    assert.equal(succeeded, false, "Assert that shuffle failed.");
});

QUnit.test("Cards.shuffle - Shuffled Cards.items (int array) is still an Array.", function (assert) {
    let cardsObject = new Cards([2,3,4,5,6,7,8,9,10,11,12,13,14]);
    let succeeded = cardsObject.shuffle();
    
    assert.true(cardsObject.items instanceof Array, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("Cards.shuffle - Shuffled Cards.items (String array) is still an Array.", function (assert) {
    let cardsObject = new Cards(["lorem", "ipsum", "dolor", "sit", "amet"]);
    let succeeded = cardsObject.shuffle();
    
    assert.true(cardsObject.items instanceof Array, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("Cards.shuffle - Shuffled Cards.items (Mixed string/int array) deck is still an Array.", function (assert) {
    let cardsObject = new Cards(["lorem", 1, "dolor", 5, "amet"]);
    let succeeded = cardsObject.shuffle();
    
    assert.true(cardsObject.items instanceof Array, "Assert modified deck is an Array.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("Cards.shuffle - Shuffle is actually random.", function (assert) {
    const originalDeck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let cardsObject = new Cards([2,3,4,5,6,7,8,9,10,11,12,13,14]);
    let succeeded = cardsObject.shuffle();

    assert.notEqual(cardsObject.items, originalDeck, "Assert that deck no longer holds its original value.");
    assert.equal(succeeded, true, "Assert that shuffle succeeded.");
});

QUnit.test("Cards.splice", function (assert) {
    const originalDeck = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    let cardObjects = [];

    for (let item of originalDeck) {
        cardObjects.push(new Card(item, "suitless"));
    }

    let cardsObject = new Cards(cardObjects);
    let splicedCards = cardsObject.splice(0, 1);

    assert.notEqual(splicedCards, cardsObject.items[0], "Spliced Card is not still in its old Cards.items index.")
    assert.false(cardsObject.itemsHasItemByUUID(splicedCards[0].id), "Spliced Card is not still in Cards.items.")
    assert.false(cardsObject.itemsMap.has(splicedCards[0].id), "Spliced Card is not still in Cards.itemsMap.")
    assert.equal(cardsObject.length, originalDeck.length -1, "Cards.length is (originalDeck.length -1).")
    assert.equal(cardsObject.items.length, originalDeck.length -1, "Cards.items.length is (originalDeck.length -1).")
    assert.equal(cardsObject.itemsMap.size, originalDeck.length -1, "Cards.itemsMap.size is (originalDeck.length -1).")
    assert.notEqual(splicedCards, undefined, "Returned spliced item is not undefined.")
    assert.true(splicedCards instanceof Array, "Returned spliced item is instance of Array.")
});

/**
 * Controller functions
 */

QUnit.test(`dealCards - Discards and marks a card as "dead", when odd amount of players with even amount of source deck cards.`, function (assert) {
    let originalItems = [1,2,3,4,5,6,7,8,9,10,11,12];
    let cardsObject = new Cards();
    for (let i of [1,2,3,4,5,6,7,8,9,10,11,12]) {
        cardsObject.push(new Card(i));
    }
    let playerDecks = [new Cards([]), new Cards([]), new Cards([]), new Cards([]), new Cards([])];

    let deadCards = dealCards(playerDecks, cardsObject);
    console.log("asdsadsdasad", deadCards);

    for (let deadCard of deadCards) {
        console.log(deadCard);
        assert.notStrictEqual(deadCard, null, `Dead card '${deadCard.value}' is not null.`);
        assert.true(originalItems.includes(deadCard.value), `Dead card '${deadCard.value}' stems from the original deck.`);

        for (let i = 0; i < playerDecks.length; i++) {
            assert.false(playerDecks[i].items.includes(deadCard), `Dead card is not in player deck #${i}`);
        }
    }
    
});

QUnit.test("dealCards - Modifies supplied decks.", function (assert) {
    let originalItems = [1,2,3,4,5,6,7,8,9,10,11,12];
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);

    const cardDeckHalfLength = originalItems.length / 2;
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, cardDeckHalfLength, `Modified deck #${i+1}/2 is half (${cardDeckHalfLength}) of originalItems (${originalItems.length}).`);
    }
});

QUnit.test("dealCards - All source card decks have been dealt.", function (assert) {
    let originalItems = [1,2,3,4,5,6,7,8,9,10,11,12];
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);
    
    // For card in source card deck.
    for (let i = 0; i < originalItems.length; i++) {
        let cardInDeck = false;
        
        // For deck in playerDecks.
        for (let j = 0; j < playerDecks.length; j++) {
            if (cardInDeck == false) cardInDeck = playerDecks[j].includes(originalItems[i]);
        }
        
        assert.true(cardInDeck, `Source deck card ${originalItems[i]} has been dealt to a deck.`);
    }
});

QUnit.test("dealCards - Dealt decks consists of cards from the source card deck.", function (assert) {
    let originalItems = [1,2,3,4,5,6,7,8,9,10,11,12];
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);

    // For card in source card deck.
    for (let i = 0; i < originalItems.length; i++) {
        let cardInDeck = false;
        
        // For deck in playerDecks.
        for (let j = 0; j < playerDecks.length; j++) {
            if (cardInDeck == false) cardInDeck = playerDecks[j].includes(originalItems[i]);
        }

        assert.true(cardInDeck, `Source deck card ${originalItems[i]} has been dealt to a deck.`);
    }
    
    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        // For card in deck.
        for (let card of playerDecks[i]) {
            assert.true(originalItems.includes(card), `Card ${card} from deck #${i+1}/${playerDecks.length} is in source card deck.`);
        }
    }
});

QUnit.test("dealCards - Dealt decks have equal length when even amount.", function (assert) {
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);

    let referenceLength = playerDecks[0].length;

    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, referenceLength, `deck #${i+1}/${playerDecks.length} has equal length as deck #1.`);
    }
});

QUnit.test("dealCards - Dealt decks have equal length when odd amount.", function (assert) {
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);

    let referenceLength = playerDecks[0].length;

    // For deck in playerDecks.
    for (let i = 0; i < playerDecks.length; i++) {
        assert.equal(playerDecks[i].length, referenceLength, `deck #${i+1}/${playerDecks.length} has equal length as deck #1.`);
    }
});

QUnit.test("dealCards - Dealt decks have no card in common.", function (assert) {
    let cardsObject = new Cards([1,2,3,4,5,6,7,8,9,10,11,12]);
    let playerDecks = [new Cards([]), new Cards([])];

    dealCards(playerDecks, cardsObject);

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