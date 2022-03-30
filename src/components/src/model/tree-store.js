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
  }
  // 数据处理
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
    const traversal = ({ val, level, parent = "", visible = false }) => {
      const list = [];
      val.forEach((item) => {
        const newItem = {};
        newItem.data = item;
        newItem.childNodes = [];
        newItem.node = {
          parentId: parent ? parent.data[this.nodeKey] : "", // 父id
          visible: this.defaultExpandAll
            ? true
            : level === 1
            ? true
            : visible || false, // 是否可见
          active: false, // 是否激活
          level, // 层级
          checked: false, // 复选框是否被选中
          indeterminate: false, // 复选框的选择状态
          expanded: this.defaultExpandAll
            ? true
            : this.defaultExpandedKeys.includes(newItem.data[this.nodeKey])
            ? true
            : false, // 是否展开
          last: newItem.data.children.length === 0,
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
            childNodes: newItem.childNodes,
          });
        }
        list.push(newItem);
      });
      return list;
    };
    traversal({ val: this.initData, level: 1 });
    this.flatList = flatList;
  }

  /**
   * @param {String} nodeKey tree节点的唯一标示
   */
  getNode(nodeKey) {
    const current = this.allDataKeys.get(nodeKey);
    return current ? { data: current.data } : null; // 模拟兼容el-tree返回数据
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
    const data = this.flatList.map((item) => {
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

export default TreeStore;
