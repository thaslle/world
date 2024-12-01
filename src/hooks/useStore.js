import { create } from "zustand";

// const debug = localStorage.getItem("debug");
// const physics = localStorage.getItem("physics");
const debug = false;
const physics = false;

export const useStore = create((set) => ({
  playerPosition: null,
  debug: debug ? true : false,
  physics: physics ? true : false,

  characterState: "Idle",
  setCharacterState: (characterState) =>
    set({
      characterState,
    }),

  setDebug: () =>
    set((state) => {
      const updateDebug = !state.debug;
      //localStorage.setItem("debug", updateDebug); // Update localStorage
      return { debug: updateDebug };
    }),
  setPhysics: () =>
    set((state) => {
      const updatePhysics = !state.physics;
      //localStorage.setItem("physics", updatePhysics); // Update localStorage
      return { physics: updatePhysics };
    }),
}));
