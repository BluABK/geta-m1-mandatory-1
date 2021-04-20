// Model:
const CARD_FACING_BACK = true;
// As the value of Ace depends upon the card game, define it as a constant that can easily be changed later.
const ACE_FACE_CARD_VALUE = 14;
const SUITS = ["heart", "diamond", "spade", "club"];
// Card that cannot be used in play (usually happens with odd amount of players with an even amount of source deck cards).
let deadCard = null;

let lastBattleVictor = null;
let lastBattle = {
    "p1Card": null,
    "p2Card": null,
    "victor": NaN
}
// Cards players draw from.
let playerDeck = new Cards();
let cpuDeck = new Cards();
// let playerDecks = [playerDeck, cpuDeck];
// Cards players have played.
// let playerPiles = [new Cards(), new Cards()];
let playerPile = new Cards();
let cpuPile = new Cards();
// War cards players have played. [[new Cards(), new Cards()]]
let playerWarPiles = [];
let cpuWarPiles = [];
// let currentPlayerWarIndex = -1;
// Code readability helper variables.
// const PLAYER1_INDEX = 0;
// const PLAYER2_INDEX = 1;
// let cpuPlayer = 1;
const indent = "&nbsp;&nbsp;&nbsp;&nbsp;"
const SLOT_SPACER = `<div class="card-spacer"></div>`;
const SLOT_GAP_HALF = `<div class="card-gap-half"></div>`;
const SLOT_EMPTY = `<div class="card-slot empty-card-slot"></div>`;
const NEWLINE = `<div class="newline"></div>`;

