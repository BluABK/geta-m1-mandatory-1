// Model:
let gameOver = false;
const CARD_FACING_BACK = true;
// As the value of Ace depends upon the card game, define it as a constant that can easily be changed later.
const ACE_FACE_CARD_VALUE = 14;
const SUITS = ["heart", "diamond", "spade", "club"];
// Card that cannot be used in play (usually happens with odd amount of players with an even amount of source deck cards).
let deadCard = null;

let battleLog = [];
// Cards players draw from.
let playerDeck = new Cards();
let cpuDeck = new Cards();
let playerPile = new Cards();
let cpuPile = new Cards();
// War cards players have played. [[new Cards(), new Cards()]]
let playerWarPiles = [];
let cpuWarPiles = [];
const TEXT_INDENT = "&nbsp;&nbsp;&nbsp;&nbsp;";
const VERICAL_SPACER = `<div class="vertical-spacer"></div>`;
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
    // Statistics preparation.
    let latestBattleVictor = "No one";

    if (battleLog.length > 0) {
        if (battleLog[battleLog.length -1]["draw"]) {
            latestBattleVictor = "Draw!"
        } else {
            battleLog[battleLog.length -1]["userWon"] ? latestBattleVictor = "Player" : latestBattleVictor = "Computer";
        }
    }

    // Draw the app view.
    document.getElementById("app").innerHTML = `
        <div class="board">
            <div id="board-stats" class="board-stats-part">
                ${allPlayersStatsHTML()}<br/>
                <br/>
                Battles fought: ${battleLog.length}.<br/>
                Latest Battle Victor: ${latestBattleVictor}
            </div>
            ${VERICAL_SPACER}
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
 * @param {boolean} reverse Append card slots in reverse order.
 * @returns {String} HTML String
 */
function getWarHTML(cards, reverse = false) {
    let warPile = "";

    if (reverse) {
        warPile += `${getWarCard(cards, 2)}`;
        warPile += `${SLOT_SPACER}${getWarCard(cards, 1)}`;
        warPile += `${SLOT_SPACER}${getWarCard(cards, 0)}`;
    } else {
        warPile += `${getWarCard(cards, 0)}`;
        warPile += `${SLOT_SPACER}${getWarCard(cards, 1)}`;
        warPile += `${SLOT_SPACER}${getWarCard(cards, 2)}`;
    }

    return warPile;
}

function getWarHTMLs() {
    if(playerWarPiles.length <= 0 || cpuWarPiles.length <= 0) return "";
    if (playerWarPiles.length != cpuWarPiles.length ) {
            throw new Error(`War piles are of unequal length! ${playerWarPiles.length} != ${cpuWarPiles.length}`);
    }
    
    let warsDiv = "";
    
    // Append wars to div, one war at a time.
    for (let i = 0; i < playerWarPiles.length; i++) {
        //         \n        Player side                          GAP        CPU Side
        warsDiv += NEWLINE + VERICAL_SPACER + NEWLINE + getWarHTML(playerWarPiles[i]) + SLOT_GAP_HALF + getWarHTML(cpuWarPiles[i], true);
    }

    // console.log("warsDiv", warsDiv);
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
 * @param {boolean} pushNotSplice If true, push instead of splice into destination (destinationIndex is then unused).
 * @param {number} destinationIndex Index of destination to splice/insert at.
 * @returns {Card} Card that was moved.
 */
 function moveCard(card, source, destination, pushNotSplice = true, destinationIndex = 0) {
    // Check if the game is already over before moving cards.
    checkIfGameOver();
    console.log("moveCard(...)", card, source, destination, pushNotSplice, destinationIndex);

    if (card == undefined) throw new Error("Attempted to move undefined card!");
    if (source.itemsMap.has(card.id) == false) {
        console.error("Attempted to move a card from a source it isn't in.", card, source, destination, pushNotSplice, destinationIndex);
        throw new Error("Attempted to move a card from a source it isn't in.");
    }

    // Remove card from its source array, by index.
    let removedCard = source.splice(source.getItemsIndexByUUID(card.id), 1)[0];
    
    if (pushNotSplice) {
        // Append card to array.
        destination.push(removedCard);
    } else {
        // Insert card into the destination array at index.
        destination.splice(destinationIndex, 0, removedCard);
    }

    // Check if the game is over after moving the card out of the source stack that could very well be a player's deck.
    checkIfGameOver();
    
    return removedCard;
}

/**
 * 
 * @param {*} card 
 * @param {*} source Source pile.
 * @param {*} destination Destination pile.
 * @param {*} pushNotSplice If true, push instead of splice into destination (destinationIndex is then unused).
 * @param {*} destinationIndex Index of destination to splice/insert at.
 * @param {*} facingBack 
 * @returns Card that was played (and moved).
 */
function playCard(card, source, destination, pushNotSplice = true, destinationIndex = 0, facingBack = false) {
    // Move card from source to destination, and store the returned object in a variable for later use.
    let movedCard = moveCard(card, source, destination, pushNotSplice, destinationIndex);

    // Face the given direction.
    facingBack ? movedCard.faceBack() : movedCard.faceFront();

    // Update view.
    updateView();

    return movedCard;
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

function declareGameWinner(userWon = false) {
    if (userWon === null) {
        console.log("It is a draw! :o");
        alert("It is a draw! :o");
    } else if (userWon === true) {
        console.log("User won!");
        alert("You Won!");
    } else {
        alert("You lost!");
        console.log("User lost!");
    }

    gameOver = true;

    updateView();
}

function checkIfGameOver() {
    // Make sure the war piles are of equal length.
    if (playerDeck.length == 0 || cpuDeck.length == 0) {
        if (playerDeck.length == cpuDeck.length) {
            // If not equal, the player with the least amount of cards left has lost.
            declareGameWinner(null);
        } else {
            // If not equal, the player with the least amount of cards left has lost.
            declareGameWinner(playerWarPiles.length > cpuWarPiles.length);
        }
    }
}

function warCPU() {
    console.log(`Declaring War #${playerWarPiles.length} against CPU!`);

    // Make sure the war piles are of equal length.
    if (playerWarPiles.length != cpuWarPiles.length ) {
        // If not equal, the player with the least amount of cards left has lost.
        declareGameWinner(playerWarPiles.length > cpuWarPiles.length);
    }
    
    // Declare a new war.
    playerWarPiles.push(new Cards());
    cpuWarPiles.push(new Cards());
    // Position in array for the newly pushed Cards objects (player and cpu have equal length arrays).
    let currentWarCardsIndex = playerWarPiles.length -1;
    
    // Draw 3 cards, one face up.
    facingBack = true;
    for (let i = 0; i < 3; i++) {
        // Last round: Card should face up now.
        if (i === 2) facingBack = false;
        
        let plrDestIndex = playerWarPiles[currentWarCardsIndex].length -1;
        
        // Player draws card from top of deck/stack, and push the returned Card to Player's war piles.
        let playerDrawnCard = playCard(playerDeck.items[playerDeck.length - 1], playerDeck, playerWarPiles[currentWarCardsIndex], true, NaN, facingBack);
        console.log(`War #${playerWarPiles.length}: Player drew [Card ${i+1}/3]: ${playerDrawnCard.value} ${playerDrawnCard.suit}`)
        
        let cpuDestIndex = cpuWarPiles[currentWarCardsIndex].length -1;
        
        // CPU draws card from top of deck/stack, and push the returned Card to CPU's war piles.
        let cpuDrawnCard = playCard(cpuDeck.items[cpuDeck.length - 1], cpuDeck, cpuWarPiles[currentWarCardsIndex], true, NaN, facingBack);
        console.log(`War #${playerWarPiles.length}: CPU drew [Card ${i+1}/3]: ${cpuDrawnCard.value} ${cpuDrawnCard.suit}`)
    }

    // Battle of the third card.
    console.log("lastPlayerCard", playerWarPiles[currentWarCardsIndex].lastItem);
    console.log("lastCPUCard", cpuWarPiles[currentWarCardsIndex].lastItem);
    updateView();

    // Battle the 3rd and final card of each war pile respectively, but don't move cards just yet.
    battleCPU(playerWarPiles[currentWarCardsIndex].lastItem, cpuWarPiles[currentWarCardsIndex].lastItem, false);

    let userWonTheWar = battleLog[battleLog.length -1]["userWon"];
    console.log(`Wars won by, ${userWonTheWar ? "User" : "Computer"}`);

    // Display the war(s) result before moving cards out of their slots.
    updateView();

    // Move all cards in play into the victor's deck:
    // Move the ones from the normal piles.
    console.log("Spoils of War: Move the ones from the normal piles.");
    moveCard(playerPile.items[playerPile.length -1], playerPile, userWonTheWar ? playerDeck : cpuDeck, false, 0).faceBack();
    moveCard(cpuPile.items[cpuPile.length -1], cpuPile, userWonTheWar ? playerDeck : cpuDeck, false, 0).faceBack();

    // Make sure the war piles are of equal length.
    if (playerWarPiles.length != cpuWarPiles.length ) {
        // If not equal, the player with the least amount of cards left has lost.
        declareGameWinner(playerWarPiles.length > cpuWarPiles.length);
    }
    
    // Move the ones in the war piles.
    console.log("Spoils of War: Move the ones in the war piles.");
    // For each war Cards (both sides in tandem).
    for (let i = 0; i < playerWarPiles.length; i++) {
        // For each card in war (both sides in tandem). Decrementing backwards loop due to length changing as cards get moved out of the source pile.
        for (let j = playerWarPiles[i].length -1; j > -1; j--) {
            moveCard(playerWarPiles[i].items[j], playerWarPiles[i], userWonTheWar ? playerDeck : cpuDeck, false, 0).faceBack();
            moveCard(cpuWarPiles[i].items[j], cpuWarPiles[i], userWonTheWar ? playerDeck : cpuDeck, false, 0).faceBack();
        }
    }
    // Clear all wars.
    playerWarPiles = [];
    cpuWarPiles = [];

    // NB: Omitting updateView call here to make result linger on board.
}

