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