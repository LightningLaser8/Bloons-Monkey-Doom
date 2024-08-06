const grasslands = {
  displayName: "Grasslands",
  difficulty: 0,
  defaultTrack: 0,
  numOfTracks: 1,
  background: "map1",
  tracks: [
    {
      points: [
        { x: 85, y: 800 },
        { x: 85, y: 202 },
        { x: 662, y: 202 },
        { x: 662, y: 347 },
        { x: 410, y: 347 },
        { x: 410, y: 0 },
      ],
    },
  ],
  difficulties: [
    {
      lastRound: 2, //actually round 3
      reward: 10,
      perRoundCashBonus: 100,
      rounds: [
        {
          lives: 10,
          towers: [
            {
              type: "test_tower",
              x: 122,
              y: 238,
              effect: "place"
            },
            {
              type: "test_sniper",
              x: 563,
              y: 105,
              target: "strong",
              effect: "place"
            },
          ],
        },
        {
          lives: 20,
          towers: [
            {
              type: "test_tower",
              x: 122,
              y: 238,
            },
            {
              type: "test_sniper:1",
              x: 563,
              y: 105,
              target: "strong",
              effect: "upgrade"
            },
          ],
        },
        {
          lives: 30,
          towers: [
            {
              type: "test_tower",
              x: 122,
              y: 238,
            },
            {
              type: "test_sniper:2",
              x: 563,
              y: 105,
              target: "strong",
              effect: "upgrade"
            },
          ],
        }
      ],
    }
  ]
}
mapRegistry.add("grasslands", grasslands)
mapRegistry.add("grasslands2", grasslands)
mapRegistry.add("grasslands3", grasslands)
mapRegistry.add("grasslands4", grasslands)
mapRegistry.add("grasslands5", grasslands)
mapRegistry.add("grasslands6", grasslands)
mapRegistry.add("grasslands7", grasslands)
mapRegistry.add("grasslands8", grasslands)