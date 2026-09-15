const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game states
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'paused'

// Level configuration
const LEVELS = {
    1: { color: '#87CEEB', beeSpeedMultiplier: 1, spawnInterval: 4000 },    // Sky
    2: { color: '#317CFF', beeSpeedMultiplier: 1.5, spawnInterval: 3000 },  // Ocean
    3: { color: '#FFA500', beeSpeedMultiplier: 2, spawnInterval: 2000 },    // Orange
    4: { color: '#8B0000', beeSpeedMultiplier: 3, spawnInterval: 1000 },    // Dark Red
    5: { color: '#000000', beeSpeedMultiplier: 4, spawnInterval: 500 }      // Black
};
let currentLevel = 1;
let beesPassed = 0;
const BEES_PER_LEVEL = 10;

// Player properties
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 30,
    height: 150,
    speed: 5,
    jumpForce: 20,
    velocityY: 0,
    isJumping: false,
    hitPoints: 10,
    isBlinking: false,
    blinkCount: 0,
    blinkDelay: 0
};

// Explosion properties
const explosions = [];

// Sound effects
const jumpSound = new Audio('sound/mixkit-boing-hit-sound-2894.wav');
const beeHitSound = new Audio('sound/mixkit-cartoon-insect-buzzing-31.wav');
const jellyHitSound = new Audio('sound/mixkit-magic-bubbles-spell-2999.wav');
const scoreSound = new Audio('sound/mixkit-fairy-cartoon-success-voice-344.wav');
const levelUpSound = new Audio('sound/mixkit-game-success-alert-2039.wav');
const pauseSound = new Audio('sound/mixkit-player-jumping-in-a-video-game-2043.wav');

// Set lower volume for sound effects
jumpSound.volume = 0.3;
beeHitSound.volume = 0.3;
jellyHitSound.volume = 0.3;
scoreSound.volume = 0.3;
levelUpSound.volume = 0.3;
pauseSound.volume = 0.3;

// Background music
const normalLevelMusic = new Audio('sound/mixkit-to-the-next-round-1047.mp3');
const finalLevelMusic = new Audio('sound/mixkit-i-wont-surrender-846.mp3');
normalLevelMusic.loop = true;
finalLevelMusic.loop = true;
// Set consistent volume for background music
normalLevelMusic.volume = 0.7;
finalLevelMusic.volume = 0.7;

// Physics
const gravity = 0.6;
const ground = canvas.height - 50;

// Game stats
let jumpCount = 0;
let score = 0;

// Input handling
const keys = {
    left: false,
    right: false,
    up: false
};

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && (gameState === 'start' || gameState === 'gameOver')) {
        resetGame();
        return;
    }
    
    if (gameState !== 'playing' && gameState !== 'paused') return;

    if (e.key === ' ') {
        if (gameState === 'playing') {
            gameState = 'paused';
            pauseSound.currentTime = 0;
            pauseSound.play();
        } else if (gameState === 'paused') {
            gameState = 'playing';
            pauseSound.currentTime = 0;
            pauseSound.play();
        }
        return;
    }

    switch(e.key) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
    }
});

// Bee properties
const bees = [];

// Load GIFs once into the DOM so frames animate; redrawing a new Image
// every frame never finished loading the jellyfish sprite.
function loadAnimatedGif(src) {
    const img = new Image();
    img.src = src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(img);
    return img;
}

function canDrawImage(img) {
    return img.complete && img.naturalWidth > 0;
}

const beeImg = loadAnimatedGif('images/bee.gif');
const jellyImg = loadAnimatedGif('images/jellyfish.gif');
const bubblesImg = loadAnimatedGif('images/bubbles.gif');
const BEE_SIZE = 48;
const JELLY_SIZE = BEE_SIZE * 1.5;

// Add heart image
const heartImg = new Image();
heartImg.src = 'images/heart.gif';
let lastHeartUpdate = 0;
const HEART_UPDATE_INTERVAL = 100; // Update hearts every 100ms

