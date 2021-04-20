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
let playerDecks = [new Cards(), new Cards()];
// Cards players have played.
let playerPiles = [new Cards(), new Cards()];
// War cards players have played. [[new Cards(), new Cards()]]
let playerWarsPiles = [];
let currentPlayerWarIndex = -1;
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
                ${getWarCard(currentPlayerWarIndex, 0, 0)}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot2" class="card-slot" playersIndex="0">
                ${getWarCard(currentPlayerWarIndex, 0, 1)}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot3" class="card-slot" playersIndex="0">
                ${getWarCard(currentPlayerWarIndex, 0, 2)}
            </div>
            <div class="card-gap-half"></div>
            <div id="player1-war-slot1" class="card-slot" playersIndex="0">
                ${getWarCard(currentPlayerWarIndex, 1, 0)}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot2" class="card-slot" playersIndex="0">
                ${getWarCard(currentPlayerWarIndex, 1, 1)}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-war-slot3" class="card-slot" playersIndex="0">
                ${getWarCard(currentPlayerWarIndex, 1, 2)}
            </div>
        </div>
    `;
}

// Controller:
function getWarCard(warsIndex, playerIndex, cardIndex) {
    let myDiv = `<div class="card-slot empty-card-slot"></div>`;

    // There is actually a war on.
    if (currentPlayerWarIndex > -1) {
        console.log("getWarCard cardIndex", cardIndex);
        console.log("getWarCard currentPlayerWarIndex", currentPlayerWarIndex);
        // War pile Cards object.
        let warPile = playerWarsPiles[warsIndex][playerIndex];
        console.log("getWarCard warPile", warPile);
        
        // Player has sufficient cards left to fill this war slot.
        console.log("warPile.length", warPile.length);
        if (warPile.length > cardIndex) {
            // Get HTMLElement for the given Card.
            myDiv = getCardHTML(warPile.items[cardIndex]);
        }
    }

    return myDiv;
}

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
 * @param {HTMLElement} card
 * @param {Cards} src Source pile.
 * @param {Cards} dst Destination pile.
 */
function moveCard(card, source, destination, destinationIndex = 0) {
    console.log("moveCard card", card);
    console.log("moveCard destination", destination);
    // Get Card's UUID.
    let cardUUID = card.getAttribute("cardID");
    // Get card's position in source array.
    let cardSourceIndex = source.getItemsIndexByUUID(cardUUID);
    // console.log("cardSourceIndex", cardSourceIndex);

    if (source.itemsMap.has(cardUUID) == false) {
        console.error("Attempted to move a card from a source it isn't in.", card, source);
        return;
    }

    // Remove card from its source array.
    let removedCard = source.splice(cardSourceIndex, 1)[0];
    // console.log("Removed card", removedCard);

    // Insert card into the destination array at index.
    // destination.push(removedCard);
    destination.splice(destinationIndex, 0, removedCard);

    return removedCard;
}

function playCard(playersIndex, cardHTML) {
    // Move card from deck to pile, and store the returned object in a variable for later use.
    let movedCard = moveCard(cardHTML, playerDecks[playersIndex], playerPiles[playersIndex]);

    // Flip card object (from back to front).
    movedCard.flip();
    console.log("movedCard", movedCard);

    // Update view.
    updateView();

    return movedCard;
}

function playWarCard(playersIndex, cardHTML, destinationPile, facingBack = true) {
    // Move card from deck to pile, and store the returned object in a variable for later use.
    let movedCard = moveCard(cardHTML, playerDecks[playersIndex], destinationPile[playersIndex]);

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
    let player1Deck = playerDecks[PLAYER1_INDEX];
    let player2Deck = playerDecks[PLAYER2_INDEX];
    
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

function playCPU(player1CardHTML, player2CardHTML = null) {
    // Player 1: Play the clicked card.
    let playedCardP1 = playCard(PLAYER1_INDEX, player1CardHTML);

    // Player 2 (CPU): Play card from top of deck/stack.
    let playedCardP2 = "boo boo in battleCPU!";
    if (player2CardHTML) {
        playedCardP2 = playCard(PLAYER2_INDEX, player2CardHTML);
    } else {
        let player2Deck = playerDecks[PLAYER2_INDEX];
        let player2Card = player2Deck.items[player2Deck.length - 1];
        let cardHTMLElementInView = document.getElementById(player2Card.id);
        playedCardP2 = playCard(PLAYER2_INDEX, cardHTMLElementInView);
    }

    return [playedCardP1, playedCardP2]
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
            moveCard(document.getElementById(playedCardP1.id), playerPiles[PLAYER1_INDEX], playerDecks[battleVictor], 0).faceBack();
            moveCard(document.getElementById(playedCardP2.id), playerPiles[PLAYER2_INDEX], playerDecks[battleVictor], 0).faceBack();
        }
}

function clickedCard(cardHTML) {
    console.log("clickedCard(card)", cardHTML);
    if (cardHTML.classList.contains("clickable")) {
        // let ownerIndex = getCardOwnerIndex(card); // FIXME: Should be replaced with Card.owner. // FIXME: For use with 2 human players, currently only computer is implemented.

        // Play a single round.
        battleCPU(...playCPU(cardHTML));
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