<template>
  <common-card title="今日交易用户数" :value="orderUser">
    <template>
      <!-- <div ref="today-users-chart" style="width: 100%;height: 100%;"></div> -->
      <v-chart :options="getOptions()" autoresize/>
    </template>

    <template v-slot:total>
      <span>退货率</span>
      <span class="emphasis">{{returnRate}}</span>
    </template>
  </common-card>
</template>

<script>
import {commonCardMxin, reportDataMixin} from '../mixins'
export default {
  name: 'TodayUsers',
  mixins: [commonCardMxin, reportDataMixin],

  methods: {
    getOptions () {
      return {
        xAxis: {
          data: this.orderUserTrendAxis,
        },
        yAxis: {
          show: false
        },
        series: [
          {
            name: '用户实时交易量',
            data: this.orderUserTrend,
            type: 'bar',
            barWidth: '60%'
          }
        ],

        grid: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        },
        color: '#3398DB',
        tooltip: {}
      }
    }
  },

  // mounted () {
  //   const chartDiv = this.$refs['today-users-chart']
  //   const chart = this.$echarts.init(chartDiv)
  //   chart.setOption({
  //     xAxis: {
  //       data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'],
  //     },
  //     yAxis: {
  //       show: false
  //     },
  //     series: [
  //       {
  //         name: '用户实时交易量',
  //         data: [623, 532, 611, 322, 378, 266, 388, 233, 155, 433],
  //         type: 'bar',
  //         barWidth: '60%'
  //       }
  //     ],

  //     grid: {
  //       left: 0,
  //       top: 0,
  //       right: 0,
  //       bottom: 0
  //     },
  //     color: '#3398DB',
  //     tooltip: {}
  //   })
  // }
}
</script>

<style scoped>

</style>
