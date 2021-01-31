const TOTAL = 250;

let celestialBodies = [];
let spaceships = [];
let savedSpaceships = [];
let scaleFactor = 500;
let screenTranslation;
let configuringScene = true;
let placeMode = false;
let startPosition;
let finishPosition;
let configuringCelestialBody = false;
let newCelestialBodyMass = 1;
let orbitMode = true;
let mousePosition;
let placingOption;
let newOrbitVelocity;
let spaceshipThrustVelocity = 100000;
let spaceshipMass = 10000;
let spaceshipSize = 6;
let spaceshipGeneration = 1;
let spaceshipResetDistance;
let spaceshipMinDistances = [];
const earthMass = 5.972*(10**24);
const earthDiameter = 12742;
const gravitationalConstant = 6.674*(10**-11);

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER);

  screenTranslation = createVector(0, 0);

  setBackgroundImage();
}

function draw() {
  background(10);
  image(backgroundImage, windowWidth/2, windowHeight/2);

  translate(screenTranslation.x, screenTranslation.y);
  mousePosition = createVector(mouseX-screenTranslation.x, mouseY-screenTranslation.y);

  for (let c = 0; c < celestialBodies.length; c++) {
    celestialBodies[c].display();
    if (configuringScene == false)
      celestialBodies[c].calculatePos();
  }

  if (configuringScene == false) {
    spaceshipResetDistance = p5.Vector.dist(startPosition, finishPosition) * 2;
    for (let s = 0; s < spaceships.length; s++) {
      spaceships[s].display();
      spaceships[s].think();
      spaceships[s].calculatePos();
    }
    if (spaceships.length < TOTAL/2) {
      newGeneration();
    }
    for (let n = 0; n < spaceships.length; n++) {
      if (p5.Vector.dist(spaceships[n].pos, startPosition) > spaceshipResetDistance) {
        newGeneration();
      }
    }
  }

  if (startPosition != null) {
    noFill();
    stroke(255);
    line(startPosition.x-5, startPosition.y-5, startPosition.x+5, startPosition.y+5);
    line(startPosition.x+5, startPosition.y-5, startPosition.x-5, startPosition.y+5);
    noStroke();
    fill(255);
    text("START", startPosition.x, startPosition.y - 10);
  }

  if (finishPosition != null) {
    noFill();
    stroke(255);
    ellipse(finishPosition.x, finishPosition.y, 10);
    noStroke();
    fill(255);
    text("FINISH", finishPosition.x, finishPosition.y - 10);
  }

  if (startPosition != null && finishPosition != null) {
    stroke(255, 0, 100, 100);
    line(startPosition.x, startPosition.y, finishPosition.x, finishPosition.y);
  }

  if (configuringCelestialBody == true) {
    noFill();
    stroke(0, 120, 0);
    ellipse(mousePosition.x, mousePosition.y, newCelestialBodyMass*earthDiameter/scaleFactor);
    noStroke();
    fill(255);
  }

  drawInterface();

  if (keyIsDown(65)) {
    screenTranslation.add(createVector(10, 0));
  }
  if (keyIsDown(68)) {
    screenTranslation.add(createVector(-10, 0));
  }
  if (keyIsDown(87)) {
    screenTranslation.add(createVector(0, 10));
  }
  if (keyIsDown(83)) {
    screenTranslation.add(createVector(0, -10));
  }
}

