var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();


function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here




var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;
var LAYER_COUNT = 3;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;
var MAP = { tw: 300, th: 15 };
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 1500;
var score =0;
var lives = 3;
var hp =3;
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;
var enemies = [];
var bullets = [];	
var shootTimer = .02	


var heart = document.createElement("img");
var gameOverTimer = 9.22;
var BG = document.createElement("img");
BG.src = "BG.png";

var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";



var tileset = document.createElement("img");
tileset.src = "tileset.png";


var player = new Player();

var keyboard = new Keyboard();





function cellAtPixelCoord(layer, x, y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
		return 1;
	if(y>SCREEN_HEIGHT)
		return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>MAP.tw || ty<0)
		return 1;
	if(ty>=MAP.th)
		return 0;
	return cells[layer][ty][tx];
};
function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
		return min;
	if(value > max)
		return max;
	return value;
}

var worldOffsetX =0;
function drawMap()
{
	var startX = -1;
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x%TILE);

	startX = tileX - Math.floor(maxTiles / 2);

if(startX < -1)
{
	startX = 0;
	offsetX = 0; 
}
if(startX > MAP.tw - maxTiles)
{
	startX = MAP.tw - maxTiles + 1;
	offsetX = TILE;
}

worldOffsetX = startX * TILE + offsetX;


 for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
 {
  for( var y = 0; y < level1.layers[layerIdx].height; y++ )
 {
	 var idx = y * level1.layers[layerIdx].width + startX;
	 
	for( var x =  startX; x < startX + maxTiles; x++ )
 {
 if( level1.layers[layerIdx].data[idx] != 0 )
 {
 // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the
 // correct tile
 var tileIndex = level1.layers[layerIdx].data[idx] - 1;
 var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * 
		(TILESET_TILE + TILESET_SPACING);
 var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * 
		(TILESET_TILE + TILESET_SPACING);
 context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
(x-startX)*TILE - offsetX,(y-1)*TILE, TILESET_TILE, TILESET_TILE);
 }
 idx++;
 }
 }
 }
}

var cells = [];
var musicBackground;
var sfxFire;
function initialize() {
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) {
		cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++){
				if(level1.layers[layerIdx].data[idx] !=0) {
					
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1){
					cells[layerIdx][y][x]= 0;
				}
				idx++;
				}
			}
		}
		idx = 0;
for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
var px = tileToPixel(x);
var py = tileToPixel(y);
var e = new Enemy(px, py);
enemies.push(e);
}
idx++;
}
} 
		
		musicBackground = new Howl(
		{
			urls: ["background.ogg"],
			loop : true,
			buffer: true,
			volume: 0.3
		});
		//musicBackground.play();
		
		sfxFire = new Howl(
		{
			urls: ["fireEffect.ogg"],
			buffer: true,
			volume: 1,
			onend: function(){
				issfxPlaying = false;
			}
		});
	}


	
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
    if(y2 + h2 < y1 ||
    x2 + w2 < x1 ||
    x2 > x1 + w1 ||
    y2 > y1 + h1)
    {
        return false;
    }
    return true;
}




function run()
{
	context.fillStyle = "#1e90ff";		
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
	player.update(deltaTime);
	
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime);
	}
	
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].draw(deltaTime);
	}
	
if(shootTimer > 0)
		shootTimer -= deltaTime;
	
	var hit=false; 
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].update(deltaTime);
		if(bullets [i].position.x - worldOffsetX < 0 ||
		bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
		{
			hit = true;
		}
		
		for(var j=0; j<enemies.length; j++)
		{
			if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
			enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
			{
				enemies.splice(j, 1);
				hit = true;
				score += 1;
				break;
			}
		}
		if(hit == true)
		{
			bullets.splice(i, 1);
			break;
		}
		
	}
	
	drawMap();
	player.draw();
	
	
	
	
   
    heart.src = "heart.png";
    if (hp >= 1)
        context.drawImage(heart, 10, 23);
    if (hp >= 2)
        context.drawImage(heart, 10 + (heart.width + 5), 23);
    if (hp >= 3)
        context.drawImage(heart, 10 + ((heart.width + 5) + (heart.width + 2)), 23);
    
    

   
	
		
	// update the frame counter 
	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}		
		
	// draw the FPS
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
	context.fillStyle = "blue";
	context.font="32px Arial";
	var scoreText = "Score: " + score;
	context.fillText(scoreText, SCREEN_WIDTH - 170, 35);
	for(var i=0; i<lives; i++)
	{
	//	context.drawImage(heartImage, 20 + ((heartImage.width+2)*i), 10);
	}
	
}
initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
