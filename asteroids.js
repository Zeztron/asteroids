const FPS = 30; // 30 frames per second
const shipSize = 30; // ship height in pixels
/**@type {HTMLCanvasElement} */
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize / 2,
    a: 90 / 180 * Math.PI // convert to radians
}

// Set up the game loop
setInterval(update, 1000 / FPS)

function update() {
    // draw space
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // draw triangular ship
    context.strokeStyle = "white";
    context.lineWidth = shipSize / 20;
    context.beginPath();
    context.moveTo( // nose of the ship
        ship.x + ship.r * Math.cos(ship.a),
        ship.y - ship.r * Math.sin(ship.a)
    );
    context.lineTo( // rear left of the ship
        ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * Math.sin(ship.a) - (Math.cos(ship.a))
    );
    context.lineTo( // rear right of the ship
        ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * Math.sin(ship.a) + (Math.cos(ship.a))
    );
    context.closePath();
    context.stroke();



    // move the ship

}