<template>
  <common-card class="total-sales" title="今日销售额" :value="salesToday">
    <template>
      <div class="compare-wrap">
        <div class="compare">
          <span>日同比</span>
          <span class="emphasis">{{salesGrowthLastDay}}</span>
          <div :class="salesGrowthLastDay.startsWith('-') ? 'decrement' : 'increment'"></div>
        </div>
        <div class="compare">
          <span>月同比</span>
          <span class="emphasis">{{salesGrowthLastMonth}}</span>
          <div :class="salesGrowthLastMonth.startsWith('-') ? 'decrement' : 'increment'"></div>
        </div>
      </div>
    </template>

    <template v-slot:total>
      <span>昨日销售额</span>
      <span class="emphasis">{{salesLastDay}}</span>
    </template>
  </common-card>
</template>

<script>
import {commonCardMxin, reportDataMixin} from '../mixins'
export default {
  name: 'TotalSales',
  mixins: [commonCardMxin, reportDataMixin]
}
</script>

<style lang="scss" scoped>
  .compare-wrap {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .compare {
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
        color: #666;
        margin-top: 5px;
      }
    }
  
</style>
