<template>
  <div id="app">
    <el-input v-model="searchValue" />
    <VueGigTree
      ref="tree"
      :list="list"
      node-key="categoryCode"
      height="500"
      show-checkbox
      @node-click="handleNodeClick"
      @check="handleCheck"
      :filterNodeMethod="handleFilterMethods"
    >
      <template v-slot="{ data }">
        <span>{{ data.title }}</span>
      </template>
    </VueGigTree>
  </div>
</template>

<script>
import { Input } from 'element-ui';
export default {
  name: 'App',
  data() {
    return {
      searchValue: '',
      expandedList: ['index'],
      list: [],
      defaultProps: {
        children: 'children',
        label: 'title',
      },
    };
  },
  watch: {
    searchValue(newVal) {
      this.$refs.tree.filter(newVal);
    },
  },
  methods: {
    handleCheck(checkedNodes, checkedKeys) {
      console.log('checkedNodes', checkedNodes);
      console.log('checkedKeys', checkedKeys);
    },
    handleNodeClick(e) {
      console.log('handleNodeClick', e);
    },
    handleFilterMethods(keyword, val) {
      return val.categoryName.includes(keyword);
    },
  },

  mounted() {
    const load = (level) => {
      const list = [];
      for (let i = 0; i < 100; i++) {
        const treeNode = {
          key: `${level}-${i}`,
          title: `${level}-${i}`,
          level,
          children: [],
        };
        if (level === 0) {
          treeNode.children = load(level + 1);
        }
        list.push(treeNode);
      }
      return list;
    };
    this.list = load(0);
  },

  components: { ElInput: Input },
};
</script>
