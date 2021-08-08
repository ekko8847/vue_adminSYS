<template>
  <a href="javascript:;" :title="title">
    <el-button v-bind="$attrs" v-on="$listeners"></el-button>
  </a>
  <!--$attrs代表父组件传递的所有属性组成的对象，但是不包含props声明接收过的属性
      $listeners代表父组件给子组件绑定的所有事件监听组成的对象
   -->
</template>

<script>
export default {
  name: "HintButton",
  props: ["title"]
};
</script>

<style lang="scss" scoped>
a {
  margin-right: 10px;
}
</style>
