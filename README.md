# vue-larger-tree

A tree component that can load large amounts of data(Based on element-ui).

## Install

```bash
$ npm i vue-larger-tree -S
```

```bash
$ yarn add vue-larger-tree -S
```

### Use

```js
import Vue from "vue";
import VueLargerTree from "vue-larger-tree";
import "vue-larger-tree/dist/index.css";

Vue.use(VueLargerTree);
```

### Props
#### list
Type: `Array`<br>
Required: `true`<br>
origin data.
```html
<VueLargerTree :list="[]">
```

#### node-key
Type: `String`<br>
Required: `true`<br>
Unique key for every data.
```html
<VueLargerTree :list="[]" node-key="categoryCode">
```

#### height
Type: `String`<br>
Required: `false`<br>
Default: `480`<br>
component height.
```html
<VueLargerTree :list="[]" node-key="categoryCode" height="500">
```

#### show-checkbox
Type: `Boolean`<br>
Required: `false`<br>
Default: `false`<br>
show component checkbox.
```html
<VueLargerTree :list="[]" node-key="categoryCode" height="500" show-checkbox>
```

#### defaultExpandAll
Type: `Boolean`<br>
Required: `false`<br>
Default: `false`<br>
expand all node.
```html
<VueLargerTree :list="[]" defaultExpandAll>
```

#### defaultExpandedKeys
Type: `Array`<br>
Required: `false`<br>
Default: `[]`<br>
default expanded keys list.
```html
<VueLargerTree :list="[]" :defaultExpandedKeys="[]">
```

#### props
Type: `Object`<br>
Required: `false`<br>
Default: `{children:'children',label:'categoryName'}`<br>
keyword of attribute value. like element-ui.
```html
<VueLargerTree :list="[]" :props="{}">
```


#### check
Type: `Function`<br>
Required: `false`<br>
like element-ui.tree.check
```html
<VueLargerTree @check="handleCheck">
```


#### node-click
Type: `Function`<br>
Required: `false`<br>
like element-ui.tree.node-click
```html
<VueLargerTree @node-click="handleNodeClick">
```

#### filterNodeMethod
Type: `Function`<br>
Required: `false`<br>
like element-ui.tree.filterNodeMethod
```html
<VueLargerTree :filterNodeMethod="handleFilterMethods">
```

### example
```js
<template>
  <div id="app">
    <el-input v-model="searchValue" />
    <VueLargerTree
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
    </VueLargerTree>
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
```
