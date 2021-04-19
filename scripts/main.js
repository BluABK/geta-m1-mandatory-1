// Model:
const CARD_FACING_BACK = true;
// As the value of Ace depends upon the card game, define it as a constant that can easily be changed later.
const ACE_FACE_CARD_VALUE = 14;
const SUITS = ["heart", "diamond", "spade", "club"];
// Card that cannot be used in play (usually happens with odd amount of players with an even amount of source deck cards).
let deadCard = null;

/**
 * Generate UUID v4 string to use for IDs and similiar.
 * @returns {String} An UUID.
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
    });
}

// Classes.
class Card {
    constructor(value, suit, facingBack = true, owner = null) {
        this.id = uuidv4();
        this.value = value;
        this.suit = suit;
        this.facingBack = facingBack;
        this.owner = owner;
    }

    /**
     * @param {number} playerId
     */
    set setOwner(playerId) {
        this.owner = playerId;
    }

    get isFacingBack() {
        return this.faceBack;
    }

    get isFacing() {
        return this.faceBack ? "back" : "front";
    }

    flip() {
        this.facingBack ? this.facingBack = false : this.facingBack = true;
    }

    faceBack() {
        this.facingBack = true;
    }

    faceFront() {
        this.facingBack = false;
    }
}

class Cards {
    items = [];
    itemsMap = null;

    constructor(items = []) {
        if (items instanceof Array) {
            this.items = items;
            this.itemsMap = new Map();

            for (let item of items) {
                // Append a reference to the card by its UUID to the items map.
                this.itemsMap.set(item.id, item);
            }
        } else {
            throw new TypeError("Constructor argument must be instance of Array!");
        }
    }

    /**
     * Make object iterable by implementing a specific next() method.
     * @returns Iterator
     */
    [Symbol.iterator]() {
        let index = -1;

        return {
            // Iterate through items array until end boundary has been reached.
            next: () => ({ value: this.items[++index], done: !(index in this.items) })
        };
    };

    /**
     * Pass .length to items array.
     */
    get length() {
        return this.items.length;
    }

    /**
     * Pass .includes to items Array.
     *
     * Determines whether an array includes a certain element, returning true or false as appropriate.
     * @param {any} searchElement The element to search for.
     * @param {number} fromIndex The position in this array at which to begin searching for searchElement.
     * @returns boolean Returns true or false whether an array includes a certain element.
     */
    includes(searchElement, fromIndex = undefined) {
        return this.items.includes(searchElement, fromIndex);
    }

    /**
     * Pass .indexOf to items Array.
     *
     * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
     * @param {any} searchElement The value to locate in the array.
     * @param {number} fromIndex The array index at which to begin the search.
     *                 If fromIndex is omitted, the search starts at index 0.
     * @returns {number} number Index of value in array or -1 if it is not present.
     */
    indexOf(any, fromIndex = undefined) {
        return this.items.indexOf(any, fromIndex);
    }

    shift() {
        // Pop item from the start of items array.
        let shiftedItem = this.items.shift();

        // Delete shifted item from the items map.
        this.itemsMap.delete(shiftedItem.id);

        return shiftedItem;
    }

    push(card) {
        // Append card to items array.
        this.items.push(card);

        // Append a reference to the card by its UUID to the items map.
        this.itemsMap.set(card.id, card);
    }

    pop() {
        // Pop item from the end of items array.
        let poppedItem = this.items.pop();

        // Delete popped item from the items map.
        this.itemsMap.delete(poppedItem.id);

        return poppedItem;
    }

    /**
     * Iterates items Array and adds any missing mappings.
     */
    updateMap() {
        if (this.items) {
            for (let item of this.items) {
                if (item) {
                    if (this.itemsMap.has(item.id) == false) {
                        console.log("Item map missing, mapping item from this.items", item);
                        this.itemsMap.set(item.id, item);
                    }
                }
            }
        }
    }

