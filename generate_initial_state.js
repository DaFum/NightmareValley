const tiles = {};
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    const id = `tile_${x}_${y}`;
    tiles[id] = {
      id,
      position: { x, y },
      terrain: "wasteland",
    };
  }
}
console.log(JSON.stringify(tiles, null, 2));
