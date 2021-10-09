<template>
  <div class="home">
    <top-view />
    <sales-view />
    <bottom-view />
  </div>
</template>

<script>
  import TopView from './components/TopView'
  import SalesView from './components/SalesView'
  import BottomView from './components/BottomView'

  export default {
    name: 'Home',
    components: {
      TopView, 
      SalesView,
      BottomView,
    },
    data() {
      return {
        reportData: {},
      }
    },
    methods: {
      getReportData() {
        return this.reportData
      },
    },
    provide() {
      return {
        getReportData: this.getReportData,
      }
    },
    mounted() {
      this.$API.data.getReportData()
        .then(data => {
          this.reportData = data 
        })
    }
  }
</script>

<style lang="scss">
  .home {
    width: 100%;
    padding: 20px;
    background: #eee;
    .echarts {
      width: 100%;
      height: 100%;
    }
  }
</style>
