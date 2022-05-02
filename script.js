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

let delay = 0;

textureMap = new Image();
textureMap.src = "Textures/Map.png";
let game = true;
let translateAmountX;
let translateAmountY;

let spriteWidth = 1200 / 8;
let spriteHeight = 1015 / 7;

const centerX = canvas.width / 2,
  centerY = canvas.height / 2;

let moveMap = false;
let items = [];
let structures = [];
let shootableObjects = [];
let characters = [];
let Rays = [];
let lines = [];
let objects = [];
let keys = [];
let showHitboxes = false;
let particles = [];
let enemies = [];
var mousePos = {
  x: 0,
  y: 0,
};

var mouse = {
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
    ctx.strokeStyle = "blue";
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
  constructor() {
    this.pos.x = Player.pos.x;
    this.pos.y = Player.pos.y;
    this.width = canvas.width;
    this.height = canvas.height;

    map.objects = objects;
  }
  show() {
    translateAmountX = this.pos.x - canvas.width / 2;
    translateAmountY = this.pos.y - canvas.height / 2;

    ctx.save();
    ctx.translate(-translateAmountX, -translateAmountY);

    // ctx.drawImage(textureMap, 0, 0, 2 * this.width * 1.5, this.height * 1.5);
    if (Player.Weapon !== false) {
      if (keys["f"]) {
        throwWeapon(Player.Weapon);
      }
    }

    items.forEach((Object) => {
      if (dist(Player.pos, Object.pos) < 100) {
        if (Player.Weapon === false) {
          if (keys["e"]) {
            Object.onGround = false;
            Player.Weapon = Object;
            items.splice(items.indexOf(items), 1);
          }
        }
      }
      Object.show();
    });
    objects.forEach((Object) => {
      Object.show();
    });

    structures.forEach((Object) => {
      if (Object.health > 0) {
        Object.show();
      } else {
        objects.splice(objects.indexOf(Object), 1);
        shootableObjects.splice(shootableObjects.indexOf(Object), 1);
        structures.splice(structures.indexOf(Object), 1);
      }
    });

    particles.forEach((Object) => {
      Object.show();
    });
    {
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
            x: Player.pos.x,
            y: Player.pos.y,
          },
          mousePos
        )
      );
    });

    enemies.forEach((Object) => {
      Object.show();
    });
    ctx.restore();
  }
}

