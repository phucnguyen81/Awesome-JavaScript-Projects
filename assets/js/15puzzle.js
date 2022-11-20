// The box component
class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === 3) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 3) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox(),
    ].filter((box) => box !== null);
  }

  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
};

const isSolved = (grid) => {
  return (
    grid[0][0] === 1 &&
    grid[0][1] === 2 &&
    grid[0][2] === 3 &&
    grid[0][3] === 4 &&
    grid[1][0] === 5 &&
    grid[1][1] === 6 &&
    grid[1][2] === 7 &&
    grid[1][3] === 8 &&
    grid[2][0] === 9 &&
    grid[2][1] === 10 &&
    grid[2][2] === 11 &&
    grid[2][3] === 12 &&
    grid[3][0] === 13 &&
    grid[3][1] === 14 &&
    grid[3][2] === 15 &&
    grid[3][3] === 0
  );
};

const getRandomGrid = () => {
  let grid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ];

  //Shuffle
  let blankBox = new Box(3, 3);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  if (isSolved(grid)) return getRandomGrid();
  return grid;
};

/**
 * Immutable state of the game representing the following data:
 * 1. grid: the 4x4 grid of the game, 0 means empty cell
 * 2. move: total moves the user made so far
 * 3. time: number of seconds since the game started
 * 4. status: ready, playing, or won
 */
class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  /**
   * Get the initial state of the game before it is started.
   *
   * At this state, the game board is empty, no moves have
   * been made and the timer has not started.
   *
   * @returns the initial state of the game
   */
  static ready() {
    return new State(
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      0,
      0,
      "ready"
    );
  }

  /**
   * Get the start state of game, e.g. after the user clicks "Play".
   *
   * At this state, the grid contains random distinct numbers from 1 to 15,
   * no moves have been made, timer starts at 0 and counting.
   *
   * @returns the start state of the game
   */
  static start() {
    return new State(getRandomGrid(), 0, 0, "playing");
  }
}

/**
 * Wrapper for the DOM.
 */
class GameUI {
	constructor(doc) {
		this.doc = doc;
	}

	createButton(textContent, clickListener) {
		const button = this.doc.createElement("button");
		button.textContent = textContent || "";
		if (clickListener) {
			button.addEventListener("click", clickListener);
		}
		return button;
	}

	createFooterButton(textContent, clickListener) {
		const button = this.createButton(textContent, clickListener);
		this.doc.querySelector(".footer button").replaceWith(button);
		return button;
	}

	createGrid(buttons) {
		const newGrid = this.doc.createElement("div");
		newGrid.className = "grid";
		buttons.forEach(button => {
			newGrid.appendChild(button)
		});
		this.doc.querySelector(".grid").replaceWith(newGrid);
		return newGrid;
	}

	setMove(move) {
		this.doc.getElementById("move").textContent = `Move: ${move}`;
	}

	setTime(time) {
		this.doc.getElementById("time").textContent = `Time: ${time}`;
	}

	setMessage(message) {
		document.querySelector(".message").textContent = message;
	}

}

/**
 * The top component of the game.
 *
 * The game is modelled as a state machine as follows:
 * 1. On each timer tick, render the entire game
 * 2. On each click on a box, if it is next to a blank box, move the number
 * 		to the blank box
 *
 * NOTE: because the game is rendered on each timer tick (1 second in this
 * case), there might be a lag between a click and seeing the change.
 */
class Game {

	/**
	 * Initialize a new game.
	 * 
	 * @param {GameUI} ui : the game ui
	 */
  constructor(ui) {
		this.ui = ui;
    this.state = State.ready();
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  tick() {
    this.setState({
      time: this.state.time + 1,
    });
  }

  setState(newState) {
    this.state = {
      ...this.state,
      ...newState,
    };
    this.render();
  }

  /**
   * Handle a click on a box.
   *
   * When clicked, move the number to the blank box if it is next
   * to the current box.
   *
   * @param {Box} box: the box being clicked on
   * @returns the handler function
   */
  handleClickBox(box) {
    return function () {
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        (nextdoorBox) => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        swapBoxes(newGrid, box, blankBox);

        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            grid: newGrid,
            move: this.state.move + 1,
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1,
          });
        }
      }
    }.bind(this);
  }

  /**
   * Render the game's state to UI.
   */
  render() {
    const { grid, move, time, status } = this.state;

    // Render grid
		const buttons = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
				const textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
        const button = this.ui.createButton(
					textContent,
					status == "playing" ? this.handleClickBox(new Box(j, i)): null
				);
				buttons.push(button);
      }
    }
		this.ui.createGrid(buttons);

    // Render button
		let textContent = "";
    if (status === "ready") textContent = "play";
    if (status === "playing") textContent = "reset";
    if (status === "won") textContent = "play";
    this.ui.createFooterButton(
			textContent,
			() => {
				clearInterval(this.tickId);
				this.tickId = setInterval(this.tick, 1000);
				this.setState(State.start());	
			}
		);

    // Render move
		this.ui.setMove(move);

    // Render Time
		this.ui.setTime(time);

    // Render Message
    if (status === "won") {
			this.ui.setMessage("You win!");
    } else {
			this.ui.setMessage("");
    }
  }
}

new Game(new GameUI(document));  // Init the game
