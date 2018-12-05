function Game(id) {
    this.id = id;
    this.pinlines = [];
    this.currentPinLine = 0;
    
    this.getCurrentPinline = function() {
        return this.currentPinLine;
    }

    this.increaseCurrentPinline = function() {
        this.currentPinLine += 1;
    }

    function(HTMLArray) {
        for (let i = 1; i < HTMLArray.length; i++) {
            let pinline = new Pinline(HTMLArray[i]);
            this.pinlines
            
        }
        let pinlineString = ".line-" + this.currentPinLine;
        let pinline = document.querySelector(pinelineString);
        this.pinlines[this.currentPinLine] = pineline;
    }
}

function Pinline(line) {
    this.pins = [];
    this.isUsed = false;

    this.createPinline = function() {
        // TODO
    }
    this.setColorFirstPin = function() {
        // TODO
    }    
}

function Pin(element) {
    this.number = number;
    this.color = null;
    this.element = null;

    this.setColor = function(color) {
        this.color = color;
    }
    this.setElement = function() {
    }
}

// Game is started
var currentGame = new Game(1);

// Add event listeners to colors in control panel
currentGame.createBrakerScreen(document.querySelectorAll(".braker-screen"));
