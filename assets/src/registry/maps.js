mapRegistry.add("grasslands", {
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
  towers: [
    [
      {
        type: "test_tower",
        x: 122,
        y: 238,
      },
      {
        type: "test_sniper:2",
        x: 563,
        y: 105,
        target: "strong"
      },
    ],
  ],
})