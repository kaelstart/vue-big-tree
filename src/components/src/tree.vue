<template>
  <div class="pd-tree" :style="{ height: height - 50 + 'px' }">
    <div v-if="!getClickVisibleTableList.length">
      <div class="pd-tree__empty">暂无数据</div>
    </div>
    <div ref="containerWrapper" class="pd-tree__node" :style="{ height: height + 'px' }" @scroll="handleScroll">
      <div
        class="pd-tree__node-placeholder"
        :style="{
          'padding-top': getVisibleTop.length * 26 + 'px',
        }"
      />
      <div class="pd-tree__node-container" :style="{ transform: getTransform }">
        <TreeNode
          @node-click="handleNodeClick"
          @check="handleCheck"
          v-for="item in getClickVisibleTableList"
          :key="item.data[nodeKey]"
          :source="item"
          :show-checkbox="showCheckbox"
        />
      </div>
    </div>
  </div>
</template>
<script>
import TreeNode from './tree-node.vue';
import TreeStore from './model/tree-store.js';
import { isEmpty as lodashIsEmpty } from 'lodash';
const ITEM_HEIGHT = 26; // 暂时写死,不扩展
/**
 * tree虚拟列表
 * 实现了部分el-tree功能
 * 过滤
 */
export default {
  name: 'VueGigTree',

  props: {
    // 数据源
    list: {
      type: Array,
      defalut: () => [],
    },
    // 过滤方法
    filterNodeMethod: {
      type: Function,
    },
    // 是否选中高亮
    highlightCurrent: {
      type: Boolean,
      defalut: false,
    },
    // key唯一标识
    nodeKey: {
      type: String,
      required: true,
    },
    // 是否默认展开所有节点
    defaultExpandAll: {
      type: Boolean,
      defalut: false,
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => [],
    },
    // 是否展示复选框
    showCheckbox: {
      type: Boolean,
      default: false,
    },
    // 是否在点击节点的时候展开或者收缩节点
    expandOnClickNode: {
      type: Boolean,
      default: true,
    },
    // 默认属性
    props: {
      default() {
        return {
          children: 'children',
          label: 'categoryName',
        };
      },
    },
    // 树高度
    height: {
      type: String,
      default: '480',
    },
  },

  provide() {
    return {
      ctx: this,
    };
  },

  data() {
    return {
      rootNode: null, // 根数据
      currentSelectNode: null, // 选择的组件数据

      startIndex: 0, // 开始位置
      lastIndex: 0, // 结束位置
      startOffset: 0, // 偏移量
      visibleCount: 0, // 可视数量
    };
  },

  watch: {
    list: {
      immediate: true,
      handler(newVal) {
        const data = new TreeStore({
          data: newVal,
          nodeKey: this.nodeKey,
          defaultExpandAll: this.defaultExpandAll,
          defaultExpandedKeys: this.defaultExpandedKeys,
        });
        this.rootNode = data;
      },
    },
  },

  computed: {
    getTransform({ startOffset }) {
      return `translate3d(0,${startOffset}px,0)`;
    },
    getVisibleTop({ rootNode }) {
      return rootNode.flatList.filter((item) => item.node.visible);
    },
    getClickVisibleTableList({ getVisibleTop, startIndex, lastIndex }) {
      return getVisibleTop.slice(startIndex, Math.min(lastIndex, getVisibleTop.length));
    },
  },

  mounted() {
    this.$nextTick(() => {
      const ITEM_HEIGHT = 26; // 暂时写死,不扩展
      this.lastIndex = this.visibleCount = Math.ceil(this.$refs.containerWrapper.clientHeight / ITEM_HEIGHT);
    });
    this.$on('current-change', (currentVal) => {
      if (this.highlightCurrent) {
        // 需要高亮的情况
        !lodashIsEmpty(this.currentSelectNode) && (this.currentSelectNode.node.active = !this.currentSelectNode.node.active);
        currentVal.node.active = !currentVal.node.active;
      }
      this.currentSelectNode = currentVal;
    });
  },

  methods: {
    handleCheck(val, check) {
      const allChildren = val.childNodes;
      // 先处理子节点列表
      const traversalChildNodeList = (list) => {
        list.forEach((item) => {
          item.node.checked = check;
          const allChildren = item.childNodes;
          allChildren && traversalChildNodeList(allChildren);
        });
      };
      allChildren && traversalChildNodeList(allChildren);
      val.node.checked = check;
      // 处理父节点列表
      const traversalParentNodeList = (parent) => {
        const allChildren = parent.childNodes;
        const allChecked = allChildren.every((item) => item.node.checked);
        const someChecked = allChildren.some((item) => item.node.checked || item.node.indeterminate);
        if (allChecked) {
          parent.node.checked = allChecked;
          parent.node.indeterminate = false;
        } else {
          parent.node.checked = false;
          parent.node.indeterminate = parent.node.checked === false && someChecked ? true : false;
        }
        parent.parent && traversalParentNodeList(parent.parent);
      };
      if (val.parent) {
        traversalParentNodeList(val.parent);
      } else {
        val.node.indeterminate = false;
      }
      const checkedKeys = [];
      const checkedNodes = [];
      const halfCheckedKeys = [];
      const halfCheckedNodes = [];
      this.rootNode.flatList.forEach((item) => {
        if (item.node.checked && item.node.indeterminate === false) {
          // 对勾状态
          checkedKeys.push(item.data[this.nodeKey]);
          checkedNodes.push(item);
        } else if (item.node.checked === false && item.node.indeterminate) {
          halfCheckedKeys.push(item.data[this.nodeKey]);
          halfCheckedNodes.push(item);
        }
      });
      this.$emit('check', val, {
        checkedKeys,
        checkedNodes,
        halfCheckedKeys,
        halfCheckedNodes,
      });
    },
    handleScroll: function () {
      const scrollTop = this.$refs.containerWrapper.scrollTop;
      const startIndex = Math.ceil(scrollTop / ITEM_HEIGHT);
      const lastIndex = startIndex + this.visibleCount;
      const startOffset = scrollTop - (scrollTop % ITEM_HEIGHT);
      this.startIndex = startIndex;
      this.lastIndex = lastIndex;
      this.startOffset = startOffset;
    },
    /**
     * 树组件过滤方法
     * @param {String} keyword 搜索关键字
     */
    filter: function (keyword) {
      if (!this.filterNodeMethod) throw new Error('[Tree] filterNodeMethod is required when filter');
      this.rootNode.filter(keyword, this.filterNodeMethod);
    },
    // 获取当前选中节点
    getCurrentNode() {
      return this.currentSelectNode || null;
    },
    /**
     * 高亮节点
     * @param {String} nodeKey tree节点唯一标示
     */
    setCurrentKey(nodeKey) {
      this.rootNode.setCurrentKey(nodeKey);
    },
    /**
     * @param {String} nodeKey tree节点的唯一标示
     */
    getNode(nodeKey) {
      return this.rootNode.getNode(nodeKey);
    },
    /**
     * 节点点击
     * @param {Object} val 点击数据源
     * @param {Object} event 事件
     */
    handleNodeClick(val, event) {
      val.node.expanded = !val.node.expanded;
      if (val?.childNodes) {
        const traversal = (list) => {
          list?.childNodes.forEach((item) => {
            item.node.visible = item?.parent
              ? !item.parent.node.visible
                ? false
                : item.parent.node.visible && item.parent.node.expanded
                ? true
                : false
              : !item.node.visible;
            traversal(item);
          });
        };
        traversal(val);
      }
      this.$emit('node-click', val.data, val.node, event);
    },
  },

  components: { TreeNode },
};
</script>

<style lang="scss" scoped>
.pd-tree {
  background: #fff;
  ::-webkit-scrollbar {
    width: 0;
  }
  .pd-tree__empty {
    position: relative;
    min-height: 60px;
    text-align: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 14px;
    margin-top: 30px;
  }
  .pd-tree__node {
    overflow: auto;
    position: relative;
    .pd-tree__node-placeholder {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      z-index: -1;
    }
    .pd-tree__node-container {
      position: absolute;
      left: 0;
      right: 0;
      overflow: hidden;
    }
  }
}
</style>
