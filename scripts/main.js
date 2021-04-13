// Model
let deck = [];
let 


// View
function updateView() {
    document.getElementById("app").innerHTML = `
        <div class="board">
        <div class="board-top-part">
            <div id="draw-deck" class="card-slot"></div>
            <div id="draw-deck-display" class="card-slot"></div>
            <div class="card-gap"></div>
            <div id="solution-slot1" class="card-slot"></div>
            <div id="solution-slot2" class="card-slot"></div>
            <div id="solution-slot3" class="card-slot"></div>
            <div id="solution-slot4" class="card-slot"></div>
        </div>
        <div class="board-spacer"></div>
        <div class="board-bottom-part">
            <div id="unsolved-slot1" class="card-slot"></div>
            <div id="unsolved-slot2" class="card-slot"></div>
            <div id="unsolved-slot3" class="card-slot"></div>
            <div id="unsolved-slot4" class="card-slot"></div>
            <div id="unsolved-slot5" class="card-slot"></div>
            <div id="unsolved-slot6" class="card-slot"></div>
            <div id="unsolved-slot7" class="card-slot"></div>
        </div>
        </div>
    `;
}

// Controller


updateView();