    /**
     * Pass .splice to items Array and update items map.
     *
     * Removes elements from an array and, if necessary, inserts new elements in their place,
     * returning the deleted elements.
     * @param {number} start The zero-based location in the array from which to start removing elements.
     * @param {number} deleteCount The number of elements to remove.
     * @param  {any} items Elements to insert into the array in place of the deleted elements.
     * @returns {Array} An array containing the elements that were deleted.
     */
    splice(start, deleteCount = undefined, items = undefined) {
        let splicedItems;
        if (items) {
            splicedItems = this.items.splice(start, deleteCount, items);
        } else {
            splicedItems = this.items.splice(start, deleteCount);
        }
        console.log("items", items);
        console.log("splicedItems", splicedItems);

        // Delete spliced items from the items map.
        for (let splicedItem of splicedItems) {
            this.itemsMap.delete(splicedItem.id);
        }

        // Map any new inserted entries.
        this.updateMap();

        return splicedItems;
    }

    /**
     * Find the items index of an item given its UUID.
     * @param {*} uuid UUID property of item to find.
     * @returns Index of mathced item in items Array or null.
     */
    getItemsIndexByUUID(uuid) {
        let matchedItem = null;

        this.items.findIndex(function (item) {
            if (item.id === uuid) {
                matchedItem = item;
            }
        });

        return this.items.indexOf(matchedItem);
    }

    /**
     * Find an item in items Array given its UUID.
     * @param {*} uuid UUID property of item to find.
     * @returns Mathced item in items Array or null.
     */
    getItemByUUID(uuid) {
        let matchedItem = null;

        this.items.findIndex(function (item) {
            if (item.id === uuid) {
                matchedItem = item;
            }
        });

        return matchedItem;
    }

    /**
     * Check if an item is in items Array given its UUID.
     * @param {*} uuid UUID property of item to find.
     * @returns {boolean} Status of whether item was found in items Array.
     */
    itemsHasItemByUUID(uuid) {
        let matchedItem = false;

        this.items.findIndex(function (item) {
            matchedItem = item.id === uuid;
        });

        return matchedItem;
    }

    /**
     * Shuffle a deck in-place using the unbiased Durstenfield shuffle algorithm.
     * Time complexity: O(n).
     *
     * It picks a random element for each original array element, and excludes it from the next draw,
     * like picking randomly from a deck of cards.
     *
     * This clever exclusion swaps the picked element with the current one, then picks the next random
     * element from the remainder, looping backwards for optimal efficiency, ensuring the random pick is
     * simplified (it can always start at 0), and thereby skipping the final element.
     *
     * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
     * @returns {boolean} Success status.
     */
    shuffle() {
        if (this.items instanceof Array == false) {
            return false;
        }

        if (this.items.length == 0) {
            return false;
        }

        for (let i = this.items.length - 1; i > 0; i--) {
            // Assign j a random integer such that 0 <= j <= i.
            const j = Math.floor(Math.random() * (i + 1));

            // Exchange deck[j] and deck[i]:
            // Avoid spending needless time counting the remaining numbers by moving the "struck" numbers
            // to the end of the list by swapping them with the last "unstruck" number at each iteration.
            [ this.items[i], this.items[j] ] = [ this.items[j], this.items[i] ];
        }

        return true;
    }
}

let lastBattleVictor = null;
let lastBattle = {
    "p1Card": null,
    "p2Card": null,
    "victor": NaN
}
// Cards players draw from.
let playerDecks = [new Cards(), new Cards()];
// Cards players have played.
let playerPiles = [new Cards(), new Cards()];
// War cards players have played.
let playWarPiles = [new Cards(), new Cards()];
// Code readability helper variables.
const PLAYER1_INDEX = 0;
const PLAYER2_INDEX = 1;
let cpuPlayer = 1;
const indent = "&nbsp;&nbsp;&nbsp;&nbsp;"

