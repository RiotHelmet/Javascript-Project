let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

texturePlayer = new Image();
texturePlayer.src = "Textures/Character.png";

let textureCobble = new Image();
textureCobble.src = "Textures/cobble.png";
let textureWood = new Image();
textureWood.src = "Textures/wood.png";

let textureGrass = new Image();
textureGrass.src = "Textures/grass.png";

textureMap = new Image();
textureMap.src = "Textures/Map.png";

const centerX = canvas.width / 2,
  centerY = canvas.height / 2;

let moveMap = false;
let structures = [];
let shootableObjects = [];
let characters = [];
let Rays = [];
let lines = [];
let objects = [];
let keys = [];
let showHitboxes = true;
let bullets = [];
var mousePos = {
  x: 0,
  y: 0,
};

var mouseDown = false;

class rayHit {
  pos = {
    x: 0,
    y: 0,
  };
  constructor(x, y, height, width) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;
    Rays.push(this);
  }
  show() {
    ctx.strokeStyle = "none";
    if (showHitboxes === true) {
      ctx.strokeStyle = "red";
    }
    ctx.beginPath();
    ctx.rect(
      this.pos.x - this.width / 2,
      this.pos.y - this.height / 2,
      this.width,
      this.height
    );
    ctx.stroke();
  }
}

class Line {
  startPos = {
    x: 0,
    y: 0,
  };
  endPos = {
    x: 0,
    y: 0,
  };
  constructor(x, y, x2, y2) {
    this.startPos.x = x;
    this.startPos.y = y;
    this.endPos.x = x2;
    this.endPos.y = y2;
    lines.push(this);
  }
  show() {
    ctx.strokeStyle = "none";
    if (showHitboxes === true) {
      ctx.strokeStyle = "blue";
    }
    ctx.beginPath();
    ctx.moveTo(this.startPos.x, this.startPos.y);
    ctx.lineTo(this.endPos.x, this.endPos.y);
    ctx.stroke();
  }
}

class map {
  pos = {
    x: 0,
    y: 0,
  };
  speed = 1;
  velocity = {
    x: 0,
    y: 0,
  };
  constructor() {
    this.pos.x = Player.pos.x;
    this.pos.y = Player.pos.y;
    this.width = canvas.width;
    this.height = canvas.height;

    map.objects = objects;
  }
  show() {
    let translateAmountX = this.pos.x - canvas.width / 2;
    let translateAmountY = this.pos.y - canvas.height / 2;
    ctx.save();
    ctx.translate(-translateAmountX, -translateAmountY);

    ctx.drawImage(textureMap, 0, 0, 2 * this.width, this.height);
    objects.forEach((Object) => {
      if (Object.health > 0) {
        Object.show();
      } else {
        objects.splice(objects.indexOf(Object), 1);
        shootableObjects.splice(shootableObjects.indexOf(Object), 1);
        structures.splice(structures.indexOf(Object), 1);
      }
    });
    bullets.forEach((Object) => {
      Object.show();
    });
    if (showHitboxes === true) {
      lines.forEach((Object) => {
        Object.show();
      });
      Rays.forEach((Object) => {
        Object.show();
      });
    }
    characters.forEach((Object) => {
      Object.show(
        Dir(
          {
            x: Player.pos.x - translateAmountX,
            y: Player.pos.y - translateAmountY,
          },
          mousePos
        )
      );
    });
    ctx.restore();
  }
}

class Character {
  pos = {
    x: 0,
    y: 0,
  };
  speed = 1;
  velocity = {
    x: 0,
    y: 0,
  };
  health = 1000;
  Ammo = 20;
  constructor(x, y, height, width) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;

