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
                        // console.log("Item map missing, mapping item from this.items", item);
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

        // Delete spliced items from the items map.
        for (let splicedItem of splicedItems) {
            this.itemsMap.delete(splicedItem.id);
        }

        // Map any new inserted entries.
        this.updateMap();

        return splicedItems;
    }

    /**
     * Return last item in list (easy shorthand).
     */
    get lastItem() {
        let retv = null

        if (this.items.length > 0) retv = this.items[this.items.length -1];

        return retv;
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