import CommonCard from '../components/CommonCard'

export const commonCardMxin = {
  components: {
    CommonCard
  }
}

function formatNumber(number) {
  const reg = /\d{1,3}(?=(\d{3})+$)/g
  return `${number}`.replace(reg, '$&,')
}

function wrapperObject(o, k) {
  if (o && k.indexOf('.') >= 0) {
    const keys = k.split('.')
    keys.forEach(key => {
      o = o[key]
    })
    return o
  } else {
    return o && o[k] ? o[k] : {}
  }
}

function wrapperArray(o, k) {
  return o && o[k] ? o[k] : []
}

function wrapperMoney(o, k) {
  return o && o[k] ? `¥ ${formatNumber(o[k])}` : '¥ 0.00'
}

function wrapperOriginalNumber(o, k) {
  return o && o[k] ? o[k] : 0
}

function wrapperNumber(o, k) {
  return o && o[k] ? formatNumber(o[k]) : '0'
}

function wrapperPercentage(o, k) {
  return o && o[k] ? `${o[k]}%` : '0%'
}


export const reportDataMixin = {

  computed: {
    // 报表总数据
    reportData() {
      return this.getReportData()
    },

    wordCloud () {
      return this.getWordCloud()
    },

    /* 销售额图表数据 */
    // 今日销售额
    salesToday() {
      return wrapperMoney(this.reportData, 'salesToday')
    },
    // 昨日销售额
    salesLastDay() {
      return wrapperMoney(this.reportData, 'salesLastDay')
    },
    // 日同比
    salesGrowthLastDay() {
      return wrapperPercentage(this.reportData, 'salesGrowthLastDay')
    },
    // 月同比
    salesGrowthLastMonth() {
      return wrapperPercentage(this.reportData, 'salesGrowthLastMonth')
    },

    /* 订单图表数据 */
    // 今日订单量
    orderToday() {
      return wrapperNumber(this.reportData, 'orderToday')
    },
    // 昨日订单量
    orderLastDay() {
      return wrapperNumber(this.reportData, 'orderLastDay')
    },
    // 订单趋势
    orderTrend() {
      return wrapperArray(this.reportData, 'orderTrend')
    },

    /* 交易用户图表数据 */
    // 今日交易用户数
    orderUser() {
      return wrapperNumber(this.reportData, 'orderUser')
    },
    // 退货率
    returnRate() {
      return wrapperPercentage(this.reportData, 'returnRate')
    },
    // 交易用户数趋势
    orderUserTrend() {
      return wrapperArray(this.reportData, 'orderUserTrend')
    },
    // 交易用户数X轴数据
    orderUserTrendAxis() {
      return wrapperArray(this.reportData, 'orderUserTrendAxis')
    },

    /* 用户数图表数据 */
    // 累计用户数
    userToday() {
      return wrapperNumber(this.reportData, 'userToday')
    },
    // 今日用户数量
    userTodayNumber() {
      return wrapperOriginalNumber(this.reportData, 'userToday')
    },
    // 上个月用户数量
    userLastMonth() {
      return wrapperOriginalNumber(this.reportData, 'userLastMonth')
    },
    // 日增长
    userGrowthLastDay() {
      return wrapperNumber(this.reportData, 'userGrowthLastDay')
    },
    // 月增长
    userGrowthLastMonth() {
      return wrapperNumber(this.reportData, 'userGrowthLastMonth')
    },


    /* 销售额和访问量数据 */
    // 年度销售额趋势
    orderFullYear() {
      return wrapperArray(this.reportData, 'orderFullYear')
    },
    // 年度销售额X轴
    orderFullYearAxis() {
      return wrapperArray(this.reportData, 'orderFullYearAxis')
    },
    // 年度访问用户趋势
    userFullYear() {
      return wrapperArray(this.reportData, 'userFullYear')
    },
    // 年度访问用户趋势
    userFullYearAxis() {
      return wrapperArray(this.reportData, 'userFullYearAxis')
    },


    /* 排行相关数据 */
    // 订单排行
    orderRank() {
      return wrapperArray(this.reportData, 'orderRank')
    },
    // 用户访问排行
    userRank() {
      return wrapperArray(this.reportData, 'userRank')
    },

    // 搜索用户与搜索量图表数据
    searchWord() {
      return wrapperArray(this.reportData, 'searchWord')
    },

    // 分类排行图表数据
    categoryRank() {
      return wrapperObject(this.reportData, 'saleRank.category')
    },

    // 商品排行图表数据
    goodsRank() {
      return wrapperObject(this.reportData, 'saleRank.goods')
    },
  },
  
  filters: {
    // 数值格式化，添加，分隔
    'format-number'(number) {
      return formatNumber(number)
    }
  },

  inject: ['getReportData']
}