class Character {
  pos = {
    x: 0,
    y: 0,
  };
  speed = 3;
  velocity = {
    x: 0,
    y: 0,
  };
  health = 100;
  constructor(x, y, height, width) {
    this.pos.x = x;
    this.pos.y = y;
    this.width = width;
    this.height = height;
    this.collisionBoxSize = 50;
    this.size = 50;
    // character
    this.torsoWidth = this.width;
    this.torsoHeight = this.height / 4;
    this.headSize = this.width / 2;
    this.headX = 0;
    this.movementDegree = 0;
    this.rotation = 0;
    this.legRotation = 0;
    this.weapon = {
      height: 30,
      width: 5,
      x: 5,
      y: -20,
    };
    this.leftLeg = {
      x: -10,
      y: 0,
    };
    this.rightLeg = {
      x: +10,
      y: 0,
    };
    this.leftArm = {
      x: -20,
      y: -5,
      rotation: degrees_to_radians(0),
    };
    this.rightArm = {
      x: 20,
      y: -5,
      rotation: degrees_to_radians(0),
    };
    this.Weapon = false;

    characters.push(this);
    shootableObjects.push(this);
  }
  show(direction) {
    this.leftLeg.y = 10 * Math.sin(this.movementDegree);
    this.rightLeg.y = -10 * Math.sin(this.movementDegree);
    this.rightArm.y = -5 + -4 * Math.sin(this.movementDegree);
    this.leftArm.y = -5 + 4 * Math.sin(this.movementDegree);
    this.headX = 2 * Math.sin(this.movementDegree);

    this.rotation = (Math.PI / 16) * Math.sin(this.movementDegree);
    if (this.health < 1) {
      characters.splice(characters.indexOf(this), 1);
      shootableObjects.splice(shootableObjects.indexOf(this), 1);
      game = false;
    }
    if (this.Weapon === false) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.save();
      ctx.rotate(this.legRotation);

      // left leg
      ctx.drawImage(
        texturePlayer,
        4 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.leftLeg.x,
        -this.size / 2 + this.leftLeg.y,
        this.size,
        this.size
      );

      // right leg
      ctx.drawImage(
        texturePlayer,
        4 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightLeg.x,
        -this.size / 2 + this.rightLeg.y,
        this.size,
        this.size
      );
      ctx.restore();

      ctx.rotate(direction + Math.PI / 2 + this.rotation);
      // Right Arm
      ctx.save();
      ctx.rotate(this.leftArm.rotation);
      ctx.drawImage(
        texturePlayer,
        2 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightArm.x,
        -this.size / 2 + this.rightArm.y,
        this.size,
        this.size
      );

      ctx.restore();

      // Left Arm

      ctx.save();
      ctx.rotate(this.leftArm.rotation);
      ctx.drawImage(
        texturePlayer,
        3 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.leftArm.x,
        -this.size / 2 + this.leftArm.y,
        this.size,
        this.size
      );
      ctx.restore();

      //weapon

      //torso

      ctx.drawImage(
        texturePlayer,
        1 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -(this.size - 5) / 2,
        -(this.size - 5) / 2,
        this.size - 5,
        this.size - 5
      );

      // head
      ctx.save();
      ctx.drawImage(
        texturePlayer,
        0 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.headX,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();
      ctx.translate(-this.pos.x, -this.pos.y);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.save();
      ctx.rotate(this.legRotation);

      // left leg
      ctx.drawImage(
        texturePlayer,
        4 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.leftLeg.x,
        -this.size / 2 + this.leftLeg.y,
        this.size,
        this.size
      );

      // right leg
      ctx.drawImage(
        texturePlayer,
        4 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightLeg.x,
        -this.size / 2 + this.rightLeg.y,
        this.size,
        this.size
      );
      ctx.restore();

      ctx.rotate(direction + Math.PI / 2 + this.rotation);
      // Right Arm
      ctx.save();
      ctx.rotate(this.leftArm.rotation);
      ctx.drawImage(
        texturePlayer,
        1 * spriteWidth,
        1 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightArm.x,
        -this.size / 2 + this.rightArm.y,
        this.size,
        this.size
      );

      ctx.restore();

      // Left Arm

      ctx.save();
      // ctx.rotate(degrees_to_radians(-90));
      ctx.drawImage(
        texturePlayer,
        2 * spriteWidth,
        1 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightArm.x - 25,
        -this.size / 2 + this.rightArm.y - 10,
        this.size,
        this.size
      );
      ctx.restore();

      //weapon

      ctx.save();
      ctx.rotate(0);
      ctx.drawImage(
        texturePlayer,
        3 * spriteWidth,
        1 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2 + this.rightArm.x - 10,
        -this.size / 2 + this.rightArm.y - 20,
        this.size,
        this.size
      );
      ctx.restore();

      //torso
      ctx.save();
      ctx.rotate(degrees_to_radians(35));
      ctx.drawImage(
        texturePlayer,
        1 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -(this.size - 5) / 2,
        -(this.size - 5) / 2,
        this.size - 5,
        this.size - 5
      );
      ctx.restore();

      // head
      ctx.save();
      ctx.drawImage(
        texturePlayer,
        0 * spriteWidth,
        0 * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.restore();

      ctx.translate(-this.pos.x, -this.pos.y);
      ctx.restore();
    }
  }
}

class particle {
  pos = {
    x: 0,
    y: 0,
  };

