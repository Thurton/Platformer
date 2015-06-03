var BULLET_RIGHT = 0;
var BULLET_LEFT = 1

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

var Bullet = function(x, y, moveRight)
{
	this.sprite = new Sprite("bullet.png");
	this.sprite.buildAnimation(2, 1, 34, 17, 0.2, [0,1]);
    this.sprite.buildAnimation(2, 1, 34, 17, 0.2, [2,3]);
	this.sprite.setLoop(0, false);
	
	this.position = new Vector2();
	this.position.set(x,y);
	
	this.velocity = new Vector2();
	
	this.moveRight = moveRight;
	if(this.moveRight == true)
		this.velocity.set(MAXDX *2, 0);
	else
		this.velocity.set(-MAXDX *2, 0);
	   {
        this.sprite.setAnimation(BULLET_RIGHT);
    }
    if (this.velocity.x < 0)
    {
        this.sprite.setAnimation(BULLET_LEFT);
    }
}



Bullet.prototype.update = function(dt)
{
	this.sprite.update(dt);
	this.position.x = Math.floor(this.position.x + (dt * this.velocity.x));
}


Bullet.prototype.draw = function()
{
	var screenX = this .position.x - worldOffsetX;
	this.sprite.draw(context, screenX, this.position.y);
}