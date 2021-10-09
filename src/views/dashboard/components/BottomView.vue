<template>
  <div class="bottom-view">
    <el-card shadow="hover" class="view">
      <div slot="header" class="view-header">
        <div class="title">关键词搜索</div>
      </div>
      <template>
        <div class="search-view">
          <div class="chart-wrapper">
            <div class="chart">
              <div class="title">搜索用户数</div>
              <div class="count">123</div>
              <v-chart :options="searchUserOptions" autoresize/>
            </div>
            <div class="chart">
              <div class="title">搜索量</div>
              <div class="count">321</div>
              <v-chart :options="searchCountOptions" autoresize/>
            </div>
          </div>
          <div class="search-table">
            <el-table
              :data="tableData"
              row-key="id">
              <el-table-column prop="rank" label="排名" />
                <el-table-column prop="keyword" label="关键词" />
                <el-table-column prop="count" label="总搜索量" />
                <el-table-column prop="users" label="搜索用户数" />
                <el-table-column prop="range" label="搜索占比" />
            </el-table>
            <el-pagination
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page.sync="currentPage">
            </el-pagination>
          </div>
        </div>
      </template>
    </el-card>
    <el-card shadow="hover" class="view">
      <div slot="header" class="view-header">
        <div class="title">分类销售排行</div>
        <el-radio-group v-model="radioSelect" size="mini">
          <el-radio-button label="品类"></el-radio-button>
          <el-radio-button label="商品"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="search-view">
        <v-chart :options="rankOptions" autoresize/>
      </div>
    </el-card>
  </div>
</template>

<script>
import {reportDataMixin} from '../mixins'

const colors = ['#8d7fec', '#5085f2', '#f8726b', '#e7e702', '#78f283', '#4bc1fc']
export default {
  name: 'BottomView',
  mixins: [reportDataMixin],

  data () {
    return {
      radioSelect: '品类',
      searchCountOptions: {}, // 搜索量图表配置
      searchUserOptions: {}, // 搜索人数图表配置
      rankOptions: {}, // 排行图表配置
      tableTotalData: [], // table列表数据
      total: 0, // 总记录数
      pageSize: 4, // 每页数量
      currentPage: 1, // 当前第几页
      userCount: 0, // 搜索用户量
      searchCount: 0, // 搜索量
    }
  },

  watch: {
    searchWord (value) {
      console.log('--searchWord')
      const tableTotalData = []
      let userCount = 0
      let searchCount = 0
      value.forEach((item, index) => {
        tableTotalData.push({
          id: index + 1,
          rank: index + 1,
          keyword: item.word,
          count: item.count,
          users: item.user,
          range: `${((item.user / item.count) * 100).toFixed(2)}%`
        })
        userCount += item.user
        searchCount += item.count
      })
      this.tableTotalData = tableTotalData
      this.userCount = userCount
      this.searchCount = searchCount
      this.total = this.tableTotalData.length

      this.renderLineChart()
      this.renderPieChart()
    },

    radioSelect () {
      this.renderPieChart()
    }
  },

  computed: {

    tableData () {
      const {tableTotalData, currentPage, pageSize} = this
      return tableTotalData.filter((item, index) => index>=(currentPage-1)*pageSize && index<currentPage*pageSize)
    },
  },

  methods: {
    renderLineChart () {
      const createOptions = (key) => {
        const data = []
        const axis = []
        this.searchWord.forEach(item => {
          data.push(item[key])
          axis.push(item.word)
        })
        return {
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: axis
          },
          yAxis: {
            show: false
          },
          tooltip: {},
          series: [{
            type: 'line',
            data,
            areaStyle: {
              color: 'rgba(95,187,255,.5)'
            },
            lineStyle: {
              color: 'rgb(95,187,255)'
            },
            itemStyle: {
              opacity: 0
            },
            smooth: true
          }],
          grid: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          }
        }
      }
      this.searchUserOptions = createOptions('user')
      this.searchCountOptions = createOptions('count')
    },

    renderPieChart() {
      let data = this[this.radioSelect === '品类' ? 'categoryRank' : 'goodsRank'].data1
      let axis = this[this.radioSelect === '品类' ? 'categoryRank' : 'goodsRank'].axisX
      let total = data.reduce((pre, item) => pre + item, 0)
      const chartData = data.map((item, index) => {
        const percent = `${(item / total * 100).toFixed(2)}%`
        return {
          legendname: axis[index],
          value: item,
          percent,
          itemStyle: {
            color: colors[index]
          },
          name: `${axis[index]} | ${percent}`
        }
      })
      this.rankOptions = {
        title: [{
          text: `${this.radioSelect}分布`,
          textStyle: {
            fontSize: 14,
            color: '#666'
          },
          left: 20,
          top: 20
        }, {
          text: '累计订单量',
          subtext: total,
          x: '34.5%',
          y: '42.5%',
          textStyle: {
            fontSize: 14,
            color: '#999'
          },
          subtextStyle: {
            fontSize: 28,
            color: '#333'
          },
          textAlign: 'center'
        }],
        series: [{
          name: '品类分布',
          type: 'pie',
          data: chartData,
          label: {
            normal: {
              show: true,
              position: 'outter',
              formatter: function (params) {
                return params.data.legendname
              }
            }
          },
          center: ['35%', '50%'],
          radius: ['45%', '60%'],
          labelLine: {
            normal: {
              length: 5,
              length2: 3,
              smooth: true
            }
          },
          clockwise: false,
          itemStyle: {
            borderWidth: 4,
            borderColor: '#fff'
          }
        }],
        legend: {
          type: 'scroll',
          orient: 'vertical',
          height: 250,
          left: '70%',
          top: 'middle',
          textStyle: {
            color: '#8c8c8c'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const str = params.seriesName + '<br />' +
              params.marker + params.data.legendname + '<br />' +
              '数量：' + params.data.value + '<br />' +
              '占比：' + params.data.percent + '%'
            return str
          }
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .bottom-view {
    display: flex;
    margin-top: 20px;
    .view {
      flex: 1;

      &:first-child {
        margin-right: 10px;
      }
      &:last-child {
        margin-left: 10px;
      }

      ::v-deep .el-card__header {
        padding: 0 20px;
      }
      .view-header {
        display: flex;
        height: 60px;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
      }

      .search-view {
        display: flex;
        flex-direction: column;
        height: 450px;
        .chart-wrapper {
          width: 100%;
          display: flex;
          .chart {
            &:first-child {
              margin-right: 10px;
            }
            flex: 1;
            .title {
              color: #999;
              font-size: 14px;
            }
            .count {
              font-size: 22px;
              color: #333;
              font-weight: 500;
              letter-spacing: 2px;
            }
            .echarts {
              height: 50px;
            }
          }
        }
        .search-table {
          flex: 1;
          margin-top: 20px;
          .el-pagination {
            display: flex;
            margin-top: 10px;
            justify-content: flex-end;
          }
        }
      }
    }
  }
</style>