  constructor(startPos, endPos, direction, type, Object) {
    this.startPos = startPos;
    this.endDist = dist(startPos, endPos);
    this.pos.x = startPos.x + Math.cos(direction) * 20;
    this.pos.y = startPos.y + Math.sin(direction) * 20;
    this.direction = direction;
    this.type = type;
    this.speed = 30;
    this.endPos = endPos;
    this.Object = Object;
    this.velocity = 10;
    this.rotation = 0;
    this.rotaionVelocity = 0.1;
    this.shellRotation = getRndInteger(-100, 100) / 100;
    particles.push(this);
  }
  show() {
    if (this.type === "bullet") {
      if (dist(this.startPos, this.pos) > this.endDist) {
        particles.splice(particles.indexOf(this), 1);
      } else {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "yellow";
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "orange";
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(
          (this.pos.x += Math.cos(this.direction) * 20),
          (this.pos.y += Math.sin(this.direction) * 20)
        );
        ctx.stroke();
        ctx.restore();
        this.pos.x += Math.cos(this.direction) * this.speed;
        this.pos.y += Math.sin(this.direction) * this.speed;
      }
    } else if (this.type === "casing") {
      if (this.velocity < 0.000001) {
        particles.splice(particles.indexOf(this), 1);
      }
      this.pos.x +=
        Math.cos(
          Math.PI / 3 + this.direction + getRndInteger(-100, 100) / 100
        ) * this.velocity;
      this.pos.y +=
        Math.sin(
          Math.PI / 3 + this.direction + getRndInteger(-100, 100) / 100
        ) * this.velocity;
      ctx.save();

      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.shellRotation);
      ctx.drawImage(
        texturePlayer,
        4 * spriteWidth,
        1 * spriteHeight,
        spriteWidth,
        spriteHeight,
        0,
        0,
        15,
        15
      );
      ctx.translate(-this.pos.x, -this.pos.y);
      ctx.restore();

      this.velocity *= getRndInteger(80, 95) / 100;
    } else if (this.type === "throw") {
      if (dist(this.startPos, this.pos) > this.endDist || this.velocity < 0.1) {
        this.velocity = 10;
        this.Object.pos.x = this.pos.x;
        this.Object.pos.y = this.pos.y;
        this.Object.onGround = true;
        particles.splice(particles.indexOf(this), 1);
      } else {
        (this.pos.x += Math.cos(this.direction) * this.velocity) -
          this.Object.size / 2,
          (this.pos.y += Math.sin(this.direction) * this.velocity) -
            this.Object.size / 2,
          ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        ctx.rotate((this.Object.onGroundRotation += this.rotaionVelocity));

        ctx.drawImage(
          texturePlayer,
          this.Object.texture.x * spriteWidth,
          this.Object.texture.y * spriteHeight,
          spriteWidth,
          spriteHeight,
          -this.Object.size / 2,
          -this.Object.size / 2,
          this.Object.size,
          this.Object.size
        );

        ctx.translate(-this.pos.x, -this.pos.y);
        ctx.restore();

        this.velocity *= 0.97;
        this.rotaionVelocity *= 0.98;
      }
    }
  }
}