// Create heart elements for animation
const heartElements = [];
function createHeartElement() {
    const heart = document.createElement('img');
    heart.src = 'images/heart.gif';
    heart.style.position = 'absolute';
    heart.style.width = '30px';
    heart.style.height = '30px';
    heart.style.pointerEvents = 'none';
    heart.style.display = 'none'; // Start hidden
    document.body.appendChild(heart);
    return heart;
}

// Initialize heart elements
for (let i = 0; i < 10; i++) {
    heartElements.push(createHeartElement());
}

// Add pause button
const pauseButton = document.createElement('button');
pauseButton.textContent = '⏸️';
pauseButton.style.position = 'absolute';
pauseButton.style.top = '10px';
pauseButton.style.right = '10px';
pauseButton.style.fontSize = '24px';
pauseButton.style.padding = '5px 10px';
pauseButton.style.cursor = 'pointer';
pauseButton.style.backgroundColor = 'transparent';
pauseButton.style.border = 'none';
document.body.appendChild(pauseButton);

pauseButton.addEventListener('click', () => {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseButton.textContent = '▶️';
        pauseSound.currentTime = 0;
        pauseSound.play();
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseButton.textContent = '⏸️';
        pauseSound.currentTime = 0;
        pauseSound.play();
    }
});

function createExplosion(x, y) {
    const explosionImg = new Image();
    // Force reload by adding timestamp to prevent caching
    explosionImg.src = 'images/explosion.gif?' + new Date().getTime();
    explosionImg.style.position = 'absolute';
    explosionImg.style.left = (canvas.offsetLeft + x) + 'px';
    explosionImg.style.top = (canvas.offsetTop + y) + 'px';
    explosionImg.style.width = '100px';
    explosionImg.style.height = '100px';
    explosionImg.style.pointerEvents = 'none';
    document.body.appendChild(explosionImg);
    
    // Remove the explosion after animation completes
    setTimeout(() => {
        explosionImg.remove();
    }, 400);
}

function spawnBee() {
    if (gameState !== 'playing') return;  // Only spawn bees when game is playing
    
    const amplitude = 40 + Math.random() * 40; // more dynamic wave height
    const frequency = 0.01 + Math.random() * 0.01; // more dynamic frequency
    const baseSpeed = 1.2 + Math.random() * 0.8; // base speed
    const levelSpeedMultiplier = LEVELS[currentLevel].beeSpeedMultiplier;
    
    bees.push({
        x: canvas.width + 50, // start off right edge
        y: 80 + Math.random() * (ground - 160),
        baseY: 80 + Math.random() * (ground - 160),
        speed: baseSpeed * levelSpeedMultiplier,
        amplitude,
        frequency,
        phase: Math.random() * Math.PI * 2,
        t: 0,
        waveSpeed: 0.04 + Math.random() * 0.04 // how fast the wave changes
    });
}

let spawnIntervalId = null;

function startBeeSpawning() {
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
    }
    spawnIntervalId = setInterval(spawnBee, LEVELS[currentLevel].spawnInterval);
}

function spriteSize() {
    return currentLevel === 2 ? JELLY_SIZE : BEE_SIZE;
}

function checkCollision(player, bee) {
    const size = spriteSize();
    return player.x < bee.x + size &&
           player.x + player.width > bee.x &&
           player.y < bee.y + size &&
           player.y + player.height > bee.y;
}

