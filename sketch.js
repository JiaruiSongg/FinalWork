let shapes = [];
let stars = [];
let sunElement = null; // Reference for the sun
let moonElement = null; // Reference for the moon
let animationStarted = false; // Prevents multiple animations from starting at once
let starsAnimating = false; // Prevents multiple star animations from starting at once
let intervalId = null; // Store setInterval ID for star movement
let angle = 0
// setup() function
function setup() {
  createCanvas(800, 600);
  noLoop(); // Initial rendering will not loop until animation is triggered

  // Create the sky gradient
  for (let y = 0; y < height / 2; y += 10) {
    let skyColor = lerpColor(color(25, 60, 150), color(255, 190, 120), y / (height / 2));
    shapes.push(new BauhausRect(0, y, width, 10, skyColor)); // Sky layers
  }

  // Create the water gradient
  for (let y = height / 2; y < height; y += 10) {
    let waterColor = lerpColor(color(255, 150, 100), color(0, 100, 150), (y - height / 2) / (height / 2));
    shapes.push(new BauhausRect(0, y, width, 10, waterColor)); // Water layers
  }

  // Create the building
  shapes.push(new BauhausRect(220, 80, 30, 100, color(0, 0, 0))); // Left part
  shapes.push(new BauhausRect(210, 120, 50, 80, color(20, 10, 60))); // Middle part
  shapes.push(new BauhausRect(190, 180, 300, 120, color(50, 30, 80))); // Right part

  // Add building reflections
  shapes.push(new BauhausRect(220, 300, 80, 200, color(0, 0, 0, 80))); // Top reflection
  shapes.push(new BauhausRect(230, 450, 50, 80, color(20, 10, 60, 80))); // Middle reflection
  shapes.push(new BauhausRect(250, 500, 30, 60, color(150, 30, 80, 80))); // Bottom reflection

  // Add the clouds
  shapes.push(new BauhausCloud(100, 70, 90, 200));
  shapes.push(new BauhausCloud(300, 50, 120, 230));
  shapes.push(new BauhausCloud(500, 100, 100, 180));
  shapes.push(new BauhausCloud(650, 80, 130, 200));
  shapes.push(new BauhausCloud(750, 120, 85, 220));

  // Add the sun
  sunElement = new BauhausCircle(600, 100, 80, color(255, 200, 50, 180)); // Sun with initial color
  shapes.push(sunElement);

  // Create Dark Mode Button
  let darkModeButton = createButton("Dark Mode");
  darkModeButton.position(10, 620); // Position the button below the canvas
  darkModeButton.mousePressed(startDarkModeAnimation); // Attach the animation function

  // Create Draw Stars Button
  let drawStarsButton = createButton("Draw Stars");
  drawStarsButton.position(100, 620);
  drawStarsButton.mousePressed(drawStars);

  // Create Stars Move Button
  let starsMoveButton = createButton("Stars Move");
  starsMoveButton.position(200, 620);
  starsMoveButton.mousePressed(startStarMovement);

 // Create Clear Stars Button
let clearStarsButton = createButton("Clear Stars");
clearStarsButton.position(300, 620);
clearStarsButton.mousePressed(clearStars);
}

// draw() function
function draw() {
  background(255); // Set white background
  for (let shape of shapes) {
    shape.draw();
    if (shape instanceof BauhausCloud) {
      shape.move(); // Clouds move each frame
    }
  }
  for (let star of stars) {
    star.draw();
  }
}