class Structure {
  pos = {
    x: 0,
    y: 0,
  };
  constructor(x, y, height, width, texture, hitbox, shootableBool) {
    this.pos.x = x;
    this.pos.y = y;
    this.health = Infinity;
    if (shootableBool === true) {
      this.shootable === 100;
    }
    this.width = width;
    this.height = height;
    this.texture = texture;
    this.hitBox = hitbox;
    objects.push(this);
    structures.push(this);
    if (hitbox === true) {
      shootableObjects.push(this);
    }
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
    {
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
  }

  return [hitObject, hitPos];
}

class weapon {
  pos = {
    x: 0,
    y: 0,
  };
  constructor(fireRate, accuracy, Ammo, x, y, texture) {
    (this.fireRate = fireRate),
      (this.accuracy = accuracy),
      (this.Ammo = Ammo),
      (this.pos.x = x),
      (this.pos.y = y),
      (this.size = 50),
      (this.texture = {
        x: texture.x,
        y: texture.y,
      }),
      (this.onGround = true),
      (this.onGroundRotation = getRndInteger(-2 * Math.PI, 2 * Math.PI));
    items.push(this);
  }
  show() {
    if (this.onGround === true) {
      ctx.fillStyle = "red";
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.onGroundRotation);
      ctx.drawImage(
        texturePlayer,
        this.texture.x * spriteWidth,
        this.texture.y * spriteHeight,
        spriteWidth,
        spriteHeight,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
      ctx.translate(-this.pos.x, -this.pos.y);
      ctx.restore();
    }
  }
}

class Enemy {
  pos = {
    x: 0,
    y: 0,
  };
  constructor(x, y, difficulty) {
    this.Difficulty = difficulty;
    this.pos.x = x;
    this.pos.y = y;
    this.size = 50;
    this.width = this.size;
    this.height = this.size;
    this.health = 100;
    enemies.push(this);
    this.Ammo = 50;
    shootableObjects.push(this);
    this.collisionBoxSize = 20;
    this.speed = 3;
    // Enemy
    this.direction = 0;
    this.walking = false;
    this.torsoWidth = this.width;
    this.torsoHeight = this.height / 4;
    this.headSize = this.width / 2;
    this.headX = 0;
    this.movementDegree = 0;
    this.rotation = 0;
    this.weapon = {
      height: 30,
      width: 5,
      x: 5,
      y: -20,
    };
    this.leftLeg = {
      x: -10,
      y: 0,
    };
    this.rightLeg = {
      x: +10,
      y: 0,
    };
    this.leftArm = {
      x: -20,
      y: -5,
      rotation: degrees_to_radians(0),
    };
    this.rightArm = {
      x: 20,
      y: -5,
      rotation: degrees_to_radians(0),
    };
    this.delay = 0;
    this.spotDelay = 0;
    this.spotted = false;
  }
  show() {
    if (this.health < 1) {
      new body(this.pos.x, this.pos.y, Dir(this.pos, Player.pos));
      shootableObjects.splice(shootableObjects.indexOf(this), 1);
      enemies.splice(enemies.indexOf(this), 1);
    }
    if (this.delay % 5 === 0) {
      if (rayCast(this, Dir(this.pos, Player.pos))[0] === Player) {
        this.spotDelay += 1;
        if (this.spotDelay % (this.Difficulty * 10) === 0) {
          this.spotted = true;
        }
      }
    }
    if (this.spotDelay > 0) {
      enemyFollowPath(this, Player);
    }
    if (this.spotted === true) {
      if (this.delay % 20 === 0) {
        console.log(this.spotDelay);
        this.direction = Dir(this.pos, Player.pos);
        enemyShoot(
          this,
          Dir(this.pos, Player.pos) +
            degrees_to_radians(
              getRndInteger(-this.Difficulty * 5, this.Difficulty * 5)
            )
        );
      }
    }

    this.delay += 1;
    this.leftLeg.y = 10 * Math.sin(this.movementDegree);
    this.rightLeg.y = -10 * Math.sin(this.movementDegree);
    this.rightArm.y = -10 + -4 * Math.sin(this.movementDegree);
    this.leftArm.y = -5 + 4 * Math.sin(this.movementDegree);
    this.headX = 2 * Math.sin(this.movementDegree);

    this.rotation = (Math.PI / 16) * Math.sin(this.movementDegree);
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    ctx.rotate(this.direction + Math.PI / 2 + this.rotation);

    //torso
    ctx.save();
    ctx.rotate(degrees_to_radians(35));
    ctx.drawImage(
      texturePlayer,
      3 * spriteWidth,
      2 * spriteHeight,
      spriteWidth,
      spriteHeight,
      -this.size / 2,
      -this.size / 2 - 10,
      this.size,
      this.size
    );
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.rotate(this.leftArm.rotation);
    ctx.drawImage(
      texturePlayer,
      1 * spriteWidth,
      2 * spriteHeight,
      spriteWidth,
      spriteHeight,
      -this.size / 2 + this.rightArm.x,
      -this.size / 2 + this.rightArm.y,
      this.size,
      this.size
    );

    ctx.restore();

    // Left Arm

    ctx.save();
    // ctx.rotate(degrees_to_radians(-90));
    ctx.drawImage(
      texturePlayer,
      2 * spriteWidth,
      2 * spriteHeight,
      spriteWidth,
      spriteHeight,
      -this.size / 2 + this.rightArm.x - 25,
      -this.size / 2 + this.rightArm.y - 10,
      this.size,
      this.size
    );
    ctx.restore();

    //weapon

    ctx.save();
    ctx.rotate(0);
    ctx.drawImage(
      texturePlayer,
      3 * spriteWidth,
      1 * spriteHeight,
      spriteWidth,
      spriteHeight,
      -this.size / 2 + this.rightArm.x - 10,
      -this.size / 2 + this.rightArm.y - 20,
      this.size,
      this.size
    );
    ctx.restore();

    // head
    ctx.save();
    ctx.drawImage(
      texturePlayer,
      0 * spriteWidth,
      2 * spriteHeight,
      spriteWidth,
      spriteHeight,
      -this.size / 2 + 8,
      -this.size / 2 - 8,
      this.size,
      this.size
    );
    ctx.restore();

    ctx.translate(-this.pos.x, -this.pos.y);
    ctx.restore();
  }
}

class body {
  constructor(x, y, rotation) {
    this.x = x;
    this.y = y;
    this.size = 75;
    this.rotate = rotation;
    objects.push(this);
    this.velocity = 2;
    this.bloodSize = 1;
  }
  show() {
    this.x -= Math.cos(this.rotate) * this.velocity;
    this.y -= Math.sin(this.rotate) * this.velocity;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.drawImage(
      texturePlayer,
      4 * spriteWidth,
      2 * spriteHeight,
      spriteWidth,
      spriteHeight,
      this.x - this.bloodSize / 2,
      this.y - this.bloodSize / 2,
      this.bloodSize,
      this.bloodSize
    );
    ctx.fill();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate - Math.PI / 2);
    ctx.drawImage(
      texturePlayer,
      6 * spriteWidth,
      4 * spriteHeight,
      spriteWidth * 2,
      spriteHeight * 3,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    ctx.translate(-this.x, -this.y);
    ctx.restore();
    this.velocity *= 0.9;
    if (this.bloodSize < 50) {
      this.bloodSize += 0.08;
    }
  }
}

// let Garry = new Enemy(100, 100, 3);
let Garry2 = new Enemy(300, 100, 1);
let Garry3 = new Enemy(200, 100, 1);
let Garry4 = new Enemy(100, 200, 1);
let Garry5 = new Enemy(100, 300, 1);

function enemyShoot(Object, Dir) {
  if (Object.Ammo > 0) {
    Object.Ammo -= 1;
    Rays = [];
    hitObject = rayCast(Object, Dir, `${Object}`);
    if (hitObject[0] !== undefined) {
      new particle(Object.pos, hitPos, Dir, "bullet");
      new particle(Object.pos, hitPos, Dir, "casing");
    }

    hitObject[0].health -= 100;
  } else {
    console.log("Out of ammo");
  }
}

// prettier-ignore
let gameMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
];
let endPos;
function drawMap(gameMap) {
  for (let x = 0; x < gameMap.length; x++) {
    for (let y = 0; y < gameMap[0].length; y++) {
      if (gameMap[x][y] === 1) {
        new Structure(
          (canvas.width / gameMap.length) * x +
            canvas.width / gameMap.length / 2,
          (canvas.height / gameMap[0].length) * y +
            canvas.width / gameMap[0].length / 2,
          canvas.width / gameMap.length,
          canvas.height / gameMap[0].length,
          "black",
          true
        );
      } else if (gameMap[x][y] === 2) {
        new Structure(
          (canvas.width / gameMap.length) * x +
            canvas.width / gameMap.length / 2,
          (canvas.height / gameMap[0].length) * y +
            canvas.width / gameMap[0].length / 2,
          canvas.width / gameMap.length,
          canvas.height / gameMap[0].length,
          textureWood,
          false
        );
      } else if (gameMap[x][y] === 3) {
        endPos = { x: x, y: y };
      }
    }
  }
}
drawMap(gameMap);
console.log(endPos);
function throwWeapon(Object) {
  mouseDown === false;
  // Object = items[items.indexOf(Object)];
  hitObject = rayCast(Player, Dir(Player.pos, mousePos));
  if (5 === 5) {
    new particle(
      Player.pos,
      hitObject[1],
      Dir(Player.pos, mousePos),
      "throw",
      Object
    );
  }
  Player.Weapon = false;
  items.push(Object);
}

