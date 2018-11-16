const FPS = 30; // 30 frames per second
const friction = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const roidsNum = 10; // Starting number of asteroids
const roidsSize = 100; // starting size of asteriods in pixel
const roidsSpeed = 50; // max starting speed in px/sec
const roidsVert = 10; // average number of vertices on each asteroid
const roidsJag = 0.5; // jaggedness of the asteroids (0 = none, 1 = lots)
const shipSize = 30; // ship height in pixels
const shipThrust = 5; // acceleration of the ship in px/sec
const turnSpeed = 360; // 360 degrees per second
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

// Set up the ship
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: shipSize / 2,
    a: 90 / 180 * Math.PI, // convert to radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// Set up the asteriods
var asteroids = [];
createAsteroidBelt();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Set up the game loop
setInterval(update, 1000 / FPS);

// Create the asteroid belt
function createAsteroidBelt() {
    asteroids = [];
    var x, y;
    for (var i = 0; i < roidsNum; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);

        } while (distBetweenPoints(ship.x, ship.y, x, y) < roidsSize * 2 + ship.r);
            asteroids.push(newAsteroid(x, y));
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function keyDown(/** @type { KeyboardEvent } */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (rotate ship left)
            ship.rot = turnSpeed / 180 * Math.PI / FPS;
            break;


        case 38: // up arrow (throttle forward)
            ship.thrusting = true;
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
            ship.thrusting = false;
            break;


        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
    }
}

function newAsteroid(x, y) {
    var asteroid = {
        x: x,
        y: y,
        xv: Math.random() * roidsSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * roidsSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: roidsSize / 2,
        a: Math.random() * Math.PI * 2, // in radians
        vert: Math.floor(Math.random() * (roidsVert + 1) + roidsVert / 2),
        offset: []
    };

    // create the vertex offset array
    for(var i = 0; i < asteroid.vert; i++) {
        asteroid.offset.push(Math.random() * roidsJag * 2 + 1 - roidsJag);
    }

    return asteroid;
}

function update() {
    // draw space
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;
        // draw the thruster
        context.fillStyle = "red";
        context.strokeStyle = "yellow";
        context.lineWidth = shipSize / 10;
        context.beginPath();
        context.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        context.lineTo( // rear center behind the ship
            ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
        );
        context.lineTo( // rear right of the ship
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        context.closePath();
        context.fill();
        context.stroke();

    } else {
        ship.thrust.x -= friction * ship.thrust.x / FPS;
        ship.thrust.y -= friction * ship.thrust.y / FPS;
    }

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

    // Draw the asteroids
    context.strokeStyle = "slategrey";
    context.lineWidth = shipSize / 20;
    var x, y, r, a, vert, offset;
    for (var i = 0; i < asteroids.length; i++) {
        //get the asteroid properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offset = asteroids[i].offset;
        // Draw a path
        context.beginPath();
        context.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        );
        // draw the polygon
        for(var j = 1; j < vert; j++) {
            context.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        context.closePath();
        context.stroke();
        // move the asteroid
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        // so they dont float off in space
        if(asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if(asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r
        }
        if(asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.width + asteroids[i].r;
        } else if(asteroids[i].y > canvas.width + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r
        }
    }

    // rotate the ship
    ship.a += ship.rot;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // handle the edge of the screen
    if(ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if(ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }
}