function updateBees() {
    for (let i = bees.length - 1; i >= 0; i--) {
        const bee = bees[i];
        bee.x -= bee.speed;
        bee.t += bee.waveSpeed;
        bee.y = bee.baseY + Math.sin(bee.t * bee.frequency + bee.phase) * bee.amplitude
            + Math.sin(bee.t * bee.frequency * 2 + bee.phase * 1.5) * (bee.amplitude * 0.4);
        
        // Check for collision with player
        if (checkCollision(player, bee)) {
            player.hitPoints--;
            // Create explosion at collision point
            createExplosion(bee.x, bee.y);
            bees.splice(i, 1);
            
            // Play different sounds based on level
            if (currentLevel === 2) {
                jellyHitSound.currentTime = 0;
                jellyHitSound.play();
            } else {
                beeHitSound.currentTime = 0;
                beeHitSound.play();
            }
            
            player.isBlinking = true;
            player.blinkCount = 0;
            if (player.hitPoints <= 0) {
                gameState = 'gameOver';
            }
        }
        
        // Remove bee if it goes off screen
        if (bee.x < -60) {
            bees.splice(i, 1);
            score++;
            beesPassed++;
            scoreSound.currentTime = 0;
            scoreSound.play();
            
            // Check for level progression
            if (beesPassed >= BEES_PER_LEVEL && currentLevel < 5) {
                currentLevel++;
                beesPassed = 0;
                levelUpSound.currentTime = 0;
                levelUpSound.play();
                startBeeSpawning(); // Restart spawning with new interval
            }
        }
    }
}