function shoot(Object, Dir) {
//   enemies.forEach((Object) => {
//     Object.spotDelay += 1;
//   }); 
  // You can Enable the thing above if you want to, I wouldnt recommend it lol.
  
  if (Object.Weapon.Ammo > 0) {
    Object.Weapon.Ammo -= 1;
    console.log(Object.Weapon.Ammo);
    Rays = [];
    hitObject = rayCast(Object, Dir, `${Object}`);
    if (hitObject[0] !== undefined) {
      new particle(Player.pos, hitPos, Dir, "bullet");
      new particle(Player.pos, hitPos, Dir, "casing");
    }

    hitObject[0].health -= 100;
  } else {
    console.log("Out of ammo");
  }
}

let Player = new Character(centerX, centerY, 40, 40);

let Map = new map();
let pistol = new weapon(10, 100, 30, centerX + 100, centerY, { x: 0, y: 1 });

// let Enemy = new Character(800, 300, 30, 30);
// let wall1 = new Structure(400, 400, 100, 20, textureCobble);
// let wall2 = new Structure(459, 360, 20, 100, textureCobble);
function collisionDetection(thisObject, positionX, positionY) {
  for (let i = 0; i < structures.length; i++) {
    let xCollision = false;
    let yCollision = false;
    const Object = structures[i];
    if (thisObject !== Object) {
      if (Object.hitBox === true) {
        if (
          positionX <
            Object.pos.x + Object.width / 2 + thisObject.collisionBoxSize / 2 &&
          positionX >
            Object.pos.x - Object.width / 2 - thisObject.collisionBoxSize / 2
        ) {
          // console.log("Collision X")
          xCollision = true;
        }
        if (
          positionY <
            Object.pos.y +
              Object.height / 2 +
              thisObject.collisionBoxSize / 2 &&
          positionY >
            Object.pos.y - Object.height / 2 - thisObject.collisionBoxSize / 2
        ) {
          // console.log("Collision Y")
          yCollision = true;
        }
        if (xCollision === true && yCollision === true) {
          return true;
        }
      }
    }
  }
  return false;
}

