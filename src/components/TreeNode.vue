<template>
  <div
    class="node"
    :style="nodeStyle"
    v-text="content"
    draggable="true"
    @dragstart="startDrag"
    @dragend="dragEnd"
  />
  <LineConnector
    v-if="singleChild"
    :fromX="centralConnectionPoint.x"
    :fromY="centralConnectionPoint.y"
    :toX="singleChildConnection.x"
    :toY="singleChildConnection.y"
    stroke="4"
  />
  <SideConnector
    v-if="bothChildren"
    :fromX="leftConnectionPoint.x"
    :fromY="leftConnectionPoint.y"
    :toX="leftConnection.x"
    :toY="leftConnection.y"
    stroke="4"
    radius="24"
  />
  <SideConnector
    v-if="bothChildren"
    :fromX="rightConnectionPoint.x"
    :fromY="rightConnectionPoint.y"
    :toX="rightConnection.x"
    :toY="rightConnection.y"
    stroke="4"
    radius="24"
  />
</template>
<script>
import LineConnector from "./LineConnector.vue";
import SideConnector from "./SideConnector.vue";
export default {
  components: {
    LineConnector,
    SideConnector,
  },
  props: [
    "id",
    "x",
    "y",
    "size",
    "color",
    "content",
    "leftConnection",
    "rightConnection",
  ],
  computed: {
    children() {
      return [this.leftConnection, this.rightConnection].filter(Boolean);
    },
    bothChildren() {
      return this.children.length === 2;
    },
    singleChild() {
      return this.children.length === 1;
    },
    coords() {
      return {
        x: this.left,
        y: this.top,
      };
    },
    nodeStyle() {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
        width: `${this.size}px`,
        height: `${this.size}px`,
        backgroundColor: this.color,
        fontSize: `${this.size * 0.75}px`,
      };
    },
    centralConnectionPoint() {
      return {
        x: this.x + this.size / 2,
        y: this.y + this.size,
      };
    },
    leftConnectionPoint() {
      return {
        x: this.x,
        y: this.y + this.size / 2,
      };
    },
    rightConnectionPoint() {
      return {
        x: this.x + this.size,
        y: this.y + this.size / 2,
      };
    },
    singleChildConnection() {
      if (this.leftConnection) {
        return this.leftConnection;
      }
      if (this.rightConnection) {
        return this.rightConnection;
      }
    },
  },
  methods: {
    startDrag(event) {
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.effectAllowed = "move";
      const deltaX = this.size / 2 - event.offsetX;
      const deltaY = this.size / 2 - event.offsetY;
      event.dataTransfer.setData("id", this.id);
      event.dataTransfer.setData("shiftX", deltaX);
      event.dataTransfer.setData("shiftY", deltaY);
      this.dragging = true;
    },
    dragEnd() {
      this.dragging = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.node {
  box-sizing: border-box;
  position: absolute;
  border-radius: 100%;
  border: 4px solid #cccccc77;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translate(0, 0); // <== black magic from
  // // https://github.com/react-dnd/react-dnd/issues/788#issuecomment-367300464
  transition: all 200ms ease;
}
</style>
