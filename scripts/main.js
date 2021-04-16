// Model:
// As the value of Ace depends upon the card game, define it as a constant that can easily be changed later.
const ACE_FACE_CARD_VALUE = 14;
const CARD_FAMILIES = ["heart", "diamond", "spade", "club"];
// Card that cannot be used in play (usually happens with odd amount of players with an even amount of source deck cards).
let deadCard = null;
// Cards players draw from.
let playerDecks = [[], []];
// Cards players have played.
let playerPiles = [[], []];
const CARD_FACING_BACK = true;
const CARD_FACING_FRONT = false;
const CARD_DECK = createDeck(CARD_FACING_BACK);
// Make card deck immutable to avoid modifications, as const only protects it from re-assignment.
Object.freeze(CARD_DECK);


// View:
function updateView() {
    document.getElementById("app").innerHTML = `
        <div class="board">
            <div class="board-top-part">
                <div id="player1-deck" class="card-slot">
                    ${playerDecks[0][0]}
                </div>
                <div id="player1-display" class="card-slot"></div>
                <div class="card-gap"></div>
                <div id="player2-display" class="card-slot"></div>
                <div id="player2-deck" class="card-slot">
                    ${playerDecks[1][0]}
                </div>
            </div>
        </div>
    `;
}

// Controller:
/**
 * Create a nice card front design.
 * @param {*} value The actual value (number) of the card.
 * @param {*} family Card family.
 * @param {*} hide Whether or not to display the design.
 * @returns 
 */
function createCardFrontDesignHTML(value, family, hide = true) {
    let symbol = "";

    if (family === "heart") {
        symbol = "♥";
    } else if (family === "diamond") {
        symbol = "♦";
    } else if (family === "spade") {
        symbol = "♠";
    } else if (family === "club") {
        symbol = "♣";
    } else {
        console.error("createCardDesignHTML got unknown card family!", family);
        symbol = family;
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

/**
 * Create a deck of cards.
 * @param {*} facingBack Card faces down.
 * @returns 
 */
function createDeck(facingBack = false) {
    let deck = [];
    // For each card family:
    for (let fam of CARD_FAMILIES) {
        // For each card value:
        for (let i = 2; i <= 14; i++) {
            let cardDesign = createCardFrontDesignHTML(i, fam, facingBack);
            deck.push(`<div class="card ${fam} card-facing-${facingBack ? "back" : "front"} clickable" value="${i}" onClick="clickedCard(this)">${cardDesign}</div>`)
        }
    }

    return deck;
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

function flipCard(card) {
    // Determine which direction card is currently facing.
    if (card.classList.contains("card-facing-front")) {
        cardFaceBack(card);
    } else if (card.classList.contains("card-facing-back")) {
        cardFaceFront(card);
    } else {
        console.error("BUG: This card is neither facing front or back!!", card);
    }
}

function clickedCard(card) {
    if (card.classList.contains("clickable")) {
        flipCard(card);
    }
}

function dealCards(playerDecks, cardDeck) {
    if (playerDecks.length == 0) {
        console.error("Attempted to deal cards to no players!");
        return;
    }

    // Copy the deck of cards into cards variable.
    let cards = Object.assign([], cardDeck);

    // Shuffle the deck of cards.
    if (!shuffleDeck(cards)) {
        console.error("Failed to shuffle cards, expect breakage!");
        alert("Failed to shuffle cards, expect breakage!");
    }

    if (playerDecks.length % 2 != 0) {
        // If there are an odd number of players

        // Shuffle the deck in case it wasn't already shuffled.
        shuffleDeck(cards);

        // Discard a (now definitely) random card, by popping the first element.
        deadCard = cards.shift();

        console.info(`Discarded card due to odd number of players (${playerDecks.length})`, deadCard);

        return;
    }

    let cardsPerPlayer = cards.length / playerDecks.length;

    for (let i = 0; i < playerDecks.length; i++) {
        // Empty player's old deck, if any.
        playerDecks[i] = [];

        // Deal player their amount of cards from the given deck.
        for (let j = 0; j < cardsPerPlayer; j++) {
            playerDecks[i].push(cards.pop());
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
 * @param {*} deck A deck of cards.
 * @returns Success status (boolean).
 */
function shuffleDeck(deck) {
    if (deck instanceof Array == false) {
        return false;
    } else if (deck.length == 0) {
        return false;
    }

    for (let i = deck.length - 1; i > 0; i--) {
        // Assign j a random integer such that 0 <= j <= i.
        const j = Math.floor(Math.random() * (i + 1));

        // Exchange deck[j] and deck[i]:
        // Avoid spending needless time counting the remaining numbers by moving the "struck" numbers
        // to the end of the list by swapping them with the last "unstruck" number at each iteration.
        [ deck[i], deck[j] ] = [ deck[j], deck[i] ];
    }

    return true;
}

dealCards(playerDecks, CARD_DECK);

updateView();