function moveCamera() {
  let distance = dist(Map.pos, Player.pos);
  let direction = Dir(Map.pos, Player.pos);
  let cameraSpeed = 25;
  let stepSize = distance / cameraSpeed;
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

  Object.legRotation =
    Dir(
      {
        x: Object.velocity.x + Object.pos.x,
        y: Object.velocity.y + Object.pos.y,
      },
      Object.pos
    ) -
    Math.PI / 2;

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
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});
let autoFire;
canvas.addEventListener("mousedown", function (e) {
  mouseDown = true;
  if (game === true) {
    if (Player.Weapon !== false) {
      shoot(
        Player,
        Dir(Player.pos, mousePos) + degrees_to_radians(getRndInteger(-2.5, 2.5))
      );
      autoFire = setInterval(function () {
        shoot(
          Player,
          Dir(Player.pos, mousePos) +
            degrees_to_radians(getRndInteger(-2.5, 2.5))
        );
      }, 1000 / Player.Weapon.fireRate);
    }
  }
});
canvas.addEventListener("mouseup", function (e) {
  mouseDown = false;
  if (Player.Weapon !== false || mouseDown === false) {
    clearInterval(autoFire);
  }
});

document.body.addEventListener("keydown", function (e) {
  keys[e.key] = true;
  if (game === true) {
    if (e.key === "h") {
      enemyFollowPath(Garry, pathFind(Garry.pos, Player.pos));
    }
  }
});
document.body.addEventListener("keyup", function (e) {
  keys[e.key] = false;
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

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

function drawPixel(posX, posY, color) {
  new Structure(
    (canvas.width / gameMap.length) * posX + canvas.width / gameMap.length / 2,
    (canvas.height / gameMap[0].length) * posY +
      canvas.width / gameMap[0].length / 2,
    canvas.width / gameMap.length,
    canvas.height / gameMap[0].length,
    color
  );
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

function doesInclude(parent, x, y) {
  if (parent.length === 0) {
    return false;
  }
  for (let i = 0; i < parent.length; i++) {
    const element = parent[i];
    if (element.x == x && element.y == y) {
      return true;
    }
  }
  return false;
}

//Pathfinding

let gridSize = canvas.width / gameMap.length;

let iterationsMax = 60;
function pathFind(start, goal) {
  start = {
    x: Math.round(start.x / gridSize),
    y: Math.round(start.y / gridSize),
  };
  goal = {
    x: Math.round(goal.x / gridSize),
    y: Math.round(goal.y / gridSize),
  };
  console.log(start);
  console.log(goal);
  class positionClass {
    constructor(x, y, historyInput) {
      this.x = x;
      this.y = y;
      this.history = [];
      this.history.push({ x: x, y: y });
      historyInput.forEach((Object) => {
        this.history.push(Object);
      });
    }
  }
  start = new positionClass(start.x, start.y, []);
  let branches = [];
  let searchedSpots = [];
  let nextIteration = [start];
  let iterations = 0;
  let found = false;
  let returnvar = [];
  {
    while (found === false) {
      if (iterations > iterationsMax) {
        console.log("No solution");
        return;
      }
      nextIteration.forEach((Object) => {
        branches.push(Object);
      });
      nextIteration = [];

      let len = branches.length;

      for (let i = 0; i < len; i++) {
        const branch = branches[i];
        try {
          if (doesInclude(searchedSpots, branch.x, branch.y - 1) === false) {
            if (branch.x === goal.x && branch.y - 1 === goal.y) {
              found = true;

              branch.history.forEach((Object) => {
                returnvar.push({
                  x: Object.x * gridSize + gridSize / 2,
                  y: Object.y * gridSize + gridSize / 2,
                });
                // drawPixel(Object.x, Object.y, "purple");
              });
              return returnvar;
            } else if (gameMap[branch.x][branch.y - 1] === 0) {
              searchedSpots.push(
                new positionClass(branch.x, branch.y - 1, branch.history)
              );
              nextIteration.push(
                new positionClass(branch.x, branch.y - 1, branch.history)
              );
              // drawPixel(branch.x, branch.y - 1, "yellow");
            }
          }
        } catch {}
        try {
          if (doesInclude(searchedSpots, branch.x + 1, branch.y) === false) {
            if (branch.x + 1 === goal.x && branch.y === goal.y) {
              found = true;
              branch.history.forEach((Object) => {
                returnvar.push({
                  x: Object.x * gridSize + gridSize / 2,
                  y: Object.y * gridSize + gridSize / 2,
                });
                // drawPixel(Object.x, Object.y, "purple");
              });
              return returnvar;
            } else if (gameMap[branch.x + 1][branch.y] === 0) {
              searchedSpots.push(
                new positionClass(branch.x + 1, branch.y, branch.history)
              );
              nextIteration.push(
                new positionClass(branch.x + 1, branch.y, branch.history)
              );
              // drawPixel(branch.x + 1, branch.y, "yellow");
            }
          }
        } catch {}
        try {
          if (doesInclude(searchedSpots, branch.x, branch.y + 1) === false) {
            if (branch.x === goal.x && branch.y + 1 === goal.y) {
              found = true;
              branch.history.forEach((Object) => {
                returnvar.push({
                  x: Object.x * gridSize + gridSize / 2,
                  y: Object.y * gridSize + gridSize / 2,
                });
                // drawPixel(Object.x, Object.y, "purple");
              });
              return returnvar;
            } else if (gameMap[branch.x][branch.y + 1] === 0) {
              searchedSpots.push(
                new positionClass(branch.x, branch.y + 1, branch.history)
              );
              nextIteration.push(
                new positionClass(branch.x, branch.y + 1, branch.history)
              );
              // drawPixel(branch.x, branch.y + 1, "yellow");
            }
          }
        } catch {}
        try {
          if (doesInclude(searchedSpots, branch.x - 1, branch.y) === false) {
            if (branch.x - 1 === goal.x && branch.y === goal.y) {
              found = true;
              branch.history.forEach((Object) => {
                returnvar.push({
                  x: Object.x * gridSize + gridSize / 2,
                  y: Object.y * gridSize + gridSize / 2,
                });
                // drawPixel(Object.x, Object.y, "purple");
              });
              return returnvar;
            } else if (gameMap[branch.x - 1][branch.y] === 0) {
              searchedSpots.push(
                new positionClass(branch.x - 1, branch.y, branch.history)
              );
              nextIteration.push(
                new positionClass(branch.x - 1, branch.y, branch.history)
              );
              // drawPixel(branch.x - 1, branch.y, "yellow");
            }
          }
        } catch {}
      }
      iterations++;
      branches = [];
    }
  }
}

function drawPath() {
  lines = [];
  let linePoints = pathFind(Player.pos, Garry.pos);
  for (let i = 0; i < linePoints.length; i++) {
    if (i < linePoints.length - 1) {
      new Line(
        linePoints[i].x,
        linePoints[i].y,
        linePoints[i + 1].x,
        linePoints[i + 1].y
      );
    }
  }
}
function enemyFollowPath(enemy, goal) {
  if (enemy.walking === false) {
    path = pathFind(enemy.pos, goal.pos);
    enemy.walking = true;
    let step = path.length - 1;
    walking = setInterval(function () {
      if (dist(enemy.pos, path[0]) < 10) {
        clearInterval(walking);
        enemy.walking = false;
      }
      let direction = Dir(enemy.pos, path[step]);
      enemy.direction = direction;
      enemy.movementDegree += 0.1;
      if (dist(enemy.pos, path[step]) < 10) {
        step--;
      }
      if (
        collisionDetection(
          enemy,
          enemy.pos.x,
          enemy.pos.y + Math.sin(direction) * enemy.speed
        ) === false
      ) {
        enemy.pos.y += Math.sin(direction) * enemy.speed;
      }

      if (
        collisionDetection(
          enemy,
          enemy.pos.x + Math.cos(direction) * enemy.speed,
          enemy.pos.y
        ) === false
      ) {
        enemy.pos.x += Math.cos(direction) * enemy.speed;
      }
    }, 10);
  } else {
    return;
  }
}

function update() {
  requestAnimationFrame(update);

  if (game === true) {
    if (keys["w"] || keys["a"] || keys["s"] || keys["d"]) {
      Player.movementDegree += 0.1;
    } else {
      Player.movementDegree = 0;
    }
    // drawPath();
    mousePos = {
      x: mouse.x + translateAmountX,
      y: mouse.y + translateAmountY,
    };

    moveCharacter(Player, 0.93);
    moveCamera();
    delay++;
  }

  if (game === false) {
    ctx.save();
    ctx.filter = "blur(4px)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    Map.show();
    ctx.restore();
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.font = "60px Courier New";
    ctx.fillText("GAME OVER!", centerX, centerY);
  } else {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    Map.show();
  }

  if (game === false) {
  }
}
update();
