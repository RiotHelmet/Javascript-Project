let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

let objects = []
let lines = []
let keys = []

var mousePos = {
    x: 0,
    y: 0,
  };

class Character {
    pos = {
        x : 0,
        y : 0
    }
    speed = 3
    velocity = {
        x : 0,
        y : 0
    }
    health  = 1000
    Ammo = 20
    constructor(x, y) {
        this.pos.x = x
        this.pos.y = y
        objects.push(this)
    }
    show() {
        ctx.beginPath();
        ctx.rect(this.pos.x - 15, this.pos.y - 15, 30, 30)
        ctx.stroke();
    }
}


function rayCast(start ,dir , other) {
    class ray {
        constructor(start, x, y) {
            this.x1 = start.x
            this.y1 = start.y
            this.x2 = x1 + Math.cos(dir) * 1000000;
            this.y2 = y1 + Math.sin(dir) * 1000000;
        }
    }
    ray = new ray(start, x, y)
    x1 = ray.x1
    y1 = ray.y1
    x2 = ray.x2
    y2 = ray.y2
    x3 = other.x1
    y3 = other.y1
    x4 = other.x2
    y4 = other.y2
    

    var intPx = Number
    var intPy = Number
    intPy = (((x1*y2 - y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) / ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)))
    intPx = (((x1*y2 - y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) / ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)))
    console.log(intPx, intPy)
    ctx.strokeStyle = "white"
    ctx.lineWidth = 10;
    ctx.beginPath()
    ctx.moveTo(x1, y1);
    ctx.lineTo(intPx, intPy);
    ctx.stroke();

    ctx.strokeStyle = "white"
    ctx.beginPath();
    ctx.arc(intPx, intPy, 20, 0, Math.PI*2, true); 
    ctx.fillStyle = "red";
    ctx.fill()
    ctx.stroke();
}




let Player = new Character(500, 500)
let Enemy = new Character(800, 300)

function moveCharacter(Object, friction) {
    if(keys["w"]){
        if(Object.velocity.y > -Object.speed) {
            Object.velocity.y--
        }
    } if(keys["a"]) {
        if(Object.velocity.x > -Object.speed) {
            Object.velocity.x--
        }
    }  if(keys["s"]) {
        if(Object.velocity.y < Object.speed) {
            Object.velocity.y++
        }
    }  if(keys["d"]) {
        if(Object.velocity.x < Object.speed) {
            Object.velocity.x++
        }
    }
    Object.velocity.x *= friction
    Object.velocity.y *= friction
    Object.pos.x += Object.velocity.x
    Object.pos.y += Object.velocity.y
}

canvas.addEventListener("mousemove", function (e) {
mousePos.x = e.offsetX;
mousePos.y = e.offsetY;
})

function update() {
    requestAnimationFrame(update)

    moveCharacter(Player, 0.90)
    rayCast(Player, Dir(Player.pos, mousePos))


    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    objects.forEach(Object => {
        Object.show()
    });
    lines.forEach(Object => {
        Object.show()
    });    
}
update()
document.body.addEventListener("keydown", function (e) {
    keys[e.key] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

function lineDir(origin, dir) {
    lines = [];
    x = Math.cos(dir) * 1000000;
    y = Math.sin(dir) * 1000000;
    ray = new rayLine(origin.x, origin.y, x + origin.x, origin.y + y);
  }


function Dir(origin, other) {
    x = other.x;
    y = other.y;
    if (other.y >= origin.y) {
      return Math.acos((x - origin.x) / dist(origin, other));
    } else if (other.y <= origin.y) {
      return 2 * Math.PI - Math.acos((x - origin.x) / dist(origin, other));
    }
  }


// function moveObject(Object, angle) {
//     angle = degrees_to_radians(angle)
//     Object.pos.x += Math.cos(angle) * Object.speed;
//     Object.pos.y += Math.sin(angle) * Object.speed;
//     update()
// }

function dist(a, b) {
    x1 = a.x;
    y1 = a.y;
    x2 = b.x;
    y2 = b.y;
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }
  

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }
  
  function radians_to_degrees(rad) {
    var pi = Math.PI;
    return rad * (180 / pi);
  }
  