// View:
function updateView() {
    /**
     * Notes:
     * Each player deck and discard pile only displays the last card from their respective stack.
     */
    let lastBattleInfo = "";
    let lastVictorString = lastBattle["victor"] >= 0 ? `Player ${lastBattle["victor"] +1}` : "Draw! (FIXME: WAR)"

    if (lastBattle["p1Card"] && lastBattle["p1Card"]) {
        // ${getCardHTML(lastBattle["p1Card"])} VS ${getCardHTML(lastBattle["p2Card"])}
        lastBattleInfo = `
            ${indent}Victor: Player ${lastBattle["victor"] +1 }
        `;
    }

    document.getElementById("app").innerHTML = `
        <div class="board">
            <div id="board-stats" class="board-stats-part">
                ${allPlayersStatsHTML(playerDecks, playerPiles)}
                <br/>
                Last Battle Outcome:
                <br/>
                ${lastBattleInfo ? lastBattleInfo : `${indent}No battle have yet taken place.`}
            </div>
            <div id="player1-deck" class="card-slot deck-slot" playersIndex="0">
                ${playerDecks[0].length > 0 ? getCardHTML(playerDecks[0].items[playerDecks[0].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-pile" class="card-slot pile-slot card-pile" playersIndex="0">
                ${playerPiles[0].length > 0  ? getCardHTML(playerPiles[0].items[playerPiles[0].length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-gap"></div>
            <div class="card-spacer"></div>
            <div class="card-gap-half"></div>
            <div class="card-spacer"></div>
            <div class="card-gap"></div>
            <div id="player2-pile" class="card-slot card-pile" playersIndex="1">
                ${playerPiles[1].length > 0  ? getCardHTML(playerPiles[1].items[playerPiles[1].length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player2-deck" class="card-slot" playersIndex="1">
                ${playerDecks[1].length > 0  ? getCardHTML(playerDecks[1].items[playerDecks[1].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="newline"></div>
            <div id="player1-war-slot1" class="card-slot" playersIndex="0">
                ${playWarPiles[0].length > 0 ? getCardHTML(playWarPiles[0].items[playWarPiles[0].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot2" class="card-slot" playersIndex="0">
                ${playWarPiles[0].length > 0 ? getCardHTML(playWarPiles[0].items[playWarPiles[0].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot3" class="card-slot" playersIndex="0">
                ${playWarPiles[0].length > 0 ? getCardHTML(playWarPiles[0].items[playWarPiles[0].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-gap-half"></div>
            <div id="player1-war-slot1" class="card-slot" playersIndex="0">
            ${playWarPiles[1].length > 0 ? getCardHTML(playWarPiles[1].items[playWarPiles[1].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot2" class="card-slot" playersIndex="0">
                ${playWarPiles[1].length > 0 ? getCardHTML(playWarPiles[1].items[playWarPiles[1].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot3" class="card-slot" playersIndex="0">
                ${playWarPiles[1].length > 0 ? getCardHTML(playWarPiles[1].items[playWarPiles[1].length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
        </div>
    `;
}

// Controller:
function playerDeckStatsHTML(deck) {
    return deck.length;
}

function playerPileStatsHTML(pile) {
    return pile.length;
}

function allPlayersStatsHTML(decks, piles) {
    if (decks.length !== piles.length) {
        console.error("Player count for decks and piles are not proportional!", decks, piles);
        return;
    }

    let myDiv = "";

    for (let i = 0; i < decks.length; i++) {
        if (i !== 0) myDiv += "<br/>";
        myDiv += `Player ${i+1}: Deck: ${playerDeckStatsHTML(decks[i])}, Pile: ${playerPileStatsHTML(piles[i])}.`;
    }

    return myDiv;
}

/**
 * Create a nice card front design.
 * @param {*} value The actual value (number) of the card.
 * @param {*} suit Card suit.
 * @param {*} hide Whether or not to display the design.
 * @returns 
 */
function createCardFrontDesignHTML(value, suit, hide = true) {
    let symbol = "";

    if (suit === "heart") {
        symbol = "♥";
    } else if (suit === "diamond") {
        symbol = "♦";
    } else if (suit === "spade") {
        symbol = "♠";
    } else if (suit === "club") {
        symbol = "♣";
    } else {
        console.error("createCardDesignHTML got unknown card suit!", suit);
        symbol = '🤦‍♂️';
    }

    // Handle face card values.
    if (value === 11) value = 'J';
    if (value === 12) value = 'Q';
    if (value === 13) value = 'K';
    if (value === ACE_FACE_CARD_VALUE) value = 'A'; // Ace is value differs depending upon the game.

    let myDiv = `
    <div class="card-design" style="${hide ? "display: none;" : "" }">
        <span class="top-left">${value}<br/>${symbol}</span>
        <span class="block center card-center-symbol">${symbol}</span>
        <span class="bottom-right flip180">${value}<br/>${symbol}</span>
    </div>
    `;

    return myDiv;
}

