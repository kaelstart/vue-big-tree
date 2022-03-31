import { Checkbox } from 'element-ui';
import { isEmpty } from 'lodash';

var TreeNode = {
render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pd-tree-node",on:{"click":function($event){$event.stopPropagation();return _vm.handleClick(_vm.source, $event)}}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.source.node.visible),expression:"source.node.visible"}],staticClass:"pd-tree-node__content",class:{
      'pd-tree-node__content--active': _vm.source.node.active,
    },style:({ 'padding-left': (((_vm.source.node.level + 1) * 30) + "px") })},[(!_vm.source.node.last)?_c('i',{staticClass:"pd-tree-node__content-icon",class:[_vm.source.node.expanded ? 'el-icon-caret-bottom' : 'el-icon-caret-right'],attrs:{"data-target":"icon"}}):_vm._e(),_vm._v(" "),(_vm.showCheckbox)?_c('el-checkbox',{key:_vm.source[_vm.ctx.nodeKey],staticStyle:{"margin-right":"8px"},attrs:{"indeterminate":_vm.source.node.indeterminate},on:{"change":function (check, $event) { return _vm.handleCheckChange(check, _vm.source, $event); }},nativeOn:{"click":function($event){$event.stopPropagation();}},model:{value:(_vm.source.node.checked),callback:function ($$v) {_vm.$set(_vm.source.node, "checked", $$v);},expression:"source.node.checked"}}):_vm._e(),_vm._v(" "),_c('node-content',{attrs:{"data":_vm.source}})],1)])},
staticRenderFns: [],
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

/* eslint-disable */
class TreeStore {
  constructor(options) {
    for (const option in options) {
      if (Reflect.has(options, option)) {
        this[option] = options[option];
      }
    }

    this.initData = this.data; // 原始数据

    this.allDataKeys = new Map(); // 所有数据的映射

    this.flatList = []; // 平铺的数据

    this.flatTreeList();
  } // 数据处理


  flatTreeList() {
    /**
     * 内部数据处理
     * @param {Array} val 数据源
     * @param {Number} level 层级
     * @param {Object} parent 父节点
     * @param {Boolean} visible 是否可见
     * @param {Array} 子节点
     */
    const flatList = [];

    const traversal = ({
      val,
      level,
      parent = "",
      visible = false
    }) => {
      const list = [];
      val.forEach(item => {
        const newItem = {};
        newItem.data = item;
        newItem.childNodes = [];
        newItem.node = {
          parentId: parent ? parent.data[this.nodeKey] : "",
          // 父id
          visible: this.defaultExpandAll ? true : level === 1 ? true : visible || false,
          // 是否可见
          active: false,
          // 是否激活
          level,
          // 层级
          checked: false,
          // 复选框是否被选中
          indeterminate: false,
          // 复选框的选择状态
          expanded: this.defaultExpandAll ? true : this.defaultExpandedKeys.includes(newItem.data[this.nodeKey]) ? true : false,
          // 是否展开
          last: newItem.data.children.length === 0
        };
        parent && (newItem.parent = parent);
        flatList.push(newItem);
        this.allDataKeys.set(item[this.nodeKey], newItem);

        if (newItem.data.children?.length) {
          newItem.childNodes = traversal({
            val: newItem.data.children,
            level: level + 1,
            parent: newItem,
            visible: newItem.node.expanded,
            childNodes: newItem.childNodes
          });
        }

        list.push(newItem);
      });
      return list;
    };

    traversal({
      val: this.initData,
      level: 1
    });
    this.flatList = flatList;
  }
  /**
   * @param {String} nodeKey tree节点的唯一标示
   */


  getNode(nodeKey) {
    const current = this.allDataKeys.get(nodeKey);
    return current ? {
      data: current.data
    } : null; // 模拟兼容el-tree返回数据
  }
  /**
   * 高亮节点
   * @param {String} nodeKey tree节点唯一标示
   */


  setCurrentKey(nodeKey) {
    const current = this.allDataKeys.get(nodeKey);
    current && (current.node.active = true);
  }
  /**
   * 过滤关键字
   * @param {String} keyword 关键字
   * @param {Function} filterMethod 过滤方法
   */


  filter(keyword, filterMethod) {
    const data = this.flatList.map(item => {
      const status = filterMethod(keyword, item.data, item.node);
      item.node.visible = status;
      let parent = item.parent;

      if (status) {
        while (parent) {
          parent.node.visible = status;
          status && (parent.node.expanded = status);
          parent = parent.parent;
        }
      }

      return item;
    });
    this.flatList = [...data];
  }

}

const ITEM_HEIGHT = 26; // 暂时写死,不扩展
/**
 * tree虚拟列表
 * 实现了部分el-tree功能
 * 过滤
 */
var Tree = {
render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"pd-tree",style:({ height: _vm.height - 50 + 'px' })},[(!_vm.getClickVisibleTableList.length)?_c('div',[_c('div',{staticClass:"pd-tree__empty"},[_vm._v("暂无数据")])]):_vm._e(),_vm._v(" "),_c('div',{ref:"containerWrapper",staticClass:"pd-tree__node",style:({ height: _vm.height + 'px' }),on:{"scroll":_vm.handleScroll}},[_c('div',{staticClass:"pd-tree__node-placeholder",style:({
        'padding-top': _vm.getVisibleTop.length * 26 + 'px',
      })}),_vm._v(" "),_c('div',{staticClass:"pd-tree__node-container",style:({ transform: _vm.getTransform })},_vm._l((_vm.getClickVisibleTableList),function(item){return _c('TreeNode',{key:item.data[_vm.nodeKey],attrs:{"source":item,"show-checkbox":_vm.showCheckbox},on:{"node-click":_vm.handleNodeClick,"check":_vm.handleCheck}})}),1)])])},
staticRenderFns: [],
  name: 'VueLargerTree',

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
        !isEmpty(this.currentSelectNode) && (this.currentSelectNode.node.active = !this.currentSelectNode.node.active);
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

/* istanbul ignore next */

Tree.install = function (Vue) {
  Vue.component(Tree.name, Tree);
};

export { Tree as default };