function playCPU(playerCard, cpuCard = null) {
    // Player 1: Play the clicked card.
    let playedCardPlayer = playCard(playerCard, playerDeck, playerPile, false, 0, false);
    
    // Player 2 (CPU): Play card from top of deck/stack.
    let playedCardCPU = null;
    if (cpuCard instanceof Card) {
        playedCardCPU = playCard(cpuCard, cpuDeck, cpuPile, false, 0, false);
    } else {
        playedCardCPU = playCard(cpuDeck.items[cpuDeck.length -1], cpuDeck, cpuPile, false, 0, false);
    }

    return [playedCardPlayer, playedCardCPU]
}

function battleCPU(playerCard, cpuCard, moveCards = true) {
    // Battle!
    let battleVictorCard;
    try {
        battleVictorCard = determineBattleVictor(playerCard, cpuCard);
    } catch (error) {
        console.error(error);
        throw error;
    }
    if (battleVictorCard instanceof Array) {
        // Draw: It is WAR, then!

        // Update Battle log
        battleLog.push({
            "draw": true,
            "userWon": null,
            "userCard": playerCard,
            "cpuCard": cpuCard
        });

        updateView();

        // Go to war!
        warCPU();
    } else {
        // Update Battle log
        battleLog.push({
            "draw": false,
            "userWon": battleVictorCard.id === playerCard.id,
            "userCard": playerCard,
            "cpuCard": cpuCard
        });

        updateView();
        
        if (moveCards) {
            // Insert all played cards to the bottom of battle victor's deck stack (and make it face backwards again).
            moveCard(playerCard, playerPile, battleVictorCard.id === playerCard.id ? playerDeck : cpuDeck, false, 0).faceBack();
            moveCard(cpuCard, cpuPile, battleVictorCard.id === playerCard.id ? playerDeck : cpuDeck, false, 0).faceBack();
        }
    }
}

function clickedPlayerDeck(cardHTML) {
    // console.log("clickedPlayerDeck(card)", cardHTML);
    // let ownerIndex = getCardOwnerIndex(card); // FIXME: Should be replaced with Card.owner. // FIXME: For use with 2 human players, currently only computer is implemented.

    // Play a single round.
    let card = playerDeck.itemsMap.get(cardHTML.id);
    // console.log("card", card);
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