<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory"></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px"> </el-card>
  </div>
</template>

<script>
export default {
  name: "Attr",
  methods: {
    changeCategory() {
      console.log(111);
    }
  }
};
</script>

<style lang="scss" scoped></style>
