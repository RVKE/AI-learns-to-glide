function nextGeneration() {

  spaceshipGeneration += 1;
  for (let i = 0; i < TOTAL; i++) {
    spaceships.push(pickSpaceship());
  }
  savedSpaceships = [];
}

function pickSpaceship() {
  let spaceship;
  let minDistancesToFinish = [];

  for (let h = 0; h < savedSpaceships.length; h++) {
    minDistancesToFinish.push(savedSpaceships[h].minDistanceToFinish);
  }
  for (let j = 0; j < savedSpaceships.length; j++) {
    if (min(minDistancesToFinish) == savedSpaceships[j].minDistanceToFinish) {
      spaceship = savedSpaceships[j];
    }
  }

  let newSpaceship = new Spaceship(startPosition.x, startPosition.y, spaceshipThrustVelocity, spaceshipMass, spaceshipSize, spaceship.brain);
  newSpaceship.mutate();
  return newSpaceship;
}
