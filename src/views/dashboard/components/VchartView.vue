<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="24" :lg="8">
      <el-card>
        <line-chart2 />
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="24" :lg="8">
      <el-card>
        <bar-chart2 />
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="24" :lg="8">
      <el-card>
        <pie-chart2/>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'VchartView',
  
}
</script>

<style scoped>

</style>
