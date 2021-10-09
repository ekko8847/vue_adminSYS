<template>
  <div class="sales-view">
    <el-card shadow="hover">
      <template v-slot:header>
        <div class="menu-wrapper">
          <el-menu mode="horizontal" :default-active="activeIndex" @select="handleMenuSelect">
            <el-menu-item index="1">销售额</el-menu-item>
            <el-menu-item index="2">访问量</el-menu-item>
          </el-menu>

          <div class="menu-right">
            <el-radio-group v-model="time" size="small">
              <el-radio-button label="今日" />
              <el-radio-button label="本周"></el-radio-button>
              <el-radio-button label="本月"></el-radio-button>
              <el-radio-button label="今年"></el-radio-button>
            </el-radio-group>

            <el-date-picker
              style="margin-left: 10px"
              size="small"
              v-model="date"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </div>
      </template>

      <template>
        <div class="sales-view-chart-wrap">

          <v-chart :options="chartOptions" autoresize/>

          <div class="sales-view-list">
            <div class="list-title">排行榜</div>
            <div class="list-item-wrapper">
              <div class="list-item" v-for="(item, index) in rankList" :key="index">
                <div class="list-item-no" :class="{'top-no': index<3}">{{index + 1}}</div>
                <div class="list-item-name">{{item.name}}</div>
                <div class="list-item-money">{{item.money}}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script>
import {reportDataMixin} from '../mixins'
export default {
  name: 'SalesView',
  mixins: [reportDataMixin],
  data () {
    return {
      activeIndex: '1',
      time: '今日',
      date: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      chartOptions: {}
    }
  },

  watch: {
    orderFullYear () {
      console.log('------')
      this.renderChart(this.orderFullYear, this.orderFullYearAxis, '年度销售额')
    }
  },

  computed: {
    rankList () {
      return this.activeIndex==='1' ? this.orderRank : this.userRank
    }
  },

  methods: {

    handleMenuSelect (value) {
      this.activeIndex = value
      if (value==='1') {
        this.renderChart(this.orderFullYear, this.orderFullYearAxis, '年度销售额')
      } else {
        this.renderChart(this.userFullYear, this.userFullYearAxis, '年度用户访问量')
      }
    },

    renderChart (year, yearAxios, title) {
      this.chartOptions = {
        title: {
          text: title,
          textStyle: {
            fontSize: 12,
            color: '#666'
          },
          left: 20,
        },
        xAxis: {
          type: 'category',
          data: yearAxios,
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dotted',
              color: '#eee'
            }
          }
        },
        series: [{
          type: 'bar',
          barWidth: '35%',
          data: year
        }],
        color: '#3398DB',
        grid: {
          top: 50,
          left: 50,
          right: 50,
          bottom: 50
        },
        tooltip: {}
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .sales-view {
    margin-top: 20px;
    box-sizing: content-box;
    
    ::v-deep .el-card__header { /* 使用深度作用域选择器 */
      border-bottom: none;
      padding: 0;
    }

    .menu-wrapper {
      padding: 0 10px;
      position: relative;
      // display: flex;
      // align-items: center;
      // justify-content:space-between;
      .menu-right {
        position: absolute;
        top: 0;
        right: 20px;
        height: 100%;
        display: flex;
        align-items: center;
      }
    }

    .sales-view-chart-wrap {
      display: flex;
      height: 270px;
      .echarts {
        flex: 5;
        height: 100%;
      }
      .sales-view-list {
        flex: 2;
        height: 100%;
        overflow: hidden;
        .list-title {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-top: 20px;
        }
        .list-item-wrapper {
          margin-top: 15px;
          .list-item {
            display: flex;
            align-items: center;
            height: 20px;
            font-size: 12px;
            padding: 6px 20px 6px 0;
            .list-item-no {
              width: 20px;
              height: 20px;
              color: #333;
              display: flex;
              justify-content: center;
              align-items: center;
              &.top-no {
                border-radius: 50%;
                background: #000;
                color: #fff;
                font-weight: 300;
              }
            }
            .list-item-name {
              margin-left: 10px;
              color: #333;
            }
            .list-item-money {
              flex: 1;
              text-align: right;
            }
            
          }
        }
      }
    }
    
  }
</style>