function getCardHTML(cardObject, clickable = true) {
    let cardDesign = createCardFrontDesignHTML(cardObject.value, cardObject.suit, cardObject.facingBack);
    let cardHTML = `<div id="${cardObject.id}" class="card ${cardObject.suit} card-facing-${cardObject.facingBack ? "back" : "front"} ${clickable ? "clickable" : ""}" value="${cardObject.value}" onClick="clickedCard(this)" cardId="${cardObject.id}">${cardDesign}</div>`

    return cardHTML;
}

/**
 * Create a deck of Card objects.
 * @param {*} facingBack Card faces down.
 * @returns Array of initialised Card objects.
 */
function createDeck(facingBack = CARD_FACING_BACK, owner = null) {
    let deck = new Cards();
    // For each card suit:
    for (let suit of SUITS) {
        // For each card value:
        for (let i = 2; i <= 14; i++) {
            deck.push(new Card(i, suit, facingBack, owner));
        }
    }

    return deck;
}

function getCardOwnerIndex(card) {
    return parseInt(card.parentElement.getAttribute("playersIndex"));
}

function cardFaceFront(card) {
    card.classList.remove("card-facing-back");
    card.firstElementChild.style.display = "block";
    card.classList.add("card-facing-front");
}

function cardFaceBack(card) {
    card.classList.remove("card-facing-front");
    card.firstElementChild.style.display = "none";
    card.classList.add("card-facing-back");
}

/**
 * Flips a HTMLElement Card.
 * @param {HTMLElement} card HTMLElement Card.
 */
function flipHTMLCard(card) {
    console.log("flipCard", card);
    // Determine which direction card is currently facing.
    if (card.classList.contains("card-facing-front")) {
        cardFaceBack(card);
    } else if (card.classList.contains("card-facing-back")) {
        cardFaceFront(card);
    } else {
        console.error("BUG: This card is neither facing front or back!!", card);
    }
}

/**
 * Moves a card from one pile to another.
 * @param {HTMLElement} card Card.
 * @param {Cards} src Source pile.
 * @param {Cards} dst Destination pile.
 */
function moveCard(card, source, destination, destinationIndex = 0) {
    // Get Card's UUID.
    let cardUUID = card.getAttribute("cardID");
    console.log(cardUUID)
    // Get card's position in source array.
    let cardSourceIndex = source.getItemsIndexByUUID(cardUUID);
    console.log(cardSourceIndex)

    if (source.itemsMap.has(cardUUID) == false) {
        console.error("Attempted to move a card from a source it isn't in.", card, source);
        return;
    }

    // Remove card from its source array.
    let removedCard = source.splice(cardSourceIndex, 1)[0];
    console.log("Removed card", removedCard);

    // Insert card into the destination array at index.
    // destination.push(removedCard);
    destination.splice(destinationIndex, 0, removedCard);

    return removedCard;
}

function playCard(playersIndex, card) {
    // Move card from deck to pile, and store the returned object in a variable for later use.
    let movedCard = moveCard(card, playerDecks[playersIndex], playerPiles[playersIndex]);

    // Flip card object (from back to front).
    movedCard.flip();
    console.log("movedCard", movedCard);

    // Update view.
    updateView();

    return movedCard;
}

/**
 * Retrieve a given Player card from Cards stack, from View/document.
 * @param {number} playerIndex Player to retrieve card from.
 * @param {Cards} stack Which stack to retrieve card from.
 * @param {number} stackIndex Which card within the stack to retrieve.
 * @returns {HTMLElement} Retrieved card HTML or null.
 */
function getPlayer2ViewCardHTML(playerIndex, stack, stackIndex) {
    // let cardHTML = null;
    // cardHTML = document.getElementById()
    console.error("Not implemented!");
}

/**
 * Determine the winning Card in a battle (suits are ignored).
 * @param {Card} card1 Card.
 * @param {Card} card2 Card.
 * @returns Victorious Card or Array[Card, Card] if draw.
 */