// Function to start dark mode animation
function startDarkModeAnimation() {
  if (animationStarted) return; // Prevents multiple triggers
  animationStarted = true;

  let startTime = millis(); // Start time for animation
  let duration = 5000; // Animation duration (5 seconds)

  function animate() {
    let elapsedTime = millis() - startTime;
    let progress = constrain(elapsedTime / duration, 0, 1); // Progress from 0 to 1

    // Gradually darken the sky and water based on original color
    for (let i = 0; i < height / 2 / 10; i++) {
      let originalColor = shapes[i].color;
      let darkColor = lerpColor(originalColor, color(0, 0, 50), progress); // Darken sky gradually
      shapes[i].color = darkColor;
    }

    for (let i = height / 2 / 10; i < height / 10; i++) {
      let originalColor = shapes[i].color;
      let darkColor = lerpColor(originalColor, color(30, 30, 80), progress); // Darken reflections gradually
      shapes[i].color = darkColor;
    }

    // Move the sun and gradually make it disappear
    sunElement.x += (200 - sunElement.x) * progress; // Sun moves to the right
    sunElement.y += (500 - sunElement.y) * progress; // Sun moves down
    sunElement.color = lerpColor(color(255, 200, 50, 180), color(0, 0, 0, 0), progress); // Sun fades out

    // Introduce the moon when the sun is fully gone
    if (progress === 1 && !moonElement) {
      moonElement = new BauhausCircle(600, 100, 60, color(255)); // Moon appears
      shapes.push(moonElement);
      applyLayeredDarkMode();
    }

    // Gradually fade out clouds
    for (let shape of shapes) {
      if (shape instanceof BauhausCloud) {
        shape.color.setAlpha(255 * (1 - progress)); // Clouds fade out
      }
    }

    if (progress < 1) {
      requestAnimationFrame(animate); // Continue animation
    } else {
      animationStarted = false; // Reset flag after animation ends
    }
    draw(); // Redraw the canvas each frame
  }

  animate(); // Start the animation
}

// Function to apply a layered dark mode effect after the moon appears
function applyLayeredDarkMode() {
  // Adjust sky gradient after dark mode
  for (let y = 0; y < height / 2; y += 10) {
    let skyColor = lerpColor(color(0, 0, 50), color(25, 60, 150), y / (height / 2));
    shapes[y / 10].color = skyColor; // Update sky layers to maintain Bauhaus style
  }

  // Adjust water gradient after dark mode
  for (let y = height / 2; y < height; y += 10) {
    let waterColor = lerpColor(color(30, 30, 80), color(0, 100, 150), (y - height / 2) / (height / 2));
    shapes[y / 10].color = waterColor; // Update water layers to maintain Bauhaus style
  }

  draw(); // Redraw the canvas to reflect the new changes
}
// Function to draw stars in the sky
function drawStars() {
   // If stars already exist, do not create more
   if (stars.length > 0) {
    return;
  }
  stars = []; // Clear previous stars
  for (let i = 0; i < 1000; i++) {
    let angle = random(TWO_PI); // Random initial angle for each star
    let radius = random(100, 600); // Increase radius range to double the original (50 to 300 -> 100 to 600)

    // Calculate the initial position of each star based on the angle and radius
    let x = moonElement.x + radius * cos(angle);
    let y = moonElement.y + radius * sin(angle);

    let star = new BauhausCircle(x, y, 2, color(255, 255, 255)); // Create a star
    star.angle = angle; // Store the initial angle for the star
    star.radius = radius; // Store the radius (distance to the moon) for the star

    // Add a property to determine if the star will draw a line
    star.shouldDrawLine = random() < 0.5; // 50% chance of drawing a line

    stars.push(star); // Add the star to the array
  }
  draw(); // Redraw the canvas to display the stars
}


// Function to start star movement around the moon
function startStarMovement() {
  if (starsAnimating || !moonElement) return; // Prevent multiple animations or if the moon does not exist

  starsAnimating = true;

  // Clear any existing lines from the previous animations
  shapes = shapes.filter(shape => !(shape instanceof BauhausLine));

  // Reinitialize angle and position for all stars to avoid erratic behavior
  for (let star of stars) {
    star.angle = random(TWO_PI); // Assign a new random angle to start
    star.radius = random(100, 600); // Set a new random radius for the distance from the moon
    // Calculate new initial position based on updated angle and radius
    star.x = moonElement.x + star.radius * cos(star.angle);
    star.y = moonElement.y + star.radius * sin(star.angle);
  }

  intervalId = setInterval(() => {
    let centerX = moonElement.x; // Moon's center X coordinate
    let centerY = moonElement.y; // Moon's center Y coordinate

    // Update the global rotation angle
    angle += Math.PI / 360; // Rotate by 0.5 degrees each time to make the movement smoother

    for (let star of stars) {
      // Calculate the new X and Y positions based on the moon's center and the star's initial angle and radius
      let newX = centerX + star.radius * cos(star.angle + angle);
      let newY = centerY + star.radius * sin(star.angle + angle);

      // Draw a line from the last position to the new position only if shouldDrawLine is true
      if (star.shouldDrawLine) {
        let line = new BauhausLine(star.x, star.y, newX - star.x, newY - star.y, color(200, 200, 255, 100));
        line.strokeWeightValue = 1; // Set line thickness to 1
        shapes.push(line); // Add the line to the shapes array for drawing
      }

      // Update the star's new position
      star.x = newX;
      star.y = newY;
    }

    draw(); // Redraw the canvas to reflect changes
  }, 20); // Rotate every 20 milliseconds to make the movement smoother

  // Stop the star movement animation after 10 seconds
  setTimeout(stopStarMovement, 10000);
}



