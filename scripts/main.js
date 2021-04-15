// Model
const CARD_FAMILIES = ["heart", "diamond", "spade", "club"];
// const CARD_DECK = createDeck();
let player1Deck = [];
let player2Deck = [];


// View
function updateView() {
    document.getElementById("app").innerHTML = `
        <div class="board">
            <div class="board-top-part">
                <div id="player1-deck" class="card-slot">
                    ${getDeckHTML(player1Deck)}
                </div>
                <div id="player1-display" class="card-slot"></div>
                <div class="card-gap"></div>
                <div id="player2-display" class="card-slot"></div>
                <div id="player2-deck" class="card-slot">
                    ${getDeckHTML(player2Deck)}
                </div>
            </div>
        </div>
    `;
}

// Controller
function createDeck() {
    let deck = [];
    // For each card family:
    for (let fam of CARD_FAMILIES) {
        // For each card value:
        for (let i = 2; i <= 14; i++) {
            deck.push(`<div class="card ${fam}">${i}</div>`)
        }
    }

    return deck;
}

function dealDeck(player, cards) {

}

function getDeckHTML(playerDeck) {
    let deckHTML = "";
    for (let card of playerDeck) {
        // deckHTML += `<div class="card card-back">${card}</div>`;
        deckHTML += `<div class="card">${card}</div>`;
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
        console.log("deck not array!", deck);
        return false;
    } else if (deck.length == 0) {
        console.log("deck is empty array!", deck);
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

// player1Deck = createDeck();
// player2Deck = createDeck();

updateView();