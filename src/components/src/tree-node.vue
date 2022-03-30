<template>
  <div class="pd-tree-node" @click.stop="handleClick(source, $event)">
    <div
      v-show="source.node.visible"
      class="pd-tree-node__content"
      :style="{ 'padding-left': `${(source.node.level + 1) * 30}px` }"
      :class="{
        'pd-tree-node__content--active': source.node.active,
      }"
    >
      <i
        v-if="!source.node.last"
        data-target="icon"
        class="pd-tree-node__content-icon"
        :class="[source.node.expanded ? 'el-icon-caret-bottom' : 'el-icon-caret-right']"
      />
      <el-checkbox
        v-if="showCheckbox"
        v-model="source.node.checked"
        :indeterminate="source.node.indeterminate"
        style="margin-right: 8px"
        @click.native.stop
        @change="(check, $event) => handleCheckChange(check, source, $event)"
        :key="source[ctx.nodeKey]"
      />
      <node-content :data="source" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { Checkbox } from 'element-ui';
export default {
  name: 'TreeNode',
  props: {
    // 数据源
    source: {
      type: Object,
      default: () => {},
    },
    showCheckbox: {
      // 是否需要复选框
      type: Boolean,
      default: false,
    },
  },

  components: {
    ElCheckbox: Checkbox,
    NodeContent: {
      props: {
        data: {
          type: Object,
          default: () => {},
        },
      },
      render(h) {
        const { data } = this.$props;
        return this.$parent.ctx.$scopedSlots.default
          ? this.$parent.ctx.$scopedSlots.default({ data: data.data, node: data.node })
          : h('span', [data[this.$parent.ctx.props.label]]);
      },
    },
  },

  inject: ['ctx'],

  methods: {
    handleClick(val, event) {
      if (this.ctx.expandOnClickNode || event.target.getAttribute('data-target') === 'icon') this.$emit('node-click', val, event);
      this.ctx.$emit('current-change', val.data);
    },
    handleCheckChange(check, val, event) {
      this.$emit('check', val, check, event);
    },
  },
};
</script>

<style lang="scss" scoped>
.pd-tree-node {
  .pd-tree-node__content {
    display: flex;
    align-items: center;
    height: 26px;
    cursor: pointer;
    &:hover {
      background: #f5f7fa;
    }
    .pd-tree-node__content--active {
      background: #f5f7fa !important;
    }
    .pd-tree-node__content-icon {
      font-size: 12px;
      padding: 6px 6px 6px 0;
      color: #c0c4cc;
    }
  }
}
</style>