function drawInterface() {
  translate(-screenTranslation.x, -screenTranslation.y);

  text("1 pixel = " + " " + scaleFactor + "km", 100, 50);
  if (configuringScene == false) {
    text("TOTAL: " + " " + TOTAL, 100, 75);
    text("spaceships: " + " " + spaceships.length, 100, 100);
    text("thrust velocity: " + " " + spaceshipThrustVelocity + " ms/s", 100, 125);
    text("mass: " + " " + spaceshipMass + " kg", 100, 150);
    text("reset distance: " + " " + round(spaceshipResetDistance*scaleFactor) + " km", 100, 175);
    text("record distance: " + " " + round(min(spaceshipMinDistances)*scaleFactor) + " km", 100, 200);
  }
  fill(255, 255, 0);
  text("[WASD] = move camera", 100, windowHeight-30);
  text("[J] = focus on startingposition", 100,  windowHeight-50);
  text("[K] = focus on finishPosition", 100,  windowHeight-70);
  fill(255);

  stroke(255, 100, 100);
  line((windowWidth/2)-(384400/scaleFactor)/2, windowHeight-10, (windowWidth/2)+(384400/scaleFactor)/2, windowHeight-10);
  noStroke();

  if (configuringScene == false) {
    fill(0, 255, 0);
    textSize(24);
    text("TRAINING AI...", windowWidth/2, 100);
    textSize(16);
    text("GENERATION: " + spaceshipGeneration, windowWidth/2, 125);
    textSize(12);
    fill(255);
    text("PRESS [X] TO STOP TRAINING", windowWidth/2, windowHeight-50);
  }

  if (startPosition != null && finishPosition != null && configuringScene == true) {
    fill(0, 255, 0);
    textSize(16);
    text("STARTPOSITION AND FINISHPOSTION SET!", windowWidth/2, windowHeight-200);
    text("PRESS [SPACEBAR] TO START TRAINING AI", windowWidth/2, windowHeight-175);
    textSize(12);
    fill(255);
  }

  if (placeMode == true) {
    stroke(0, 120, 0);
    noFill();
    line(mousePosition.x+screenTranslation.x, 0, mousePosition.x+screenTranslation.x, windowHeight);
    line(0, mousePosition.y+screenTranslation.y, windowWidth, mousePosition.y+screenTranslation.y);
    stroke(255);
    rect(windowWidth/2, 75, 300, 100);
    noStroke();
    fill(255);
    text("1: PLACE START POSITION [REQUIRED]", windowWidth/2, 50);
    text("2: PLACE FINISH POSITION [REQUIRED]", windowWidth/2, 75);
    text("3: PLACE CELESTIAL BODY", windowWidth/2, 100);
    text("PRESS [LMB] TO PLACE OBJECT", windowWidth/2, windowHeight-50);
    fill(0, 255, 0);
    if (configuringCelestialBody == true) {
      text("ORBITMODE: " + orbitMode, mousePosition.x+screenTranslation.x+90, mousePosition.y+screenTranslation.y-100);
      text("DENSITY: 1 EARTH", mousePosition.x+screenTranslation.x+90, mousePosition.y+screenTranslation.y-70);
      text("MASS: " + round(newCelestialBodyMass*10000)/10000 + " EARTH", mousePosition.x+screenTranslation.x+90, mousePosition.y+screenTranslation.y-40);
    } else {}
    if (placingOption != null)
      text("PLACE: " + placingOption, mousePosition.x+screenTranslation.x+90, mousePosition.y+screenTranslation.y-10);
    fill(255);
    if (configuringCelestialBody == true) {
      text("USE MOUSEWHEEL TO CHANGE MASS", windowWidth/2, windowHeight-75);
      text("PRESS [B] TO TOGGLE ORBIT MODE", windowWidth/2, windowHeight-100);
      if (celestialBodies.length > 0 && orbitMode == true) {
        let distances = [];

        for (let c = 0; c < celestialBodies.length; c++) {
          distances.push(p5.Vector.dist(createVector(mouseX, mouseY), p5.Vector.add(celestialBodies[c].pos, screenTranslation)));
        }
        let minDistance = min(distances);

        for (let b = 0; b < celestialBodies.length; b++) {
          if (p5.Vector.dist(createVector(mouseX, mouseY), p5.Vector.add(celestialBodies[b].pos, screenTranslation)) == minDistance) {
            if (celestialBodies[b].mass >= newCelestialBodyMass*earthMass) {
              stroke(255);
              noFill();
              line(mouseX, mouseY, celestialBodies[b].pos.x+screenTranslation.x, celestialBodies[b].pos.y+screenTranslation.y)
              ellipse(celestialBodies[b].pos.x+screenTranslation.x, celestialBodies[b].pos.y+screenTranslation.y, minDistance*2);
              noStroke();

              let speedUnitVector = createVector(-(celestialBodies[b].pos.y-mouseY), celestialBodies[b].pos.x-mouseX).normalize();
              let velocityScalar = sqrt((gravitationalConstant*celestialBodies[b].mass) / (minDistance*scaleFactor*1000))*1000;
              newOrbitVelocity = createVector(velocityScalar * speedUnitVector.x, velocityScalar * speedUnitVector.y);
            }
          }
        }
      }
    }
  } else {
    if (configuringScene == true) {
      fill(255);
      text("PRESS [E] TO CONFIGURE SCENE", windowWidth/2, windowHeight-50);
    }
  }

  translate(screenTranslation.x, screenTranslation.y);
}

function setBackgroundImage() {
  backgroundImage = createImage(windowWidth, windowHeight);;

  for (let x = 0; x < backgroundImage.width; x++) {
    for (let y = 0; y < backgroundImage.height; y++) {
      backgroundImage.set(x, y, noise(x/500, y/500)*random(5, 15));
    }
  }

  for (let j = 0; j < 400; j++) {
    backgroundImage.set(random(backgroundImage.width), random(backgroundImage.height), random(100, 255));
  }
  backgroundImage.updatePixels();
}

