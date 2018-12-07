function Game(id) {
    this.brakerScreen = [];
    this.makerScreen = [];
    this.currentPin = 0;
    this.nextPin = true;

    this.createBrakerScreen = function () {
        let pinElements = document.getElementsByClassName('pin');
        for (let i = pinElements.length - 1; i >= 4; i--) {
            this.brakerScreen.push(pinElements[i]);
        }
    };
    this.createBrakerScreen();

    this.createMakerScreen = function () {
        let pinElements = document.getElementsByClassName('pin');
        for (let i = 3; i >= 0; i--) {
            this.makerScreen.push(pinElements[i]);
        }
    };
    this.createMakerScreen();

    this.getCurrentPinElement = function() {
        return this.brakerScreen[this.currentPin];
    };

    this.incrCurrentPin = function() {
        if ((this.currentPin + 1) % 4 === 0) {
            this.nextPin = false;
            this.currentPin += 1;
        } else {
            this.currentPin += 1;
        }
    };

    this.setNextPin = function(bool) {
        this.nextPin = bool;
    };

    this.setColorCurrentPin = function(color) {
        if (game.nextPin) {
            let pinElement = this.getCurrentPinElement();
            pinElement.classList.add(color);
            game.incrCurrentPin();
        }
    };
}

function colorClickEvent(event) {
    let color = event.srcElement.classList[1];
    game.setColorCurrentPin(color);
}

function exitClickEvent(event) {
    alert("Do you really want to close this game? It's so much fun!");
}

function randomClickEvent(event) {
    let colors = ["red", "yellow", "blue", "green", "gray", "purple", "black", "orange"];
    for (let i = 0; i < 4; i++) {
        // TODO: set colors index to random value between 0 and 7
        game.setColorCurrentPin(Math.floor(Math.random()*7));
    }       
}

function checkClickEvent(event) {
    game.setNextPin(true);
}

function clearClickEvent(event) {
    // TODO: clears colors in current row
}

var game = new Game(0);