function determineBattleVictor(card1, card2) {
    let victorCards = null;

    if (card1.value === card2.value) {
        victorCards = [card1, card2];
    } else {
        card1.value > card2.value? victorCards = card1: victorCards = card2;
    }

    console.log(`determineBattleVictor ${card1.value} VS ${card2.value}`, victorCards);

    return victorCards;
}

function battleCPU(player1CardHTML) {
    console.log("sadsadsdasa", player1CardHTML);
        // Player 1: Play the clicked card.
        // let playedCardP1 = playerDecks[PLAYER1_INDEX].itemsMap.get(player1CardHTML.getAttribute("cardID"));
        // console.log("playedCardP1", playedCardP1);
        let playedCardP1 = playCard(PLAYER1_INDEX, player1CardHTML);
        console.log("playedCardP1 2nd", playedCardP1);

        // Player 2 (CPU): Play card from top of deck/stack.
        let player2Deck = playerDecks[PLAYER2_INDEX];
        let player2Card = player2Deck.items[player2Deck.length - 1];
        let cardHTMLElementInView = document.getElementById(player2Card.id);
        let playedCardP2 = playCard(PLAYER2_INDEX, cardHTMLElementInView);

        // Battle!
        let battleVictorCard = determineBattleVictor(playedCardP1, playedCardP2);
        if (battleVictorCard instanceof Array)  {
            // Draw: It is WAR!
            // FIXME: Implement WAR!
        } else {
            let battleVictor = battleVictorCard.owner;
            console.log("battleVictor", battleVictor);
            lastBattleVictor = battleVictor;
            lastBattle["p1Card"] = playedCardP1;
            lastBattle["p2Card"] = playedCardP1;
            lastBattle["victor"] = battleVictor;

            // Update view before moving cards to have the outcome still shown on screen.
            updateView();
            
            // Insert all played cards to the bottom of battle victor's stack (and make it face backwards again).
            moveCard(document.getElementById(playedCardP1.id), playerPiles[PLAYER1_INDEX], playerDecks[battleVictor], 0).faceBack();
            moveCard(document.getElementById(playedCardP2.id), playerPiles[PLAYER2_INDEX], playerDecks[battleVictor], 0).faceBack();
        }
}

function clickedCard(cardHTML) {
    console.log("clickedCard(card)", cardHTML);
    if (cardHTML.classList.contains("clickable")) {
        // let ownerIndex = getCardOwnerIndex(card); // FIXME: Should be replaced with Card.owner. // FIXME: For use with 2 human players, currently only computer is implemented.

        // Play a single round.
        battleCPU(cardHTML);
    }
}

function dealCards(playerDecks, cardsObject) {
    if (playerDecks.length == 0) {
        console.error("Attempted to deal cards to no players!");
        return;
    }

    // Shuffle the deck of cards.
    if (!cardsObject.shuffle()) {
        console.error("Failed to shuffle cards, expect breakage!");
        // alert("Failed to shuffle cards, expect breakage!");
    }

    if (playerDecks.length % 2 != 0) {
        // If there are an odd number of players
        // Discard a (now definitely) random card, by popping the first element.
        deadCard = cardsObject.shift();

        console.info(`Discarded card due to odd number of players (${playerDecks.length})`, deadCard);

        return;
    }

    let cardsPerPlayer = cardsObject.length / playerDecks.length;

    for (let i = 0; i < playerDecks.length; i++) {
        // Empty player's old deck, if any.
        playerDecks[i] = new Cards();

        // Deal player their amount of cards from the given deck.
        for (let j = 0; j < cardsPerPlayer; j++) {
            let poppedCard = cardsObject.pop();
            poppedCard.owner = i;
            playerDecks[i].push(poppedCard);
        }
    }
}

function getDeckHTML(playerDeck) {
    let deckHTML = "";
    for (let card of playerDeck) {
        deckHTML += card;
    }

    return deckHTML;
}

dealCards(playerDecks, createDeck());

updateView();

/**
 * General TODO and FIXME section:
 *
 * FIXME: Player 2 cards should not be clickable when played by CPU.
 */