function updatePlayer() {
    // Handle blinking effect
    if (player.isBlinking) {
        player.blinkDelay++;
        if (player.blinkDelay >= 10) { // Add delay between blinks
            player.blinkCount++;
            player.blinkDelay = 0;
            if (player.blinkCount >= 4) { // 2 blinks = 4 state changes
                player.isBlinking = false;
                player.blinkCount = 0;
            }
        }
    }

    // Horizontal movement
    if (keys.left) {
        player.x -= player.speed;
    }
    if (keys.right) {
        player.x += player.speed;
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Jumping
    if (keys.up && !player.isJumping) {
        player.velocityY = -player.jumpForce;
        player.isJumping = true;
        jumpCount++; // Increment jump counter
        jumpSound.currentTime = 0; // Reset sound to start
        jumpSound.play();
        // Create explosion at player's feet, aligned with ground
        createExplosion(player.x + player.width/2 - 45, ground - 45); // Position at ground level
    }

    // Apply gravity
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height > ground) {
        player.y = ground - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        // Draw start screen
        ctx.fillStyle = '#000000';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width/2, canvas.height/2);
        return;
    }

    if (gameState === 'gameOver') {
        // Draw game over screen
        ctx.fillStyle = '#000000';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
        ctx.fillText('Press SPACE to Restart', canvas.width/2, canvas.height/2 + 50);
        return;
    }

    if (gameState === 'paused') {
        // Draw pause screen overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
        return;
    }

    // Draw background based on level
    ctx.fillStyle = LEVELS[currentLevel].color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add bubbles background pattern for level 2
    if (currentLevel === 2 && canDrawImage(bubblesImg)) {
        // Create a repeating pattern of bubbles with tighter spacing for seamless effect
        const bubbleSize = 150;
        const bubbleSpacing = 100; // Reduced spacing for more seamless pattern
        const offsetX = (Date.now() / 100) % bubbleSpacing; // Slower animation for bubbles moving up
        
        for (let x = -offsetX; x < canvas.width + bubbleSize; x += bubbleSpacing) {
            for (let y = -offsetX; y < canvas.height + bubbleSize; y += bubbleSpacing) {
                ctx.drawImage(bubblesImg, x, y, bubbleSize, bubbleSize);
            }
        }
    }

    // Draw ground
    ctx.fillStyle = '#67C23A';
    ctx.fillRect(0, ground, canvas.width, canvas.height - ground);

    // Draw bees
    for (const bee of bees) {
        if (currentLevel === 2) {
            // For level 2, draw jelly with counter-clockwise 90 degree rotation
            const half = JELLY_SIZE / 2;
            ctx.save();
            ctx.translate(bee.x + half, bee.y + half);
            // ctx.rotate(-Math.PI / 2); // Rotate counter-clockwise 90 degrees
            if (canDrawImage(jellyImg)) {
                ctx.drawImage(jellyImg, -half, -half, JELLY_SIZE, JELLY_SIZE);
            } else {
                ctx.fillStyle = '#7DF9FF';
                ctx.beginPath();
                ctx.ellipse(0, 0, 21, 30, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        } else {
            // For other levels, draw bees normally
            ctx.drawImage(beeImg, bee.x, bee.y, BEE_SIZE, BEE_SIZE);
        }
    }

    // Draw player
    if (player.isBlinking && player.blinkCount % 2 === 0) {
        ctx.fillStyle = '#FFFFFF'; // White color for blinking
    } else {
        ctx.fillStyle = '#FF0000'; // Normal red color
    }
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw hearts for HP
    const heartSize = 30;
    const heartSpacing = 2;
    const startX = 60;
    const startY = 20;

    // Draw HP label
    ctx.fillStyle = currentLevel === 5 ? '#FFFFFF' : '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('HP:', 20, startY + heartSize/2 + 5); // Align vertically with hearts

    // Update heart animation timing
    const currentTime = Date.now();
    if (currentTime - lastHeartUpdate > HEART_UPDATE_INTERVAL) {
        lastHeartUpdate = currentTime;
    }

    // Only show hearts during gameplay
    if (gameState === 'playing') {
        // Position and show heart elements
        for (let i = 0; i < player.hitPoints; i++) {
            const heart = heartElements[i];
            if (heart) {
                // Make the last heart blink if we're at 1 HP
                if (player.hitPoints === 1 && i === 0) {
                    heart.style.display = Math.floor(Date.now() / 500) % 2 === 0 ? 'block' : 'none';
                } else {
                    heart.style.display = 'block';
                }
                heart.style.left = (canvas.offsetLeft + startX + (i * (heartSize + heartSpacing))) + 'px';
                heart.style.top = (canvas.offsetTop + startY) + 'px';
            }
        }

        // Hide unused hearts
        for (let i = player.hitPoints; i < heartElements.length; i++) {
            if (heartElements[i]) {
                heartElements[i].style.display = 'none';
            }
        }
    } else {
        // Hide all hearts when game is not playing
        heartElements.forEach(heart => {
            if (heart) {
                heart.style.display = 'none';
                heart.style.left = '0px';
                heart.style.top = '0px';
            }
        });
    }
    
    ctx.fillStyle = currentLevel === 5 ? '#FFFFFF' : '#000000';
    ctx.fillText(`Score: ${score}`, 20, 60);

    // Draw level in top right
    ctx.textAlign = 'right';
    ctx.fillText(`Level ${currentLevel}`, canvas.width - 20, 30);
}

function resetGame() {
    player.x = 50;
    player.y = canvas.height - 50;
    player.velocityY = 0;
    player.isJumping = false;
    player.hitPoints = 10;
    bees.length = 0;
    score = 0;
    currentLevel = 1;
    beesPassed = 0;
    gameState = 'playing';
    startBeeSpawning();
    updateBackgroundMusic(); // Start the appropriate music
}

function gameLoop() {
    if (gameState === 'playing') {
        updatePlayer();
        updateBees();
        updateBackgroundMusic(); // Keep checking for music updates
    } else {
        // Pause music when game is not playing
        normalLevelMusic.pause();
        finalLevelMusic.pause();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Function to handle background music
function updateBackgroundMusic() {
    if (currentLevel < 5) {
        if (normalLevelMusic.paused) {
            finalLevelMusic.pause();
            finalLevelMusic.currentTime = 0;
            normalLevelMusic.volume = 0.7; // Ensure volume is set before playing
            normalLevelMusic.play().catch(e => console.log('Audio play failed:', e));
        } else {
            // Ensure volume is maintained even when already playing
            normalLevelMusic.volume = 0.7;
        }
    } else {
        if (finalLevelMusic.paused) {
            normalLevelMusic.pause();
            normalLevelMusic.currentTime = 0;
            finalLevelMusic.volume = 0.7; // Ensure volume is set before playing
            finalLevelMusic.play().catch(e => console.log('Audio play failed:', e));
        } else {
            // Ensure volume is maintained even when already playing
            finalLevelMusic.volume = 0.7;
        }
    }
}

// Start the game
startBeeSpawning();
gameLoop(); 