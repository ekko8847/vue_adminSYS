<template>
  <common-card title="累计用户数" :value="userToday">
    <template>
      <!-- <div ref="total-users-chart" style="width: 100%;height: 100%;">
      </div> -->
      <v-chart :options="getOptions()" autoresize/>
    </template>

    <template v-slot:total>
      <div class="total-users-total">
        <span>日同比</span>
        <span class="emphasis">{{userGrowthLastDay}}</span>
        <div :class="userGrowthLastDay.startsWith('-') ? 'decrement' : 'increment'"></div>
        <span class="total-users-right">月同比</span>
        <span class="emphasis">{{userGrowthLastMonth}}</span>
        <div :class="userGrowthLastMonth.startsWith('-') ? 'decrement' : 'increment'"></div>
      </div>
    </template>
  </common-card>
</template>

<script>
// import echarts from 'echarts'
import {commonCardMxin, reportDataMixin} from '../mixins'
export default {
  name: 'TotalUsers',
  mixins: [commonCardMxin, reportDataMixin],

  methods: {
    getOptions () {
      return {
        xAxis: {
          show: false,
        },
        yAxis: {
          type: 'category',
          show: false
        },
        grid: {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        },
        series: [
          {
            stack: '用户总量',
            data: [this.userLastMonth],
            type: 'bar',
            itemStyle: {
              color: '#45c946',
            },
            barWidth: 10,
          },
          {
            stack: '用户总量',
            data: [this.userTodayNumber],
            type: 'bar',
            itemStyle: {
              color: '#eee',
            },
            barWidth: 10,
          },
          {
            stack: '用户总量',
            data: [this.userLastMonth],
            type: 'custom',
            renderItem: function (params, api) {
              const value = api.value(0)
              const endPoint = api.coord([value, 0])

              return {
                type: 'group',
                position: endPoint,
                children: [{
                  type: 'path',
                  shape: {
                    d: 'M1024 255.996 511.971 767.909 0 255.996 1024 255.996z',
                    x: -5,
                    y: -20,
                    width: 10,
                    height: 10,
                    layout: 'cover'
                  },
                  style: {
                    fill: '#45c946'
                  }
                }, {
                  type: 'path',
                  shape: {
                    d: 'M0 767.909l512.029-511.913L1024 767.909 0 767.909z',
                    x: -5,
                    y: 10,
                    width: 10,
                    height: 10,
                    layout: 'cover'
                  },
                  style: {
                    fill: '#45c946'
                  }
                }]
              }
            },
          }
        ],
      }
    }
  },
}
</script>

<style scoped>
  .total-users-total {
    display: flex;
    align-items: center;
  }
  .total-users-right {
    margin-left: 15px;
  }
</style>
