const FPS = 30; // 30 frames per second
const friction = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const laserMax = 10; // max number of lazers on screen at once
const laserSpeed = 500; // 500 pixels per second
const laserDistance = 0.6; // max distance laser can travel as fraction of screen width
const roidsNum = 3; // Starting number of asteroids
const roidsSize = 100; // starting size of asteriods in pixel
const roidsSpeed = 50; // max starting speed in px/sec
const roidsVert = 10; // average number of vertices on each asteroid
const roidsJag = 0.5; // jaggedness of the asteroids (0 = none, 1 = lots)
const shipExplodeDuration = 0.3; // duration of the ship's explosion
const shipInvulnerabilityDuration = 3; // duration of the ship's invulnerability
const shipBlinkDuration = 0.1; // duration of the ship's blink
const shipSize = 30; // ship height in pixels
const shipThrust = 5; // acceleration of the ship in px/sec
const turnSpeed = 360; // 360 degrees per second
const showBounding = false; // show or hide collision bounding
const showCenterDot = false; // show or hide ship's center dot
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

// Set up the ship
var ship = newShip();

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

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExplodeDuration * FPS);
}

function keyDown(/** @type { KeyboardEvent } */ ev) {
    switch(ev.keyCode) {
        case 32: // space bar (shoot the lazer)
            shootLaser();
            break;

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
        case 32: // space bad (allow shooting again)
            ship.canShoot = true;
            break;

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

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: shipSize / 2,
        a: 90 / 180 * Math.PI, // convert to radians
        blinkTime: Math.ceil(shipBlinkDuration * FPS),
        blinkNumber: Math.ceil(shipInvulnerabilityDuration / shipBlinkDuration),
        canShoot: true,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    // create the laser object
    if(ship.canShoot && ship.lasers.length < laserMax) {
        ship.lasers.push({ // from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / FPS,
            yv: -laserSpeed * Math.sin(ship.a) / FPS,
            dist: 0
        })
    }
    // prevent further shooting
    ship.canShoot = false;
}

function update() {
    var blinkOn = ship.blinkNumber % 2 == 0;
    var exploding = ship.explodeTime > 0;
    // draw space
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

        // draw the thruster
        if(!exploding && blinkOn) {
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
        }

    } else {
        ship.thrust.x -= friction * ship.thrust.x / FPS;
        ship.thrust.y -= friction * ship.thrust.y / FPS;
    }

    // draw triangular ship if not exploding
    if(!exploding) {
        if(blinkOn) {
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
        }
        // handle blinking
        if(ship.blinkNumber > 0) {
            //reduce the blink time
            ship.blinkTime--;
            // reduce the blink num
            if(ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(shipBlinkDuration * FPS);
                ship.blinkNumber--;
            }
        }
    } else {
        // draw the explosion
        context.fillStyle = "darkred";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "red";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "orange";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "yellow";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = "white";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        context.fill();
    }

    if(showBounding) {
        context.strokeStyle = "lime";
        context.beginPath();
        context.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        context.stroke();
    }

    // Draw the asteroids
    var x, y, r, a, vert, offset;
    for (var i = 0; i < asteroids.length; i++) {
        context.strokeStyle = "slategrey";
        context.lineWidth = shipSize / 20;
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

        if(showBounding) {
            context.strokeStyle = "lime";
            context.beginPath();
            context.arc(x, y, r, 0, Math.PI * 2, false);
            context.stroke();
        }
    }

    // center dot
    if (showCenterDot) {
        context.fillStyle = "red";
        context.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // draw the lasers
    for(var i = 0; i < ship.lasers.length; i++) {
        context.fillStyle = "salmon";
        context.beginPath();
        context.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
        context.fill();
    }
    // check for asteroid collision (when not exploding)
    if(!exploding) {
        if(ship.blinkNumber == 0) {
            // check for asteroid collisions
            for(var i = 0; i < asteroids.length; i++) {
                if(distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                }
            }
        }

        // rotate the ship
        ship.a += ship.rot;

        // move the ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;
        if(ship.explodeTime == 0) {
            ship = newShip();
        }
    }

    // move the lasers
    for(var i = ship.lasers.length - 1; i >= 0; i--) {
        // check distance travelled
        if(ship.lasers[i].dist > laserDistance * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }
        // move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        // calculate the distance travelled
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));

        // hendle edge of screen
        if(ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if(ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }

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

    // move the asteroids
    for(var i = 0; i < asteroids.length; i++) {
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
}