// View:
function updateView() {
    /**
     * Notes:
     * Each player deck and discard pile only displays the last card from their respective stack.
     */
    console.log("Updating view...");
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
                ${allPlayersStatsHTML()}
                <br/>
                Last Battle Outcome:
                <br/>
                ${lastBattleInfo ? lastBattleInfo : `${indent}No battle have yet taken place.`}
            </div>
            <div id="player1-deck" class="card-slot deck-slot ${playerDeck.length > 0 ? "clickable" : ""}" ${playerDeck.length > 0 ? 'onClick="clickedPlayerDeck(this.firstElementChild)"' : ""} playersIndex="0">
                ${playerDeck.length > 0 ? getCardHTML(playerDeck.items[playerDeck.length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-pile" class="card-slot pile-slot card-pile" playersIndex="0">
                ${playerPile.length > 0  ? getCardHTML(playerPile.items[playerPile.length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-gap"></div>
            <div class="card-spacer"></div>
            <div class="card-gap-half"></div>
            <div class="card-spacer"></div>
            <div class="card-gap"></div>
            <div id="player2-pile" class="card-slot card-pile unclickable" playersIndex="1">
                ${cpuPile.length > 0  ? getCardHTML(cpuPile.items[cpuPile.length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player2-deck" class="card-slot deck-slot unclickable" playersIndex="1">
                ${cpuDeck.length > 0  ? getCardHTML(cpuDeck.items[cpuDeck.length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            ${getWarHTMLs()}
        </div>
    `;
}

// Controller:
/**
 * 
 * @param {Cards} warPile 
 * @param {number} pileIndex 
 * @returns {String}
 */
function getWarCard(cards, cardIndex) {
    let myDiv = SLOT_EMPTY;

    // Cards holds enough cards to have this index.
    if (cards.length > cardIndex) {
        // Generate HTML String for the given Card.
        myDiv = `<div class="card-slot unclickable">${getCardHTML(cards.items[cardIndex])}</div>`;
    }

    return myDiv;
}

/**
 * 
 * @param {Cards} cards A Cards element that holds Card elements.
 * @returns {String} HTML String
 */
function getWarHTML(cards) {
    let warPile = "";

    warPile += `${getWarCard(cards, 0)}`;
    warPile += `${SLOT_SPACER}${getWarCard(cards, 1)}`;
    warPile += `${SLOT_SPACER}${getWarCard(cards, 2)}`;

    return warPile;
}

function getWarHTMLs() {
    if(playerWarPiles.length <= 0 || cpuWarPiles.length <= 0) return;
    if (playerWarPiles.length != cpuWarPiles.length ) {
            throw new Error(`War piles are of unequal length! ${playerWarPiles.length} != ${cpuWarPiles.length}`);
    }
    
    let warsDiv = "";
    
    // Append wars to div, one war at a time.
    for (let i = 0; i < playerWarPiles.length; i++) {
        //         \n        Player side                          GAP        CPU Side
        warsDiv += NEWLINE + getWarHTML(playerWarPiles[i]) + SLOT_GAP_HALF + getWarHTML(cpuWarPiles[i]);
    }

    console.log("warsDiv", warsDiv);
    return warsDiv;

}

function playerDeckStatsHTML(deck) {
    return deck.length;
}

function playerPileStatsHTML(pile) {
    return pile.length;
}

function allPlayersStatsHTML() {
    let myDiv = `
        Player:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Deck: ${playerDeckStatsHTML(playerDeck)}, Pile: ${playerPileStatsHTML(playerPile)}.
        <br/>
        Computer: Deck: ${playerDeckStatsHTML(cpuDeck)}, Pile: ${playerPileStatsHTML(playerPile)}.
    `;

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
    // let cardHTML = `<div id="${cardObject.id}" class="card ${cardObject.suit} card-facing-${cardObject.facingBack ? "back" : "front"} ${clickable ? "clickable" : ""}" value="${cardObject.value}" onClick="clickedCard(this)" cardId="${cardObject.id}">${cardDesign}</div>`
    let cardHTML = `<div id="${cardObject.id}" class="card ${cardObject.suit} card-facing-${cardObject.facingBack ? "back" : "front"}" value="${cardObject.value}" cardId="${cardObject.id}">${cardDesign}</div>`

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
    console.log("deck", deck.items);
    return deck;
}

function getCardOwnerIndex(card) {
    return parseInt(card.parentElement.getAttribute("playersIndex"));
}

/**
 * Flips a HTMLElement Card.
 * @param {HTMLElement} card HTMLElement Card.
 */
 function flipCard(card) {
    console.log("flipCard", card);
    card.flip();
}

/**
 * Moves a card from one pile to another.
 * @param {Card} card
 * @param {Cards} src Source pile.
 * @param {Cards} dst Destination pile.
 * @returns {Card} Card that was moved.
 */
 function moveCard(card, source, destination, destinationIndex = 0) {
    console.log("moveCard(card, destination, destinationIndex)", card, source, destination, destinationIndex);
    if (source.itemsMap.has(card.id) == false) throw new Error("Attempted to move a card from a source it isn't in.", card, source);

    // Remove card from its source array, by index.
    let removedCard = source.splice(source.getItemsIndexByUUID(card.id), 1)[0];

    // Insert card into the destination array at index.
    // destination.push(removedCard);
    destination.splice(destinationIndex, 0, removedCard);

    return removedCard;
}

function playCard(card, source, destination, facingBack = false) {
    // Move card from source to destination, and store the returned object in a variable for later use.
    let movedCard = moveCard(card, source, destination);

    // Face the given direction.
    facingBack ? movedCard.faceBack() : movedCard.faceFront();

    // Update view.
    updateView();

    return movedCard;
}

function playWarCard(playersIndex, cardHTML, destinationPile, facingBack = true) {
    // Move card from deck to pile, and store the returned object in a variable for later use.
    let movedCard = moveCardHTML(cardHTML, playerDecksOLD[playersIndex], destinationPile[playersIndex]);

    // Face the given direction.
    facingBack ? movedCard.faceBack() : movedCard.faceFront();
    console.log("movedCard (war)", movedCard);

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
    if (card1 instanceof Card == false || card2 instanceof Card == false) {
        throw new Error("determineBattleVictor got arguments that were not instanceof Card", card1, card2);
    }

    let victorCards = null;

    if (card1.value === card2.value) {
        victorCards = [card1, card2];
    } else {
        card1.value > card2.value? victorCards = card1: victorCards = card2;
    }

    console.log(`determineBattleVictor ${card1.value} VS ${card2.value}`, victorCards);

    return victorCards;
}

function finalWarWon() {
    // Reset wars.
    playerWarsPiles = [];
    currentPlayerWarIndex = -1;
}

function warCPU() {
    console.log("Warring CPU!")
    // let player1Deck = playerDecksOLD[PLAYER1_INDEX];
    // let player2Deck = playerDecksOLD[PLAYER2_INDEX];
    
    // Declare a new war.
    let warPile = []
    
    let playedCardsP1 = new Cards();
    let playedCardsP2 = new Cards();
    playerWarsPiles.push([new Cards(), new Cards()]);
    console.log("war piles post", playerWarsPiles);
    currentPlayerWarIndex++;
    
    // Draw 3 cards, one face up.
    facingBack = true;
    let lastP1Card = null;
    let lastP2Card = null;
    for (let i = 0; i < 3; i++) {
        console.log("warCPU loop: i", i);
        // Last round: Card should face up now.
        if (i === 2) {
            facingBack = false;

        }
        
        // Player draws card from top of deck/stack.
        let player1Card = player1Deck.items[player1Deck.length - 1];
        lastP1Card = playWarCard(PLAYER1_INDEX, document.getElementById(player1Card.id), playerWarsPiles[currentPlayerWarIndex], facingBack);
        updateView();
        
        // CPU draws card from top of deck/stack.
        let player2Card = player2Deck.items[player2Deck.length - 1];
        lastP2Card= playWarCard(PLAYER2_INDEX, document.getElementById(player2Card.id), playerWarsPiles[currentPlayerWarIndex], facingBack);
        updateView();
    }

    // Battle of the third card.
    console.log("lastP1Card", lastP1Card);
    console.log("lastP2Card", lastP2Card);
    battleCPU(document.getElementById(lastP1Card.id), document.getElementById(lastP2Card.id));

}

function playCPU(playerCard, cpuCard = null) {
    // Player 1: Play the clicked card.
    let playedCardPlayer = playCard(playerCard, playerDeck, playerPile, false);
    
    // Player 2 (CPU): Play card from top of deck/stack.
    let playedCardCPU = null;
    if (cpuCard) {
        playedCardCPU = playCard(cpuCard, cpuDeck, cpuPile, false);
    } else {
        playedCardCPU = playCard(cpuDeck.items[cpuDeck.length -1], cpuDeck, cpuPile, false);
    }

    return [playedCardPlayer, playedCardCPU]
}

function battleCPU(playedCardP1, playedCardP2) {
        // Battle!
        let battleVictorCard;
        try {
            battleVictorCard = determineBattleVictor(playedCardP1, playedCardP2);
        } catch (error) {
            console.error(error);
            throw error;
        }
        if (battleVictorCard instanceof Array) {
            // Draw: It is WAR, then!
            warCPU();
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
            moveCard(playedCardP1, playerPile, battleVictor == 0 ? playerDeck : cpuDeck, 0).faceBack();
            moveCard(playedCardP2, cpuPile, battleVictor == 0 ? playerDeck : cpuDeck, 0).faceBack();
        }
}

function clickedPlayerDeck(cardHTML) {
    console.log("clickedPlayerDeck(card)", cardHTML);
    // let ownerIndex = getCardOwnerIndex(card); // FIXME: Should be replaced with Card.owner. // FIXME: For use with 2 human players, currently only computer is implemented.

    // Play a single round.
    let card = playerDeck.itemsMap.get(cardHTML.id);
    console.log("card", card);
    battleCPU(...playCPU(card));
}

function dealCards(decks, cards) {
    if (decks instanceof Array == false) throw new Error("decks is not instanceof array", decks);
    if (decks.length == 0) throw new Error("Attempted to deal cards to no players!");

    // Shuffle the deck of cards.
    if (!cards.shuffle()) {
        console.error("Failed to shuffle cards, expect breakage!");
    }
    console.log("cards", cards);

    if (decks.length % 2 != 0) {
        // If there are an odd number of players
        // Discard a (now definitely) random card, by popping the first element.
        deadCard = cards.shift();

        console.info(`Discarded card due to odd number of players (${decks.length})`, deadCard);

        return;
    }

    let cardsPerPlayer = cards.length / decks.length;

    for (let i = 0; i < decks.length; i++) {
        // Empty player's old deck, if any.
        decks[i] = new Cards();

        // Deal player their amount of cards from the given deck.
        for (let j = 0; j < cardsPerPlayer; j++) {
            let poppedCard = cards.pop();
            poppedCard.owner = i;
            decks[i].push(poppedCard);
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

let dealtDecks = [playerDeck, cpuDeck]
dealCards(dealtDecks, createDeck());
playerDeck = dealtDecks[0];
cpuDeck = dealtDecks[1];

console.log("dealtDecks", dealtDecks);
console.log("playerDeck", playerDeck);
console.log("cpuDeck", cpuDeck);

updateView();

/**
 * General TODO and FIXME section:
 *
 */