// Function to clear all stars, lines, and reset the entire canvas to its initial state
function clearStars() {
  // Stop the animation and clear the stars array and lines
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  stars = [];
  shapes = []; // Clear all shapes to reset the canvas
  sunElement = null;
  moonElement = null;
  animationStarted = false;
  starsAnimating = false;
  angle = 0;

  setup(); // Reinitialize the canvas by calling setup again to draw the initial scene
  draw();  // Redraw the canvas to reflect the initial setup
}


// Base classes
class BauhausShape {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

// Class representing a rectangle shape in Bauhaus style
class BauhausRect extends BauhausShape {
  constructor(x, y, width, height, color) {
    super(x, y, color);
    this.width = width;    // Width of the rectangle
    this.height = height;  // Height of the rectangle
  }
  // Method to draw the rectangle
  draw() {
    fill(this.color); // Set the fill color
    noStroke();  // No border for the rectangle
    rect(this.x, this.y, this.width, this.height); // Draw the rectangle
  }
}
// Class representing a circle shape in Bauhaus style
class BauhausCircle extends BauhausShape {
  constructor(x, y, size, color) {
    super(x, y, color);
    this.size = size; // Diameter of the circle
  }
 // Method to draw the circle
  draw() {
    fill(this.color); // Set the fill color
    noStroke(); // No border for the circle
    ellipse(this.x, this.y, this.size); // Draw the circle
  }
}

class BauhausLine extends BauhausShape {
  constructor(x, y, length, angle, color) {
    super(x, y, color); // Call the base class constructor
    this.length = length; // Length of the line
    this.angle = angle;  // Angle of rotation for the line
  }
  // Method to draw the line
  draw() {
    stroke(this.color);    // Set the line color
    strokeWeight(2);       // Set the thickness of the line
    push();                // Save the current state of the canvas
    translate(this.x, this.y); // Move the origin to the line's starting point
    rotate(radians(this.angle)); // Rotate the line by the specified angle
    line(0, 0, this.length, 0);  // Draw the line from origin to the specified length
    pop();                 // Restore the original state of the canvas
  }
}
// Class representing a cloud shape in Bauhaus style
class BauhausCloud extends BauhausShape {
  constructor(x, y, size, alpha) {
    super(x, y, color(255, 255, 255, alpha));// Set the color of the cloud
    this.size = size;
    this.speedX = random(0.2, 1); // Horizontal movement speed of the cloud
    this.speedY = random(-0.2, 0.2);// Vertical
  }
  // Method to draw the cloud on the canvas
  draw() {
    noStroke(); // No border for the cloud
    fill(this.color); // Set the fill color for the cloud
    ellipse(this.x, this.y, this.size, this.size * 0.5);
    ellipse(this.x - this.size * 0.4, this.y + this.size * 0.2, this.size * 0.6, this.size * 0.4);
    ellipse(this.x + this.size * 0.4, this.y + this.size * 0.2, this.size * 0.6, this.size * 0.4);
    ellipse(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.5, this.size * 0.3);
    ellipse(this.x + this.size * 0.2, this.y - this.size * 0.2, this.size * 0.5, this.size * 0.3);
  }
  // Method to move the cloud
  move() {
    this.x += this.speedX;// Update X-coordinate based on horizontal speed
    this.y += this.speedY; // Update Y-coordinate based on vertical speed
    // Wrap around the canvas horizontally
    if (this.x > width + this.size) {
      this.x = -this.size;
    } else if (this.x < -this.size) {
      this.x = width + this.size;
    }
// Wrap around the canvas vertically
    if (this.y > height + this.size * 0.5) {
      this.y = -this.size * 0.5;
    } else if (this.y < -this.size * 0.5) {
      this.y = height + this.size * 0.5;
    }
  }
}