    characters.push(this);
  }
  show(direction) {
    if (showHitboxes === true) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.rect(
        this.pos.x - this.width / 2,
        this.pos.y - this.height / 2,
        this.width,
        this.height
      );
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(direction + Math.PI / 2 + 0.2);
    ctx.drawImage(
      texturePlayer,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

class Bullet {
  pos = {
    x: 0,
    y: 0,
  };
  endDist = 0;
  direction = 0;
  startPos = 0;
  constructor(startPos, endPos, direction) {
    this.startPos = startPos;
    this.endDist = dist(startPos, endPos);
    this.pos.x = startPos.x + Math.cos(direction) * 20;
    this.pos.y = startPos.y + Math.sin(direction) * 20;
    this.direction = direction;
    bullets.push(this);
  }
  show() {
    if (dist(this.startPos, this.pos) > this.endDist) {
      bullets.splice(bullets.indexOf(this), 1);
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.lineTo(
        (this.pos.x += Math.cos(this.direction) * 7),
        (this.pos.y += Math.sin(this.direction) * 7)
      );
      ctx.stroke();
      this.pos.x += Math.cos(this.direction) * 50;
      this.pos.y += Math.sin(this.direction) * 50;
    }
  }
}

class Structure {
  pos = {
    x: 0,
    y: 0,
  };
  health = 100;
  constructor(x, y, height, width, texture) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;
    this.texture = texture;
    objects.push(this);
    structures.push(this);
    shootableObjects.push(this);
  }
  show() {
    ctx.beginPath();
    ctx.rect(
      this.pos.x - this.width / 2,
      this.pos.y - this.height / 2,
      this.width,
      this.height
    );
    if (typeof this.texture === "string") {
      ctx.fillStyle = this.texture;
      ctx.fillRect(
        this.pos.x - this.width / 2,
        this.pos.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      var pattern = ctx.createPattern(this.texture, "repeat");
      ctx.fillStyle = pattern;
      ctx.fillRect(
        this.pos.x - this.width / 2,
        this.pos.y - this.height / 2,
        this.width,
        this.height
      );
    }
  }
}

class structureNoHB {
  pos = {
    x: 0,
    y: 0,
  };
  health = 1000;
  constructor(x, y, height, width, texture) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;
    this.texture = texture;
    objects.push(this);
  }
  show() {
    ctx.beginPath();
    ctx.rect(
      this.pos.x - this.width / 2,
      this.pos.y - this.height / 2,
      this.width,
      this.height
    );
    if (typeof this.texture === "string") {
      ctx.fillStyle = this.texture;
      ctx.fillRect(
        this.pos.x - this.width / 2,
        this.pos.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      var pattern = ctx.createPattern(this.texture, "repeat");
      ctx.fillStyle = pattern;
      ctx.fillRect(
        this.pos.x - this.width / 2,
        this.pos.y - this.height / 2,
        this.width,
        this.height
      );
    }
  }
}

function rayCast(start, dir) {
  hitPos = {
    x: 0,
    y: 0,
  };
  hitObject = "";

  hitDist = Infinity;
  let Dist = Infinity;

  for (let j = 0; j < shootableObjects.length; j++) {
    if (shootableObjects[j] !== start) {
      other = shootableObjects[j];
      let otherVector1 = {
        x: other.pos.x - other.width / 2,
        y: other.pos.y + other.height / 2,
      };
      let otherVector2 = {
        x: other.pos.x - other.width / 2,
        y: other.pos.y - other.height / 2,
      };
      let otherVector3 = {
        x: other.pos.x + other.width / 2,
        y: other.pos.y - other.height / 2,
      };
      let otherVector4 = {
        x: other.pos.x + other.width / 2,
        y: other.pos.y + other.height / 2,
      };

      for (let i = 1; i < 5; i++) {
        x1 = start.pos.x;
        y1 = start.pos.y;
        x2 = x1 + Math.cos(dir) * 1000000;
        y2 = y1 + Math.sin(dir) * 1000000;

        if (i === 4) {
          x3 = eval(`otherVector${i}`).x;
          y3 = eval(`otherVector${i}`).y;
          x4 = eval(`otherVector${1}`).x;
          y4 = eval(`otherVector${1}`).y;
        } else {
          x3 = eval(`otherVector${i}`).x;
          y3 = eval(`otherVector${i}`).y;
          x4 = eval(`otherVector${i + 1}`).x;
          y4 = eval(`otherVector${i + 1}`).y;
        }

        var intT = Number;
        var intU = Number;
        var intPx = Number;
        var intPy = Number;
        var D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (D === 0) {
          return;
        }
        intT = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / D;

        intU = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / D;

        if (0 < intT && intT < 1 && intU > 0 && intU < 1) {
          intPy =
            ((x1 * y2 - y1 * x2) * (y3 - y4) -
              (y1 - y2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          intPx =
            ((x1 * y2 - y1 * x2) * (x3 - x4) -
              (x1 - x2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          if (dist({ x: intPx, y: intPy }, start.pos) < Dist) {
            Dist = dist({ x: intPx, y: intPy }, start.pos);
            hitPos.x = intPx;
            hitPos.y = intPy;
          }
          if (dist(other.pos, start.pos) < hitDist) {
            hitDist = dist(other.pos, start.pos);
            hitObject = other;
          }
        }
      }
    }
  }

  return [hitObject, hitPos];
}
// prettier-ignore
let gameMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
];

function drawMap(gameMap) {
  for (let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[0].length; j++) {
      if (gameMap[i][j] === 1) {
        new Structure(
          (canvas.width / gameMap.length) * j +
            canvas.width / gameMap.length / 2,
          (canvas.height / gameMap[0].length) * i +
            canvas.width / gameMap[0].length / 2,
          canvas.width / gameMap.length,
          canvas.height / gameMap[0].length,
          textureCobble
        );
      } else if (gameMap[i][j] === 2) {
        new structureNoHB(
          (canvas.width / gameMap.length) * j +
            canvas.width / gameMap.length / 2,
          (canvas.height / gameMap[0].length) * i +
            canvas.width / gameMap[0].length / 2,
          canvas.width / gameMap.length,
          canvas.height / gameMap[0].length,
          textureWood
        );
      }
      //   else {
      //     new structureNoHB(
      //       (canvas.width / gameMap.length) * j +
      //         canvas.width / gameMap.length / 2,
      //       (canvas.height / gameMap[0].length) * i +
      //         canvas.width / gameMap[0].length / 2,
      //       canvas.width / gameMap.length,
      //       canvas.height / gameMap[0].length,
      //       textureGrass
      //     );
      //   }
      // }
    }
  }
}
drawMap(gameMap);

function shoot(Object, Dir) {
  if (Object.Ammo > 0) {
    Object.Ammo -= 1;
    console.log(Object.Ammo);
    Rays = [];
    hitObject = rayCast(Object, Dir);
    if (hitObject[0] !== undefined) {
      new Bullet(Player.pos, hitPos, Dir);
    }

    hitObject[0].health -= 100;
    console.log(hitObject[0].health);
    hit = new rayHit(hitPos.x, hitPos.y, 5, 5);
  } else {
    console.log("Out of ammo");
  }
}

let Player = new Character(centerX, centerY, 40, 40);
let Map = new map();
// let Enemy = new Character(800, 300, 30, 30);
// let wall1 = new Structure(400, 400, 100, 20, textureCobble);
// let wall2 = new Structure(459, 360, 20, 100, textureCobble);

function collisionDetection(thisObject, positionX, positionY) {
  for (let i = 0; i < structures.length; i++) {
    let xCollision = false;
    let yCollision = false;
    const Object = structures[i];
    if (thisObject !== Object) {
      if (
        positionX < Object.pos.x + Object.width / 2 + thisObject.width / 2 &&
        positionX > Object.pos.x - Object.width / 2 - thisObject.width / 2
      ) {
        // console.log("Collision X")
        xCollision = true;
      }
      if (
        positionY < Object.pos.y + Object.height / 2 + thisObject.height / 2 &&
        positionY > Object.pos.y - Object.height / 2 - thisObject.height / 2
      ) {
        // console.log("Collision Y")
        yCollision = true;
      }
      if (xCollision === true && yCollision === true) {
        return true;
      }
    }
  }
  return false;
}

function moveCamera() {
  let distance = dist(Map.pos, Player.pos);
  let direction = Dir(Map.pos, Player.pos);
  let start = Map.pos;
  let destination = Player.pos;
  let stepSize = distance / 75;
  if (distance > 0) {
    Map.pos.x += Math.cos(direction) * stepSize;
    Map.pos.y += Math.sin(direction) * stepSize;
  }
}

function moveCharacter(Object, friction) {
  if (keys["w"]) {
    if (Object.velocity.y > -Object.speed) {
      Object.velocity.y--;
    }
  }
  if (keys["a"]) {
    if (Object.velocity.x > -Object.speed) {
      Object.velocity.x--;
    }
  }
  if (keys["s"]) {
    if (Object.velocity.y < Object.speed) {
      Object.velocity.y++;
    }
  }
  if (keys["d"]) {
    if (Object.velocity.x < Object.speed) {
      Object.velocity.x++;
    }
  }
  if (
    collisionDetection(
      Player,
      Object.pos.x,
      Object.pos.y + Object.velocity.y
    ) === false
  ) {
    Object.pos.y += Object.velocity.y;
  }
  if (
    collisionDetection(
      Player,
      Object.pos.x + Object.velocity.x,
      Object.pos.y
    ) === false
  ) {
    Object.pos.x += Object.velocity.x;
  }
  Object.velocity.x *= friction;
  Object.velocity.y *= friction;
}

canvas.addEventListener("mousemove", function (e) {
  mousePos.x = e.offsetX;
  mousePos.y = e.offsetY;
});

canvas.addEventListener("mousedown", function (e) {
  mouseDown = true;
  shoot(Player, Dir(Player.pos, mousePos));
});
canvas.addEventListener("mouseup", function (e) {
  mouseDown = false;
});

function update() {
  requestAnimationFrame(update);

  moveCharacter(Player, 0.93);
  moveCamera();
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.stroke();
  Map.show();
}
update();
document.body.addEventListener("keydown", function (e) {
  keys[e.key] = true;
  if (e.key === "h") {
    if (showHitboxes === true) {
      showHitboxes = false;
    } else {
      showHitboxes = true;
    }
  }
});
document.body.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});

function lineDir(origin, dir) {
  lines = [];
  x = Math.cos(dir) * 1000000;
  y = Math.sin(dir) * 1000000;
  ray = new Line(origin.x, origin.y, x + origin.x, origin.y + y);
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