function newGeneration() {
  for (let b = 0; b < celestialBodies.length; b++) {
    celestialBodies[b].reset();
  }
  for (let k = 0; k < spaceships.length; k++) {
    savedSpaceships.push(spaceships[k]);
  }
  spaceships = [];
  let newMinDistance = min(spaceshipMinDistances);
  spaceshipMinDistances = [];
  spaceshipMinDistances.push(newMinDistance);
  nextGeneration();
}

function placeCelestialbody(x, y, vx, vy, m, d) {
  newCelestialbody = new Celestialbody(x, y, vx, vy, m, d);
  celestialBodies.push(newCelestialbody);
  placeMode = false;
}

function keyPressed() {
  if (keyCode == (69) && configuringScene == true) {
    placeMode = !placeMode;
    placingOption = null;
    configuringCelestialBody = false;
  }
  if (keyCode == (88) && configuringScene == false) {
    configuringScene = true;
    for (let b = 0; b < celestialBodies.length; b++) {
      celestialBodies[b].reset();
    }
    spaceships = [];
    savedSpaceships = [];
    spaceshipMinDistances = [];
    spaceshipGeneration = 1;
  }
  if (keyCode == (32) && startPosition != null && finishPosition != null && configuringScene == true) {
    configuringScene = false;
    placeMode = false;
    configuringCelestialBody = false;
    for (let i = 0; i < TOTAL; i++) {
      spaceships[i] = new Spaceship(startPosition.x, startPosition.y, spaceshipThrustVelocity, spaceshipMass, spaceshipSize)
    }
  }
  if (keyCode == (74) && startPosition != null)
    screenTranslation.add(p5.Vector.sub(p5.Vector.sub(createVector(windowWidth/2, windowHeight/2), screenTranslation), startPosition));
  if (keyCode == (75) && finishPosition != null)
    screenTranslation.add(p5.Vector.sub(p5.Vector.sub(createVector(windowWidth/2, windowHeight/2), screenTranslation), finishPosition));
  if (placeMode == true) {
    if (keyCode == (49)) {
      placingOption = "STARTPOSITION";
      configuringCelestialBody = false;
    }
    if (keyCode == (50)) {
      placingOption = "FINISHPOSITION";
      configuringCelestialBody = false;
    }
    if (keyCode == (51)) {
      placingOption = "CELESTIALBODY";
      configuringCelestialBody = true;
      newCelestialBodyMass = 1;
    }
    if (keyCode == (66) && configuringCelestialBody) {
      orbitMode = !orbitMode;
    }
  }
}

function mouseClicked() {
  if (placeMode == true && placingOption != null) {
    if (placingOption == "STARTPOSITION") {
      startPosition = mousePosition;
    }
    if (placingOption == "FINISHPOSITION") {
      finishPosition = mousePosition;
    }
    if (placingOption == "CELESTIALBODY") {
      configuringCelestialBody = false;
      let newCelestialBodyVel;
      if (orbitMode == true && celestialBodies.length > 0) {
        newCelestialBodyVel = newOrbitVelocity;
      } else {
        newCelestialBodyVel = createVector(0, 0);
      }
      placeCelestialbody(mousePosition.x, mousePosition.y, newCelestialBodyVel.x, newCelestialBodyVel.y, newCelestialBodyMass*earthMass, newCelestialBodyMass*earthDiameter);
    }
    placeMode = false;
  }
}

function mouseWheel(event) {
  if (configuringCelestialBody) {
    if (event.delta < 0)
      newCelestialBodyMass *= 1.1;
    else
      newCelestialBodyMass /= 1.1;
  }
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
   background(0);
}

class Spaceship {
  constructor(x, y, vf, m, s, b) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.velForward = vf;
    this.velUnit = createVector(0, 0);
    this.mass = m;
    this.size = s;
    this.acc = createVector(0, 0);
    this.force = createVector(0, 0);
    this.forces = [];

    this.distancesToFinish = [];
    this.minDistanceToFinish = 0;

