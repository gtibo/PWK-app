export const vehicle_model = {
  sheet_size: {
    w: 14.85,
    h: 21
  },
  parts: [{
      name: "body",
      x: 1.675,
      y: 1.2378,
      w: 11.5,
      h: 11.5,
      anchors: [{
        name: "Center",
        x: .5,
        y: .5
      }, {
        name: "Left wheel",
        x: .2,
        y: .5
      }, {
        name: "Right wheel",
        x: .8,
        y: .5
      }]
    },
    {
      name: "Left wheel",
      x: 1.6,
      y: 13.2,
      w: 5.5,
      h: 5.5,
      anchors: [{
        name: "Wheel Center",
        x: .5,
        y: .5
      }]
    },
    {
      name: "Right wheel",
      x: 7.68,
      y: 13.2,
      w: 5.5,
      h: 5.5,
      anchors: [{
        name: "Wheel Center",
        x: .5,
        y: .5
      }]
    }
  ]
};
