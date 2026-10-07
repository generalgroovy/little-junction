# Little Junction

Turn three junctions and guide little carts to their matching stations. Time moves only when you choose.

## Play locally

Run `python -m http.server 8000` in this folder, then open http://localhost:8000/. No install or build step. Use `npm test` for model tests and `npm run check` for syntax checks (Node22+).

Click or keyboard-activate a junction to change its outgoing track. **Step time** moves each cart one edge and admits the next waiting cart. A cart waits when its next junction is occupied. Station symbols and names accompany colors. Sun needs the upper branch, Leaf the lower; Moon accepts either. Four authored arrival waves are available from Route. Every wave is verified solvable by the model tests.

**Play slowly** steps every1.4seconds; Pause, manual Step or leaving the tab stops automatic stepping. Wrong deliveries stop playback and remain counted. **Undo** recovers a step, routing change, reset or level change (up to150actions). Start again keeps the same arrival order. Closing/reloading starts a new game; there is no saved progress, account or network connection.

## How it works

The pure model is a small deterministic directed network. Each node holds at most one cart. Carts nearest exits move first, with arrival order as a tie breaker. Movement never grants a cart multiple edges in one step. Terminals count deliveries once. This is a routing puzzle, not a real traffic-capacity simulation.

An original companion to Send It, taking its interest in readable transport decisions into a discrete track-switching puzzle. All source and visuals are newly implemented. Future depth could include authored map editing, a schedule recorder and alternate junction networks; those are not shipped here.
