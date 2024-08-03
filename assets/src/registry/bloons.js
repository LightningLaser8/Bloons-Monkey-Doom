class DrawBloon extends DrawImage {
  constructor(bloon, width, height) {
    super(bloon, width, height);
  }
  update() {
    this.image = images.bloons[this.image] ?? noTextureError;
  }
}

const baseSpeed = 1.2;
//normal bloons 25x32, size 10
//small bloons 15x18, size 7
bloonRegistry.add(
  "red",
  new BloonType(
    "red",
    0,
    1,
    baseSpeed,
    new DrawBloon("red", 25, 32),
    10,
    null,
    0
  )
);
bloonRegistry.add(
  "blue",
  new BloonType(
    "blue",
    1,
    1,
    baseSpeed * 1.4,
    new DrawBloon("blue", 25, 32),
    10,
    "red",
    1
  )
);
bloonRegistry.add(
  "green",
  new BloonType(
    "green",
    2,
    1,
    baseSpeed * 1.8,
    new DrawBloon("green", 25, 32),
    10,
    "blue",
    1
  )
);
bloonRegistry.add(
  "yellow",
  new BloonType(
    "yellow",
    3,
    1,
    baseSpeed * 3.2,
    new DrawBloon("yellow", 25, 32),
    10,
    "green",
    1
  )
);
bloonRegistry.add(
  "pink",
  new BloonType(
    "pink",
    4,
    1,
    baseSpeed * 3.5,
    new DrawBloon("pink", 25, 32),
    10,
    "yellow",
    1
  )
);
bloonRegistry.add(
  "black",
  new BloonType(
    "black",
    5,
    1,
    baseSpeed * 1.8,
    new DrawBloon("black", 15, 18),
    7,
    "pink",
    2
  )
);
bloonRegistry.add(
  "white",
  new BloonType(
    "white",
    5,
    1,
    baseSpeed * 2,
    new DrawBloon("white", 15, 18),
    7,
    "pink",
    2
  )
);
bloonRegistry.add(
  "purple",
  new BloonType(
    "purple",
    5,
    1,
    baseSpeed * 3,
    new DrawBloon("purple", 25, 32),
    10,
    "pink",
    2
  )
);
bloonRegistry.add(
  "zebra",
  new BloonType(
    "zebra",
    6,
    1,
    baseSpeed * 1.8,
    new DrawBloon("zebra", 25, 32),
    10,
    "white",
    2
  )
);
bloonRegistry.add(
  "lead",
  new BloonType(
    "lead",
    6,
    1,
    baseSpeed,
    new DrawBloon("lead", 25, 32),
    10,
    "black",
    2
  )
);
bloonRegistry.add(
  "rainbow",
  new BloonType(
    "rainbow",
    7,
    1,
    baseSpeed * 2.2,
    new DrawBloon("rainbow", 25, 32),
    10,
    "zebra",
    2
  )
);
bloonRegistry.add(
  "ceramic",
  new BloonType(
    "ceramic",
    8,
    10,
    baseSpeed * 2.5,
    new DrawBloon("ceramic", 25, 32),
    10,
    "rainbow",
    2
  )
);
