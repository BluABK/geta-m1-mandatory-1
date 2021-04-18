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
        this.ownerId = owner;
    }

    set owner(playerId) {
        this.ownerId = playerId;
    }

    get owner() {
        return this.owner;
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
     * Pass .splice to items Array and update items map.
     *
     * Removes elements from an array and, if necessary, inserts new elements in their place,
     * returning the deleted elements.
     * @param {number} start The zero-based location in the array from which to start removing elements.
     * @param {number} deleteCount The number of elements to remove.
     * @returns {Array} An array containing the elements that were deleted.
     */
    splice(start, deleteCount = undefined) {
        // Splice deleteCount amount of item from start index.
        let splicedItems = this.items.splice(start, deleteCount);

        // Delete spliced items from the items map.
        for (let splicedItem of splicedItems) {
            this.itemsMap.delete(splicedItem.id);
        }

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

// Cards players draw from.
let playerDecks = [new Cards(), new Cards()];
// Cards players have played.
let playerPiles = [new Cards(), new Cards()];

// View:
function updateView() {
    /**
     * Notes:
     * Each player deck and discard pile only displays the last card from their respective stack.
     */
    document.getElementById("app").innerHTML = `
        <div class="board">
            <div class="board-top-part">
                <div id="player1-deck" class="card-slot card-deck" playersIndex="0">
                    ${playerDecks[0].length > 0 ? getCardHTML(playerDecks[0].items[playerDecks[0].length - 1]) : ""}
                </div>
                <div id="player1-pile" class="card-slot card-pile" playersIndex="0">
                    ${playerPiles[0].length > 0  ? getCardHTML(playerPiles[0].items[playerPiles[0].length - 1], false) : ""}
                </div>
                <div class="card-gap"></div>
                <div id="player2-pile" class="card-slot card-pile" playersIndex="1">
                    ${playerPiles[1].length > 0  ? getCardHTML(playerPiles[1].items[playerPiles[1].length - 1], false) : ""}
                </div>
                <div id="player2-deck" class="card-slot card-deck" playersIndex="1">
                    ${playerDecks[1].length > 0  ? getCardHTML(playerDecks[1].items[playerDecks[1].length - 1]) : ""}
                </div>
            </div>
            <div class="board-stats-part">
                ${allPlayersStatsHTML(playerDecks, playerPiles)}
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
    let cardHTML = `<div class="card ${cardObject.suit} card-facing-${cardObject.facingBack ? "back" : "front"} ${clickable ? "clickable" : ""}" value="${cardObject.value}" onClick="clickedCard(this)" cardId="${cardObject.id}">${cardDesign}</div>`

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
function moveCard(card, source, destination) {
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

    // Append card to the destination array.
    destination.push(removedCard);

    // Update view.
    updateView();

    return removedCard;
}

function clickedCard(card) {
    console.log("clickedCard(card)", card);
    if (card.classList.contains("clickable")) {
        let ownerIndex = getCardOwnerIndex(card); // FIXME: Should be replaced with Card.owner.

        // Move card from deck to pile, and store the returned object in a variable for later use.
        let movedCard = moveCard(card, playerDecks[ownerIndex], playerPiles[ownerIndex]);

        // Flip card object (from back to front).
        movedCard.flip();

        // Update view.
        updateView();
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