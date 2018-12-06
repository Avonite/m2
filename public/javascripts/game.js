function Game(id) {
    // Unique identifier for each game. 
    this.id = id;
    // This array holds all pinlines in the braker field.
    this.pinlinesBraker = [];
    // This array holds the pins in the maker field.
    this.pinlineMaker = [];
    // Current pinline during playing of the game, starting at the bottom. 
    this.currentPinLine = 0;
    // Current pin within the pinline, counting from left to right
    this.currentPin = 0;

    // Fills pinlinesBraker with Pinline objects; represents braker-screen
    this.createPinlinesBraker = function() {
        let HTMLPinlines = document.getElementsByClassName("pin-line");
        for (let i = 1; i < HTMLPinlines.length; i++) {
            let pinline = new Pinline(HTMLPinlines[i].getElementsByClassName("pin"));
            this.pinlinesBraker.push(pinline);
        }
    };
    this.createPinlinesBraker();

    // Fills pinlineMaker with Pinline objects; represents maker-screen
    this.createPinlineMaker = function() {
        // Get elements with classname "pin"
        let HTMLPinline = document.getElementsByClassName("pin-line")[0].getElementsByClassName("pin");
        this.pinlineMaker = new Pinline(HTMLPinline);
    };
    this.createPinlineMaker();

    // Returns current pin element;
    this.getCurrentPin = function() {
        let line = this.pinlinesBraker[this.currentPinLine];
        console.log(line);
        let pinsArr = line.pins;
        let pin = pinsArr[this.currentPin].element;
        return pin;
    };

    // Increases currentPin by 1 
    this.increaseCurrentPin = function () {
        if (this.currentPin == 3) {
            this.currentPinLine += 1;
            this.currentPin = 0;
        } else {
            this.currentPin += 1;
        }        
    };
}

function Pinline(line) {
    this.pins = [];
    this.isUsed = false;

    // Saves pin objects in array pins
    this.createPinline = function(line) {
        for (let i = 0; i < line.length; i++) {
            let pin =  new Pin(line[i]);
            this.pins.push(pin);
        }
    };
    this.createPinline(line);  

    // Get pins array
    this.getPins = function () {
        return this.pins;
    };
}

function Pin(element) {
    this.color = null;
    this.element = element;

    this.setColor = function(color) {
        this.color = color;
    };

    this.getColor = function() {
        return this.color;
    };

    this.getElement = function() {
        return this.element;
    };
}

function colorClickEvent(event) {
    // Get current div element
    let pinElement = currentGame.getCurrentPin();   
    // Get color
    let color = event.srcElement.classList[1];
    // Add color to div element
    pinElement.classList.add(color);
    currentGame.increaseCurrentPin();
}

// Game is started
var currentGame = new Game(1);