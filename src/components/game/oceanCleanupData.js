export const GAME_DURATION = 45;
export const STARTING_LIVES = 3;
export const MAX_TRASH = 6;
export const BEST_SCORE_KEY = "hawk-ai:ocean-cleanup-best-score";

export const GAME_IMAGES = Object.freeze({
  ready: "/images/game/hoki-cleanup-ready-animated.gif",
  success: "/images/game/hoki-collection-success-animated.gif",
  missed: "/images/game/hoki-collection-missed-animated.gif",
  particles: "/images/game/collection-success-particles.gif",
  bin: "/images/game/ocean-waste-bin.png",
});

export const TRASH_TYPES = Object.freeze([
  { type: "buoy", image: "/images/game/trash-buoy.png", score: 100 },
  { type: "net", image: "/images/game/trash-discarded-net.png", score: 150 },
  { type: "rope", image: "/images/game/trash-discarded-rope.png", score: 150 },
  { type: "glass", image: "/images/game/trash-glass.png", score: 100 },
  { type: "metal", image: "/images/game/trash-metal.png", score: 100 },
  { type: "pet-bottle", image: "/images/game/trash-pet-bottle.png", score: 100 },
  { type: "plastic", image: "/images/game/trash-plastic.png", score: 100 },
  { type: "styrofoam", image: "/images/game/trash-styrofoam-box.png", score: 100 },
]);
