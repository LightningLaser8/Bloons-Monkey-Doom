function roundNum(num, dp = 0) {
  return Math.round(num * 10 ** dp) / 10 ** dp;
}

function rnd(a, b) {
  if (b > a) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  } else {
    return Math.floor(Math.random() * (a - b + 1)) + b;
  }
}

function rndScl(a, b, scl) {
  return rnd(a * scl, b * scl) / scl;
}

function degToRad(degrees) {
  return (degrees / 180) * Math.PI;
}

function radToDeg(radians) {
  return (radians / Math.PI) * 180;
}

/**Get a shorter number e.g. 12850 -> 1.29k*/
function shorten(num = 0) {
  //Goes up to a decillion (1 000 000 000 000 000 000 000 000 000 000) No-one will ever need that many, so it should be enough.
  const sizes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];
  let exponential = num.toExponential();
  let parts = exponential.split("e");
  let shownNum = parseFloat(parts[0].substring(0, 4)); //Only use first 3 digits
  let poT = parseInt(parts[1]);
  let sizeIndex = Math.max(0, Math.floor(poT / 3));
  let shownNumSize = poT % 3;
  return `${roundNum(shownNum * 10 ** shownNumSize, 2)}${sizes[sizeIndex]??"<?>"}`;
}

export {
  radToDeg,
  degToRad,
  rnd,
  rndScl,
  roundNum,
  shorten
}