<template>
  <div class="layout">
    <aside class="picker">
      <DemoBlock
        v-for="(item, index) in pickerItems"
        :id="item.id"
        :x="100 - 3"
        :y="50 + index * 120"
        :size="80"
        :color="item.color"
        :content="item.content"
        :key="item.id"
      />
      <div class="separator"></div>
      <div
        class="trash-can"
        @drop="onDelete"
        @dragover.prevent
        @dragenter.prevent
        v-text="'🗑️'"
      />
    </aside>
    <header class="header">
      <h1>Vue ...ing demo</h1>
      <button @click="undo" :disabled="!undoable">
        <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z"
          />
        </svg>
      </button>
      <button @click="redo" :disabled="!redoable">
        <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z"
          />
        </svg>
      </button>
    </header>
    <main
      class="canvas"
      ref="canvas"
      @drop="onDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <span
        v-for="step in 20"
        :key="step"
        :style="{
          position: 'absolute',
          left: `${(step - 1) * 100 + 100}px`,
          borderLeft: '1px solid black',
        }"
      >
        {{ step }}
      </span>
      <span
        v-for="step in 10"
        :key="step"
        :style="{
          position: 'absolute',
          top: `${(step - 1) * 100 + 100}px`,
          transform: 'rotate(-90deg)',
          borderRight: '1px solid black',
          paddingTop: '6px',
        }"
      >
        {{ step }}
      </span>
      <template v-if="history">
        <TreeNode
          v-for="item in tree"
          :id="item.id"
          :x="item.x"
          :y="item.y"
          :dx="100"
          :dy="100"
          :size="80"
          :color="item.color"
          :content="item.content"
          :key="item.id"
          :t="tree"
          :left="tree"
          :right1="item.right"
        />
      </template>
    </main>
  </div>
</template>
<script>
import { nanoid } from "nanoid";
import DemoBlock from "./components/DemoBlock.vue";
import TreeNode from "./components/TreeNode.vue";
import {
  initialize,
  addState,
  getCurrent,
  undoable,
  redoable,
  undo,
  redo,
} from "./utils/history";
import ReingildTilford from "./utils/ReingildTilford";

