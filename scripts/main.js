// Model:
let gameOver = false;
let gameVictor = null;

const CARD_FACING_BACK = true;
// As the value of Ace depends upon the card game, define it as a constant that can easily be changed later.
const ACE_FACE_CARD_VALUE = 14;
const SUITS = ["heart", "diamond", "spade", "club"];
// Card that cannot be used in play (usually happens with odd amount of players with an even amount of source deck cards).
let designatedDeadCards = [];

let battleLog = [];
// Various Card stacks
let userDeck = new Cards();
let cpuDeck = new Cards();
let userPile = new Cards();
let cpuPile = new Cards();
// War cards players have played.
let userWarPiles = [];
let cpuWarPiles = [];

// Strings and elements declared as constants for easier re-use and better readability.
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
            <div id="player1-deck" class="card-slot deck-slot ${userDeck.length > 0 && gameOver === false ? "clickable" : "unclickable"}" ${userDeck.length > 0 && gameOver === false ? 'onClick="clickedPlayerDeck(this.lastElementChild)"' : ""}>
                ${userDeck.length > 0 ? '<div class="deck-count-overlay">' + userDeck.length + '</div>' : ""}
                ${userDeck.length > 0 ? getCardHTML(userDeck.items[userDeck.length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player1-pile" class="card-slot pile-slot card-pile">
                ${userPile.length > 0  ? getCardHTML(userPile.items[userPile.length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="board-top-row-spacer">
                <div class="board-stats-part">
                    Latest Battle Victor:<br/>
                    ${latestBattleVictor}<br/>
                    <br/>
                    Battles fought:<br/>
                    ${battleLog.length}
                    ${gameOver ? "<br/><br/><br/>Game Over: " + (gameVictor !== null ? "Won by " + gameVictor : "It was a draw!")  : ""}
                </div>
            </div>
            <div id="player2-pile" class="card-slot card-pile unclickable">
                ${cpuPile.length > 0  ? getCardHTML(cpuPile.items[cpuPile.length - 1], false) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            <div class="card-spacer"></div>
            <div id="player2-deck" class="card-slot deck-slot unclickable">
                ${cpuDeck.length > 0 ? '<div class="deck-count-overlay">' + cpuDeck.length + '</div>' : ""}
                ${cpuDeck.length > 0  ? getCardHTML(cpuDeck.items[cpuDeck.length - 1]) : `<div class="card-slot empty-card-slot"></div>`}
            </div>
            ${getWarsHTML()}
        </div>
    `;
}

// Controller:
/**
 * Get generated HTML String for a Card at war.
 * @param {Cards} cards Cards containing the Card to get HTML for.
 * @param {number} cardIndex Index in Cards of the Card to get HTML for.
 * @returns {String} HTML String of the Card.
 */
function getWarCardHTML(cards, cardIndex) {
    let myDiv = SLOT_EMPTY;

    // Cards holds enough cards to have this index.
    if (cards.length > cardIndex) {
        // Generate HTML String for the given Card.
        myDiv = `<div class="card-slot unclickable">${getCardHTML(cards.items[cardIndex])}</div>`;
    }

    return myDiv;
}

/**
 * Get generated HTML Strings for Cards in a war.
 * @param {Cards} cards A Cards element that holds Card elements.
 * @param {boolean} reverse Append card slots in reverse order (used for CPUs "mirrored" side).
 * @returns {String} HTML String of all the cards at war.
 */
function getWarHTML(cards, reverse = false) {
    let warPile = "";

    if (reverse) {
        warPile += `${getWarCardHTML(cards, 2)}`;
        warPile += `${SLOT_SPACER}${getWarCardHTML(cards, 1)}`;
        warPile += `${SLOT_SPACER}${getWarCardHTML(cards, 0)}`;
    } else {
        warPile += `${getWarCardHTML(cards, 0)}`;
        warPile += `${SLOT_SPACER}${getWarCardHTML(cards, 1)}`;
        warPile += `${SLOT_SPACER}${getWarCardHTML(cards, 2)}`;
    }

    return warPile;
}

/**
 * Get all wars as a genereated HTML String.
 * @returns {String} HTML String of all the wars.
 */
function getWarsHTML() {
    if(userWarPiles.length <= 0 || cpuWarPiles.length <= 0) return "";
    if (userWarPiles.length != cpuWarPiles.length ) {
            throw new Error(`War piles are of unequal length! ${userWarPiles.length} != ${cpuWarPiles.length}`);
    }
    
    let warsDiv = "";
    
    // Append wars to div, one war at a time.
    for (let i = 0; i < userWarPiles.length; i++) {
        //         \n        Player side                          GAP        CPU Side
        warsDiv += NEWLINE + VERICAL_SPACER + NEWLINE + getWarHTML(userWarPiles[i]) + SLOT_GAP_HALF + getWarHTML(cpuWarPiles[i], true);
    }

    return warsDiv;

}

/**
 * Create a nice card front design.
 * @param {number} value The actual value of the card.
 * @param {String} suit Card suit.
 * @param {boolean} hide Whether or not to display the design.
 * @returns {String} HTML String of the Card design.
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
 * @param {boolean} facingBack Card faces down.
 * @returns {Array} Array of initialised Card objects.
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

/**
 * Moves a card from one pile to another.
 * @param {Card} card The Card to move.
 * @param {Cards} src Source pile to move it from.
 * @param {Cards} dst Destination pile to move it into.
 * @param {boolean} pushNotSplice If true, push instead of splice into destination (destinationIndex is then unused).
 * @param {number} destinationIndex Index of destination to splice/insert at.
 * @returns {Card} The Card that was moved.
 */
 function moveCard(card, source, destination, pushNotSplice = true, destinationIndex = 0) {
    // Check if the game is already over before moving cards.
    checkIfGameOver();

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
 * @param {Card} card The Card to play.
 * @param {Cards} src Source pile to move it from.
 * @param {Cards} dst Destination pile to move it into.
 * @param {boolean} pushNotSplice If true, push instead of splice into destination (destinationIndex is then unused).
 * @param {number} destinationIndex Index of destination to splice/insert at.
 * @param {boolean} facingBack Card faces down.
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
 * @returns {Card|Array} Victorious Card or Array[Card, Card] if draw.
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

    return victorCards;
}

/**
 * Declare winner and end the game.
 * @param {boolean|null} userWon True if user won, false if CPU and null if draw.
 */
function declareGameWinner(userWon = false) {
    if (userWon === null) {
        gameVictor = null;
        alert("It is a draw! :o");
    } else if (userWon === true) {
        gameVictor = "User";
        alert("You Won!");
    } else if (userWon === false) {
        gameVictor = "Computer";
        alert("You lost!");
    } else {
        console.error(`declareGameWinner(${userWon}) arg was neither null, true or false!!`)
        throw new Error(`declareGameWinner(${userWon}) arg was neither null, true or false!!`);
    }

    gameOver = true;

    updateView();
}

/**
 * Check if te criteria for Game Over has been met.
 */
function checkIfGameOver() {
    // Make sure the war piles are of equal length.
    if (userDeck.length === 0 || cpuDeck.length === 0) {
        if (userDeck.length === cpuDeck.length) {
            // If not equal, the player with the least amount of cards left has lost.
            declareGameWinner(null);
        } else {
            // If not equal, the player with the least amount of cards left has lost.
            declareGameWinner(userDeck.length > cpuDeck.length);
        }
    }
}

/**
 * User goes to war against the computer.
 */
function warCPU() {
    // Make sure the war piles are of equal length.
    if (userWarPiles.length != cpuWarPiles.length ) {
        // If not equal, the player with the least amount of cards left has lost.
        declareGameWinner(userWarPiles.length > cpuWarPiles.length);
    }
    
    // Declare a new war.
    userWarPiles.push(new Cards());
    cpuWarPiles.push(new Cards());

    // Position in array for the newly pushed Cards objects (user and cpu have equal length arrays).
    let currentWarCardsIndex = userWarPiles.length -1;
    
    // Draw 3 cards, one face up.
    facingBack = true;
    for (let i = 0; i < 3; i++) {
        // Last round: Card should face up now.
        if (i === 2) facingBack = false;
        
        // Player draws card from top of deck/stack, and push the returned Card to Player's war piles.
        playCard(userDeck.items[userDeck.length - 1], userDeck, userWarPiles[currentWarCardsIndex], true, NaN, facingBack);
        
        // CPU draws card from top of deck/stack, and push the returned Card to CPU's war piles.
        playCard(cpuDeck.items[cpuDeck.length - 1], cpuDeck, cpuWarPiles[currentWarCardsIndex], true, NaN, facingBack);
    }

    // Battle of the third card.
    updateView();

    // Battle the 3rd and final card of each war pile respectively, but don't move cards just yet.
    battleCPU(userWarPiles[currentWarCardsIndex].lastItem, cpuWarPiles[currentWarCardsIndex].lastItem, false);

    let userWonTheWar = battleLog[battleLog.length -1]["userWon"];

    // Display the war(s) result before moving cards out of their slots.
    updateView();

    // Move all cards in play into the victor's deck:
    // Move the ones from the normal piles.
    moveCard(userPile.items[userPile.length -1], userPile, userWonTheWar ? userDeck : cpuDeck, false, 0).faceBack();
    moveCard(cpuPile.items[cpuPile.length -1], cpuPile, userWonTheWar ? userDeck : cpuDeck, false, 0).faceBack();

    // Make sure the war piles are of equal length.
    if (userWarPiles.length != cpuWarPiles.length ) {
        // If not equal, the player with the least amount of cards left has lost.
        declareGameWinner(userWarPiles.length > cpuWarPiles.length);
    }
    
    // Move the ones in the war piles.
    // For each war Cards (both sides in tandem).
    for (let i = 0; i < userWarPiles.length; i++) {
        // For each card in war (both sides in tandem). Decrementing backwards loop due to length changing as cards get moved out of the source pile.
        for (let j = userWarPiles[i].length -1; j > -1; j--) {
            moveCard(userWarPiles[i].items[j], userWarPiles[i], userWonTheWar ? userDeck : cpuDeck, false, 0).faceBack();
            moveCard(cpuWarPiles[i].items[j], cpuWarPiles[i], userWonTheWar ? userDeck : cpuDeck, false, 0).faceBack();
        }
    }

    // Clear all wars.
    userWarPiles = [];
    cpuWarPiles = [];
}

/**
 * User plays a Card against the computer's Card.
 * @param {Card} userCard User's Card.
 * @param {Card|null|undefined} cpuCard Optional computer card retrieval override.
 * @returns {Array} Both played cards.
 */
function playCPU(userCard, cpuCard = null) {
    let playedCardCPU = null;
    
    // Player 1 (User): Play the clicked card.
    let playedCardPlayer = playCard(userCard, userDeck, userPile, false, 0, false);
    
    // Player 2 (CPU): Play card from top of deck/stack.
    if (cpuCard instanceof Card) {
        playedCardCPU = playCard(cpuCard, cpuDeck, cpuPile, false, 0, false);
    } else {
        playedCardCPU = playCard(cpuDeck.items[cpuDeck.length -1], cpuDeck, cpuPile, false, 0, false);
    }

    return [playedCardPlayer, playedCardCPU]
}

/**
 * User takes their Card to battle against the computer's Card.
 * @param {Card} userCard User's champion.
 * @param {Card} cpuCard Computer's champion
 * @param {boolean} moveCards Whether or not to move cards after battle is over (usually false if called by a war).
 */
function battleCPU(userCard, cpuCard, moveCards = true) {
    let battleVictorCard;
    
    // Battle!
    try {
        battleVictorCard = determineBattleVictor(userCard, cpuCard);
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
            "userCard": userCard,
            "cpuCard": cpuCard
        });

        updateView();

        // Go to war!
        warCPU();
    } else {
        // Update Battle log
        battleLog.push({
            "draw": false,
            "userWon": battleVictorCard.id === userCard.id,
            "userCard": userCard,
            "cpuCard": cpuCard
        });

        updateView();
        
        if (moveCards) {
            // Insert all played cards to the bottom of battle victor's deck stack (and make it face backwards again).
            moveCard(userCard, userPile, battleVictorCard.id === userCard.id ? userDeck : cpuDeck, false, 0).faceBack();
            moveCard(cpuCard, cpuPile, battleVictorCard.id === userCard.id ? userDeck : cpuDeck, false, 0).faceBack();
        }
    }
}

/**
 * Actions to perform if User clicks their deck element.
 * @param {HTMLElement} cardHTML HTML Element representing a Card.
 * @returns Returns if Game Over.
 */
function clickedPlayerDeck(cardHTML) {
    checkIfGameOver();
    if (gameOver) return;

    let card = userDeck.itemsMap.get(cardHTML.id);
    
    // Play a single round.
    battleCPU(...playCPU(card));
}

/**
 * Deal out (and shuffle) Cards evenly to players.
 * If the player to Cards ratio is not proportional a card will be marked "dead" and discarded.
 * @param {Array} decks Array of Cards objects.
 * @param {Array} cards Array of individual Card objects
 * @returns 
 */
function dealCards(decks, cards) {
    let deadCards = new Cards();

    if (decks instanceof Array == false) throw new Error("decks is not instanceof array", decks);
    if (decks.length == 0) throw new Error("Attempted to deal cards to no players!");

    // Shuffle the deck of cards.
    if (!cards.shuffle()) {
        console.error("Failed to shuffle cards, expect breakage!");
    }
    
    // If the number of cards and players aren't divisible as an integer result.
    while(cards.length / decks.length % 2 != 0) {
        // Discard a (now definitely) random card, by shifting the first element.
        let deadCard = cards.shift();
        deadCards.push(deadCard);
        
        // Update global list of dead cards.
        designatedDeadCards.push(deadCard);

        console.info(`Discarded card due to integer indivisble number of 'decks ' and 'cards' (${cards.length} / ${decks.length})`, deadCard);
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

    // Return the dead cards, if there were any.
    return deadCards;
}

// Start game.
let dealtDecks = [userDeck, cpuDeck]

dealCards(dealtDecks, createDeck());
userDeck = dealtDecks[0];
cpuDeck = dealtDecks[1];

updateView();
