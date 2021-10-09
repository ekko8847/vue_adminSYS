<template>
  <common-card title="今日订单量" :value="orderToday">
    <template>
      <!-- <div ref="total-orders-chart" style="width: 100%;height: 100%;">
      </div> -->
      <v-chart  :options="getOptions()" autoresize/>
    </template>

    <template v-slot:total>
      <span>昨日订单量</span>
      <span class="emphasis">{{orderLastDay}}</span>
    </template>
  </common-card>
</template>

<script>
import {commonCardMxin, reportDataMixin} from '../mixins'
export default {
  name: 'TotalOrders',
  mixins: [commonCardMxin, reportDataMixin],

  methods: {
    getOptions () {
      return {
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: {
          show: false
        },
        series: [
          {
            data: [623, 532, 611, 322, 378, 266, 388, 233, 155, 433],
            type: 'line',
            smooth: true,
            areaStyle: {
              color: 'purple'
            },
            lineStyle: {
              width: 0
            },
            itemStyle: {
              opacity: 0
            },
          }
        ],

        grid: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }
      }
    }
  },

  // mounted () {
  //   const chartDiv = this.$refs['total-orders-chart']
  //   const chart = this.$echarts.init(chartDiv)
  //   chart.setOption()
  // }
}
</script>

<style scoped>

</style>