const GRID_STEP = 100;
const OFFSET = 100;
export default {
  components: {
    DemoBlock,
    TreeNode,
  },
  data() {
    return {
      history: null,
      maxCol: 0,
      maxRow: 0,
    };
  },
  computed: {
    scene() {
      return this.history ? getCurrent(this.history) : [];
    },
    undoable() {
      return Boolean(this.history && undoable(this.history));
    },
    redoable() {
      return Boolean(this.history && redoable(this.history));
    },
    hasUnsavedChanges() {
      return this.undoable;
    },
    tree() {
      return ReingildTilford(this.scene, 101);
    },
    grid() {
      return this.scene.reduce((map, item) => {
        if (!map[item.x]) {
          map[item.x] = [];
        }
        map[item.x][item.y] = item;
      }, {});
    },
    pickerItems() {
      return [
        {
          id: 101,
          color: "red",
          content: "🐵",
        },
        {
          id: 102,
          color: "navy",
          content: "🦑",
        },
        {
          id: 103,
          color: "yellow",
          content: "🐶",
        },
        {
          id: 104,
          color: "darkblue",
          content: "🐱",
        },
      ];
    },
  },
  mounted() {
    const { scrollWidth, scrollHeight } = this.$refs.canvas;
    this.maxCol = Math.ceil((scrollWidth - 2 * OFFSET) / GRID_STEP);
    this.maxRow = Math.ceil((scrollHeight - 2 * OFFSET) / GRID_STEP);

    this.history = initialize([]);

    try {
      const scene = JSON.parse(localStorage["scene"]);
      if (Array.isArray(scene)) {
        this.history = initialize(scene);
      }
    } catch {
      this.history = initialize([]);
    }
    const initialScene = [
      {
        id: 101,
        color: "red",
        content: "🐵",
        parent: null,
        left: 102,
        right: 103,
      },
      {
        id: 102,
        parent: 101,
        color: "navy",
        content: "🦑",
        right: 104,
      },
      {
        id: 103,
        parent: 101,
        color: "yellow",
        content: "🐶",
      },
      {
        id: 104,
        parent: 102,
        color: "darkblue",
        content: "🐱",
      },
    ];
    this.history = initialize(initialScene);
    this.keyHandler = (e) => {
      const editing = e.target.getAttribute("contenteditable") === "true";
      if (editing) {
        return;
      }
      const undoPressed =
        (e.code === "KeyZ" && e.ctrlKey) ||
        (e.code === "Backspace" && e.ctrlKey);
      const redoPressed = e.code === "KeyY" && e.ctrlKey;
      if (undoPressed && this.undoable) {
        this.undo();
        e.stopPropagation();
      }
      if (redoPressed && this.redoable) {
        this.redo();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", this.keyHandler);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyHandler);
  },
  methods: {
    save() {
      localStorage["scene"] = JSON.stringify(this.scene);
    },
    updateScene(scene) {
      this.history = addState(this.history, scene);
      this.save();
    },
    undo() {
      this.history = undo(this.history);
      this.save();
    },
    redo() {
      this.history = redo(this.history);
      this.save();
    },
    gridToCanvas(col, row) {
      const x = col * GRID_STEP + OFFSET;
      const y = row * GRID_STEP + OFFSET;
      return { x, y };
    },
    snapToGrid(x, y) {
      const col = Math.round((x - OFFSET) / GRID_STEP);
      const row = Math.round((y - OFFSET) / GRID_STEP);
      return { col, row };
    },
    placeAt(x, y, item) {
      const grid = this.scene.reduce((grid, item) => {
        if (!grid[item.x]) {
          grid[item.x] = {};
        }
        grid[item.x][item.y] = item;
        return grid;
      }, {});
      const at = (x, y) => {
        return grid[x] && grid[x][y];
      };
      const put = (x, y, item) => {
        if (!grid[x]) {
          grid[x] = {};
        }
        grid[x][y] = { ...item, x, y };
      };
      const currentAt = at(x, y);
      if (this.scene.length === 0) {
        put(0, 0, item);
        return true;
      } else if (currentAt) {
      }
      // if (currentAt && currentAt.id !== item.id) {
      //   if (!at(x + 1, y) && x < this.maxCol - 1) {
      //     put(x + 1, y, currentAt);
      //   } else if (!at(x - 1, y) && x > 0) {
      //     put(x - 1, y, currentAt);
      //   } else if (!at(x, y + 1) && y < this.maxRow - 1) {
      //     put(x, y + 1, currentAt);
      //   } else if (!at(x, y - 1) && y > 0) {
      //     put(x, y - 1, currentAt);
      //   } else {
      //     return false;
      //   }
      // }
      // if (at(item.x, item.y)) {
      //   grid[item.x][item.y] = null;
      // }
      put(x, y, item);
      const scene = Object.values(grid)
        .filter(Boolean)
        .reduce((list, items) => {
          return [...list, ...Object.values(items)].filter(Boolean);
        }, []);
      this.updateScene(scene);
      return true;
    },
    onDrop(event) {
      const { offsetLeft, offsetTop, scrollLeft, scrollTop } =
        this.$refs.canvas;
      const id = event.dataTransfer.getData("id");
      const coords = {
        x: event.pageX - offsetLeft + scrollLeft,
        y: event.pageY - offsetTop + scrollTop,
      };
      const { row, col } = this.snapToGrid(coords.x, coords.y);
      if (
        col < 0 ||
        col > this.maxCol - 1 ||
        row < 0 ||
        row > this.maxRow - 1
      ) {
        return;
      }

      if (+id) {
        const pickerItem = this.pickerItems.find((e) => e.id === +id);
        if (pickerItem) {
          this.placeAt(col, row, {
            ...pickerItem,
            id: nanoid(),
            x: col,
            y: row,
          });
        }
      } else {
        const sceneItem = this.scene.find((e) => e.id === id);
        this.placeAt(col, row, sceneItem);
      }
    },
    onDelete(event) {
      const id = event.dataTransfer.getData("id");
      if (+id) {
        return;
      }
      const scene = this.scene.filter((e) => e.id !== id);
      this.updateScene(scene);
    },
  },
};
</script>
<style lang="scss">
* {
  margin: 0;
  padding: 0;
  font-size: 16px;
  box-sizing: border-box;
}
.separator {
  flex-grow: 1;
}

.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas: "header header" "sidebar main";
  width: 100vw;
  height: 100vh;
}
.header {
  grid-area: header;
  display: flex;
  align-items: center;
  background-color: #ccc7;
  h1 {
    flex-grow: 1;
    font-size: 21px;
    font-weight: 400;
    text-align: center;
  }
  button {
    border-radius: 100%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    width: 32px;
    height: 32px;
    margin: 32px;
    color: #333;
    cursor: pointer;
    &:disabled {
      background-color: #ccc7;
      color: #3337;
    }
  }
}
.picker {
  grid-area: sidebar;
  background-color: aqua;
  border-right: 6px solid #333;
  cursor: default;
  position: relative;
  display: flex;
  flex-direction: column;
  .trash-can {
    height: 200;
    font-size: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.canvas {
  grid-area: main;
  position: relative;
  background-color: #ccc;
  display: flex;
  overflow-y: hidden;
}
</style>
