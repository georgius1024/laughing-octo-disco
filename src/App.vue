<template>
  <div class="layout">
    <aside class="picker">
      <DemoBlock
        v-for="(item, index) in pickerItems"
        :id="item.id"
        :x="100 - 3"
        :y="50 + index * 100"
        :size="nodeSize"
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
      <h1>Vue tree plotting demo</h1>
      <button @click="clear">
        <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
          />
        </svg>
      </button>

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
          left: `${(step - 1) * sceneStepX + sceneOffsetX}px`,
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
          top: `${(step - 1) * sceneStepY + sceneOffsetY}px`,
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
          :x="gridToCanvasX(item.x)"
          :y="gridToCanvasY(item.y)"
          :size="nodeSize"
          :color="item.color"
          :content="item.content"
          :key="item.id"
          :leftConnection="connectionPoint(item.left)"
          :rightConnection="connectionPoint(item.right)"
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
import ReingoldTilford from "./utils/ReingoldTilford";

const GRID_STEP_X = 100;
const GRID_STEP_Y = 120;
const GRID_OFFSET_X = 100;
const GRID_OFFSET_Y = 100;

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
      return ReingoldTilford(this.scene, 101);
    },
    map() {
      return this.scene.reduce((map, item) => {
        map[item.id] = item;
        return map;
      }, {});
    },
    nodeSize() {
      return 80;
    },
    sceneOffsetX() {
      return GRID_OFFSET_X;
    },
    sceneOffsetY() {
      return GRID_OFFSET_Y;
    },
    sceneStepX() {
      return GRID_STEP_X;
    },
    sceneStepY() {
      return GRID_STEP_Y;
    },
    nextId() {
      return this.scene.reduce((max, item) => {
        if (max > item.id) {
          return max;
        }
        return item.id + 1;
      }, 101);
    },
    pickerItems() {
      return [
        {
          id: nanoid(),
          color: "red",
          content: "🐵",
        },
        {
          id: nanoid(),
          color: "navy",
          content: "🦑",
        },
        {
          id: nanoid(),
          color: "yellow",
          content: "🐶",
        },
        {
          id: nanoid(),
          color: "darkmagenta",
          content: "🐱",
        },
        {
          id: nanoid(),
          color: "green",
          content: "🐥",
        },
        {
          id: nanoid(),
          color: "purple",
          content: "🐮",
        },
      ];
    },
    initialScene() {
      return [
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
    },
  },
  mounted() {
    const { scrollWidth, scrollHeight } = this.$refs.canvas;
    this.maxCol = Math.ceil((scrollWidth - 2 * GRID_OFFSET_X) / GRID_STEP_X);
    this.maxRow = Math.ceil((scrollHeight - 2 * GRID_OFFSET_Y) / GRID_STEP_Y);

    this.history = initialize([]);

    try {
      const scene = JSON.parse(localStorage["scene"]);
      if (Array.isArray(scene)) {
        this.history = initialize(scene);
      }
    } catch {
      this.history = initialize(this.initialScene);
    }
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
    clear() {
      this.history = initialize(this.initialScene);
    },
    gridToCanvasX(col) {
      return col * this.sceneStepX + this.sceneOffsetX - this.nodeSize / 2;
    },
    gridToCanvasY(row) {
      return row * this.sceneStepY + this.sceneOffsetY - this.nodeSize / 2;
    },
    connectionPoint(id) {
      const node = this.tree[id];
      if (node) {
        return {
          x: node.x * this.sceneStepX + this.sceneOffsetX,
          y: node.y * this.sceneStepY + this.sceneOffsetY - this.nodeSize / 2,
        };
      }
    },
    snapToGrid(x, y) {
      const col = +Math.round((x - GRID_OFFSET_X) / GRID_STEP_X);
      const row = +Math.round((y - GRID_OFFSET_Y) / GRID_STEP_Y);
      return { col, row };
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
      const parent = Object.values(this.tree).find((item) => {
        return item.x === col && item.y === row;
      });
      if (!parent) {
        return;
      }
      const pickerItem = this.pickerItems.find((e) => e.id === id);
      if (pickerItem) {
        return this.placeNewNode(parent, pickerItem);
      }
      const sceneItem = this.scene.find((e) => e.id === +id);
      if (sceneItem) {
        return this.moveNode(parent, sceneItem);
      }
    },
    onDelete(event) {
      const id = +event.dataTransfer.getData("id");
      const parent = this.scene.find((e) => e.left === id || e.right === id);
      if (!parent) {
        // Error - root deletion
        return;
      }
      if (parent.left === id) {
        this.deleteSubtree(parent, true);
      }
      if (parent.right === id) {
        this.deleteSubtree(parent, false);
      }
    },
    placeNewNode(parent, pickerItem) {
      const parentId = parent.id;
      if (parent.left && parent.right) {
        // Error - parent is full
        return false;
      }
      const node = {
        ...pickerItem,
        id: this.nextId,
        parent: parentId,
      };
      if (parent.left) {
        parent.right = node.id;
      } else {
        parent.left = node.id;
      }
      const scene = [
        ...this.scene.map((e) => (e.id === parentId ? parent : e)),
        node,
      ];
      this.updateScene(scene);
    },
    hasAsParent(node, parent) {
      if (node.parent === parent.id) {
        return true;
      }
      const currentParent = this.map[node.parent];
      return currentParent && this.hasAsParent(currentParent, parent);
    },
    moveNode(parent, node) {
      if (parent.left && parent.right) {
        // Error - parent full
        return;
      }
      if (parent.id === node.id) {
        // Error - can not be child for himself
        return;
      }
      if (parent.id === node.parent) {
        // Error - closest parent can not be target
        return;
      }
      if (this.hasAsParent(parent, node)) {
        // Error - can not be parent for himself
        return;
      }
      const scene = this.scene.map((e) => {
        if (e.id === node.id) {
          return { ...e, parent: parent.id };
        } else if (e.id === parent.id) {
          if (e.left) {
            return { ...e, right: node.id };
          } else {
            return { ...e, left: node.id };
          }
        } else if (e.id === node.parent) {
          if (e.left === node.id) {
            return { ...e, left: undefined };
          } else {
            return { ...e, right: undefined };
          }
        }
        return e;
      });
      this.updateScene(scene);
    },
    deleteSubtree(parent, left) {
      const nodesToDelete = [];
      const startFrom = left ? parent.left : parent.right;
      const walk = (node) => {
        if (node.left) {
          walk(this.map[node.left]);
        }
        if (node.right) {
          walk(this.map[node.right]);
        }
        nodesToDelete.push(node.id);
      };
      walk(this.map[startFrom]);
      const newParent = { ...parent };
      if (left) {
        delete newParent.left;
      } else {
        delete newParent.right;
      }
      const scene = this.scene
        .filter((e) => !nodesToDelete.includes(e.id))
        .map((e) => (e.id === parent.id ? newParent : e));
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
  overflow-y: auto;
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
  overflow-y: auto;
}
</style>
