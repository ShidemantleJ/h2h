// Events list from: https://github.com/coder13/LetsCube/blob/7c1656a3100fdd1a773070d03cd5ab25694fa8e0/client/src/lib/events.js

const Events = [
  {
    id: "333",
    scrambler: "333",
    name: "3x3",
    group: "WCA",
  },
  {
    id: "222",
    scrambler: "222",
    name: "2x2",
    group: "WCA",
  },
  {
    id: "444",
    scrambler: "444",
    name: "4x4",
    group: "WCA",
  },
  {
    id: "555",
    scrambler: "555",
    name: "5x5",
    group: "WCA",
  },
  {
    id: "666",
    scrambler: "666",
    name: "6x6",
    group: "WCA",
  },
  {
    id: "777",
    scrambler: "777",
    name: "7x7",
    group: "WCA",
  },
  {
    id: "333bf",
    scrambler: "333",
    name: "3x3 Blindfolded",
    group: "WCA",
  },
  {
    id: "333oh",
    scrambler: "333",
    name: "3x3 One-Handed",
    group: "WCA",
  },
  {
    id: "333ft",
    scrambler: "333",
    name: "3x3 With Feet",
    group: "WCA",
  },
  {
    id: "minx",
    scrambler: "minx",
    name: "Megaminx",
    group: "WCA",
  },
  {
    id: "pyram",
    scrambler: "pyram",
    name: "Pyraminx",
    group: "WCA",
  },
  {
    id: "clock",
    scrambler: "clock",
    name: "Clock",
    group: "WCA",
  },
  {
    id: "skewb",
    scrambler: "skewb",
    name: "Skewb",
    group: "WCA",
  },
  {
    id: "sq1",
    scrambler: "sq1",
    name: "Square-1",
    group: "WCA",
  },
  {
    id: "444bf",
    scrambler: "444",
    name: "4x4 Blindfolded",
    group: "WCA",
  },
  {
    id: "555bf",
    scrambler: "555",
    name: "5x5 Blindfolded",
    group: "WCA",
  },
  {
    id: "fto",
    scrambler: "fto",
    name: "FTO",
    group: "Other",
  },
];

const getEventNameFromId = (eventId) => Events.find((e) => e.id === eventId).name;

export { Events, getEventNameFromId };
