// GWM World Driving Game

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game States
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing'
};

// Vehicle Definitions
const VEHICLES = {
    p300: {
        name: 'GWM P 300',
        type: 'Bakkie',
        width: 40,
        height: 60,
        maxSpeed: 180,
        acceleration: 0.5,
        friction: 0.95,
        color: '#FF6B6B',
        engineSound: 'bakkie-engine'
    },
    tank300: {
        name: 'GWM Tank 300',
        type: 'SUV',
        width: 50,
        height: 70,
        maxSpeed: 160,
        acceleration: 0.6,
        friction: 0.94,
        color: '#4ECDC4',
        engineSound: 'tank300-engine'
    },
    tank500: {
        name: 'GWM Tank 500',
        type: 'Large Tank',
        width: 60,
        height: 80,
        maxSpeed: 150,
        acceleration: 0.7,
        friction: 0.93,
        color: '#45B7D1',
        engineSound: 'tank500-engine'
    }
};

// Game Objects
let gameState = GAME_STATES.MENU;
let selectedVehicle = null;
let player = null;
let camera = { x: 0, y: 0 };
let worldMap = null;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Player Class
class Player {
    constructor(vehicleType) {
        const vehicleData = VEHICLES[vehicleType];
        this.name = vehicleData.name;
        this.type = vehicleData.type;
        this.width = vehicleData.width;
        this.height = vehicleData.height;
        this.maxSpeed = vehicleData.maxSpeed;
        this.acceleration = vehicleData.acceleration;
        this.friction = vehicleData.friction;
        this.color = vehicleData.color;
        this.engineSound = vehicleData.engineSound;
        
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.fuel = 100;
        this.fuelConsumption = 0.05;
        
        this.playEngineSound();
    }
    
    update() {
        // Acceleration
        const moveX = keys['ArrowRight'] || keys['d'] || keys['D'];
        const moveY = keys['ArrowDown'] || keys['s'] || keys['S'];
        const moveLeft = keys['ArrowLeft'] || keys['a'] || keys['A'];
        const moveUp = keys['ArrowUp'] || keys['w'] || keys['W'];
        
        // Calculate acceleration
        let accelX = 0;
        let accelY = 0;
        
        if (moveRight) accelX += this.acceleration;
        if (moveLeft) accelX -= this.acceleration;
        if (moveDown) accelY += this.acceleration;
        if (moveUp) accelY -= this.acceleration;
        
        this.vx += accelX;
        this.vy += accelY;
        
        // Speed limit
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        // Friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update angle based on movement
        if (this.vx !== 0 || this.vy !== 0) {
            this.angle = Math.atan2(this.vy, this.vx);
        }
        
        // Fuel consumption
        if (speed > 0) {
            this.fuel -= this.fuelConsumption;
            if (this.fuel < 0) this.fuel = 0;
        }
        
        // Refuel at certain areas (placeholder)
        if (this.fuel === 0) {
            this.vx = 0;
            this.vy = 0;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw vehicle body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw front indicator
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-this.width / 4, -this.height / 2, this.width / 2, 8);
        
        ctx.restore();
    }
    
    getSpeed() {
        return Math.sqrt(this.vx ** 2 + this.vy ** 2);
    }
    
    playEngineSound() {
        // Placeholder for engine sounds
        console.log(`${this.name} engine started: ${this.engineSound}`);
    }
    
    getLocation() {
        // Simplified location system
        const continents = ['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Australia', 'Antarctica'];
        const continent = continents[Math.floor((this.x + 5000) / 2000) % 7];
        return `${continent}`;
    }
}

// World Map Class
class WorldMap {
    constructor() {
        this.roads = this.generateRoads();
        this.terrain = this.generateTerrain();
    }
    
    generateRoads() {
        // Simplified road generation
        const roads = [];
        for (let i = 0; i < 20; i++) {
            roads.push({
                type: i % 2 === 0 ? 'highway' : 'road',
                x: Math.random() * 10000 - 5000,
                y: Math.random() * 10000 - 5000,
                width: i % 2 === 0 ? 80 : 40,
                length: 1000
            });
        }
        return roads;
    }
    
    generateTerrain() {
        // Simplified terrain
        return {
            grass: '#90EE90',
            water: '#4A90E2',
            sand: '#F4A460'
        };
    }
    
    draw(camera) {
        // Draw background
        ctx.fillStyle = this.terrain.grass;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw roads relative to camera
        ctx.fillStyle = '#444';
        this.roads.forEach(road => {
            const screenX = road.x - camera.x;
            const screenY = road.y - camera.y;
            ctx.fillRect(screenX - road.width / 2, screenY - road.length / 2, road.width, road.length);
        });
    }
}

// UI Updates
function updateHUD() {
    if (player) {
        document.getElementById('vehicleName').textContent = player.name;
        document.getElementById('speedometer').textContent = Math.round(player.getSpeed());
        document.getElementById('location').textContent = player.getLocation();
        document.getElementById('fuelBar').style.width = player.fuel + '%';
    }
}

// Vehicle Selection
document.querySelectorAll('.vehicle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const vehicleType = e.currentTarget.dataset.vehicle;
        startGame(vehicleType);
    });
});

function startGame(vehicleType) {
    selectedVehicle = vehicleType;
    gameState = GAME_STATES.PLAYING;
    player = new Player(vehicleType);
    worldMap = new WorldMap();
    
    // Hide menu, show HUD
    document.getElementById('vehicleSelector').classList.add('hidden');
    document.getElementById('gameHUD').classList.add('active');
}

// Camera follow player
function updateCamera() {
    if (player) {
        camera.x = player.x - canvas.width / 2;
        camera.y = player.y - canvas.height / 2;
    }
}

// Main game loop
function gameLoop() {
    if (gameState === GAME_STATES.PLAYING && player && worldMap) {
        // Update
        player.update();
        updateCamera();
        updateHUD();
        
        // Draw
        worldMap.draw(camera);
        player.draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start game loop
gameLoop();
