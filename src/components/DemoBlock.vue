<template>
  <div
    class="block"
    :class="{ dragging }"
    :style="style"
    draggable="true"
    @dragstart="startDrag"
    @dragend="dragEnd"
    v-text="content"
  />
</template>
<script>
export default {
  props: ["id", "x", "y", "size", "color", "content"],
  data() {
    return {
      dragging: false,
    };
  },
  computed: {
    style() {
      return {
        left: `${this.x - this.size / 2}px`,
        top: `${this.y - this.size / 2}px`,
        width: `${this.size}px`,
        height: `${this.size}px`,
        backgroundColor: this.color,
        fontSize: `${this.size * 0.75}px`,
      };
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
.block {
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
  &.dragging {
    transition: unset;
    border: 4px dotted #cccccc77;
    background: url("") top left no-repeat;
    overflow: hidden;
    opacity: 0.999;
    border-radius: 50%;
  }
}
</style>
