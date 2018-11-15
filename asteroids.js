const FPS = 30; // 30 frames per second
const shipSize = 30; // ship height in pixels
const turnSpeed = 360; // 360 degrees per second
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize / 2,
    a: 90 / 180 * Math.PI, // convert to radians
    rot: 0
}

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Set up the game loop
setInterval(update, 1000 / FPS)

function keyDown(/** @type { KeyboardEvent } */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (rotate ship left)
            ship.rot = turnSpeed / 180 * Math.PI / FPS;
            break;


        case 38: // up arrow (throttle forward)
            break;


        case 39: // right arrow (rotate ship right)
            ship.rot = -turnSpeed / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type { KeyboardEvent } */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (stop rotating left)
            ship.rot = 0;
            break;


        case 38: // up arrow (stop thrusting)
            break;


        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
    }
}

function update() {
    // draw space
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // draw triangular ship
    context.strokeStyle = "white";
    context.lineWidth = shipSize / 20;
    context.beginPath();
    context.moveTo( // nose of the ship
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    context.lineTo( // rear left of the ship
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - (Math.cos(ship.a)))
    );
    context.lineTo( // rear right of the ship
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + (Math.cos(ship.a)))
    );
    context.closePath();
    context.stroke();
    // rotate the ship
    ship.a += ship.rot;

    // move the ship

    // Draw the center dot
    context.fillStyle = "red";
    context.fillRect(ship.x - 1, ship.y - 1, 2, 2);

}