    if (b) {
      this.brain = b.copy();
    } else {
      this.brain = new NeuralNetwork(4, 4, 2);
    }
  }

  think() {
    let input = [];
    input[0] = this.pos.x;
    input[1] = this.pos.y;
    input[2] = finishPosition.x;
    input[3] = finishPosition.y;

    let output = this.brain.predict(input);
    this.velUnit = createVector((output[0]*2)-1, (output[1]*2)-1).normalize();
  }

  mutate() {
    this.brain.mutate(0.01);
  }

  calculatePos() {
    this.distancesToFinish.push(p5.Vector.dist(this.pos, finishPosition));
    this.minDistanceToFinish = min(this.distancesToFinish);
    spaceshipMinDistances.push(this.minDistanceToFinish);

    let combinedForces = createVector(0, 0);
    for (let f = 0; f < this.forces.length; f++) {
      combinedForces.add(this.forces[f]);
    }

    this.force = combinedForces;
    this.acc = (p5.Vector.div(this.force, this.mass)); // m/s^2
    this.vel.add(p5.Vector.add(p5.Vector.mult(this.acc, 1000000), p5.Vector.mult(this.velUnit, this.velForward))); // m/s
    this.pos.add(p5.Vector.div(p5.Vector.div(this.vel, 1000), scaleFactor)); // pixels/s

    if (celestialBodies.length >= 1) {
      for (let t = 0; t < celestialBodies.length; t++) {
        let distance = p5.Vector.dist(celestialBodies[t].pos, this.pos) * scaleFactor * 1000;
        if (distance/1000 <= celestialBodies[t].diameter/2 + this.size*scaleFactor) {
          spaceships.splice(spaceships.indexOf(this), 1);
        }

        let gravitionalForce = ((gravitationalConstant * this.mass * celestialBodies[t].mass) / sq(distance));

        let vectorb = p5.Vector.sub(this.pos, celestialBodies[t].pos);
        let unitDir = createVector(-vectorb.x/sqrt(sq(vectorb.x)+sq(vectorb.y)), -vectorb.y/sqrt(sq(vectorb.x)+sq(vectorb.y)));

        let newForce = unitDir.mult(gravitionalForce);

        this.forces[t] = newForce;
      }
    }
  }

  display() {
    let unitDirection = createVector(this.vel.x - this.pos.x, this.vel.y - this.pos.y).normalize();
    unitDirection.mult(this.size);
    stroke(255);
    noFill();
    triangle(this.pos.x-unitDirection.x - unitDirection.y, this.pos.y-unitDirection.y + unitDirection.x, this.pos.x+unitDirection.x, this.pos.y + unitDirection.y, this.pos.x-unitDirection.x + unitDirection.y, this.pos.y-unitDirection.y - unitDirection.x);
    line(this.pos.x-unitDirection.x, this.pos.y-unitDirection.y, this.pos.x+unitDirection.x, this.pos.y+unitDirection.y);
    noStroke();
  }
}

class Celestialbody {
  constructor(x, y, vx, vy, m, d) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.mass = m;
    this.diameter = d;
    this.acc = createVector(0, 0);
    this.force = createVector(0, 0);
    this.forces = [];
    this.beginPos = createVector(x, y);
    this.beginVel = createVector(vx, vy);
  }

  calculatePos() {
    let combinedForces = createVector(0, 0);
    for (let f = 0; f < this.forces.length; f++) {
      combinedForces.add(this.forces[f]);
    }

    this.force = combinedForces;
    this.acc = (p5.Vector.div(this.force, this.mass)); // m/s^2
    this.vel.add(p5.Vector.mult(this.acc, 1000000)); // m/s
    this.pos.add(p5.Vector.div(p5.Vector.div(this.vel, 1000), scaleFactor)); // pixels/s

    if (celestialBodies.length >= 2) {
      for (let t = 0; t < celestialBodies.length; t++) {
        if (this != celestialBodies[t]) {
          if (p5.Vector.dist(celestialBodies[t].pos, this.pos) > ((this.diameter/scaleFactor)/2) + ((celestialBodies[t].diameter/scaleFactor/2))) {
            let distance = p5.Vector.dist(celestialBodies[t].pos, this.pos) * scaleFactor * 1000;
            let gravitionalForce = ((gravitationalConstant * this.mass * celestialBodies[t].mass) / sq(distance));

            let vectorb = p5.Vector.sub(this.pos, celestialBodies[t].pos);
            let unitDir = createVector(-vectorb.x/sqrt(sq(vectorb.x)+sq(vectorb.y)), -vectorb.y/sqrt(sq(vectorb.x)+sq(vectorb.y)));

            let newForce = unitDir.mult(gravitionalForce);

            this.forces[t] = newForce;
          }
        }
      }
    }
  }

  reset() {
    this.pos = this.beginPos.copy();
    this.vel = this.beginVel.copy();
  }

  display() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.diameter/scaleFactor);
    stroke(255);
    noFill();
    noStroke();
    fill(255);
  }
}
