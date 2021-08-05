<template>
  <div>
    <el-button type="primary" icon="el-icon-plus">添加</el-button>

    <!-- element-ui表格用的很多 
    eltable 回车会出现表格自动带一个列
    看我们需要几个列，拷贝几个列-->

    <!-- el-table标签里面属性是表格属性，一般用的比较多的
    设定表格是否有边框   添加border 
    设定让表格显示的数据  data可以设定表格要展示的数据，数据格式必须是数组-->

    <!-- el-table-column标签里面属性是列的属性
    prop属性代表是显示的数据对象的哪个属性 
    labels设定这一列的表头名称用的
    width设定这一列的宽度
    type 设定这列的类型  type=index 代表是序号列，序号会自动填上
    align="center/left/right" 控制这一列数据显示居左还是居右还是居中
    -->

    <!-- table展示动态数据依赖的就是data属性，这个数据必须是数组
    当我们data有数据的时候，那么会默认把data的数据分别给每个列都传递一份 
    每个列组件内部是在展示我们的列表，说白了就是vfor，至于说展示的是这个列表当中对象的哪个属性
    我们需要自己通过prop指定
    内部只是展示我们的数据，而如果这个数据是需要额外的结构，那么内部说了不算，又外部（父组件）说了算
    -->
    <el-table
      :data="trademarkList"
      border
      style="width: 100%;margin:20px 0">
      <el-table-column
        align="center"
        type="index"
        label="序号"
        width="80">
      </el-table-column>
       <el-table-column
        prop="tmName"
        label="品牌名称"
        width="width">
      </el-table-column>
       <el-table-column
        prop="logoUrl"
        label="品牌LOGO"
        width="width">
        <!-- row代表的就是当前遍历的这一项，如果你不知道row是谁，就看data是哪个数组 -->
        <!-- data里面的某一项就是这个row -->
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" alt="" style="width:80px;height:60px">
        </template>
      </el-table-column>
       <el-table-column
        prop="prop"
        label="操作"
        width="width">
        <template slot-scope="{row,$index}">
          <el-button type="warning" icon="el-icon-edit" size="mini">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- element-ui里面的分页器
    用法和我们当年定义的自己的分页器类似
    4个数据  一个事件
    :pager-count="7" 代表连续数，在这里说的是总按钮的数，比我们原来多2
    :page-sizes="[3, 5, 10] 可以改变每页的数量，第一个值必须和page-size一样
     -->
     <!--  @current-change="handleCurrentChange" 改变页面对应的事件-->
     <!--  @size-change="handleSizeChange" 改变每页显示数量的时候的事件 -->
    <el-pagination
      style="text-align:center"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      :current-page="page"
      :total="total"
      :page-size="limit"
      :pager-count="7"
      :page-sizes="[3, 5, 10]"
      layout="prev, pager, next, jumper,->,sizes,total"
      >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'Trademark',
  data(){
    return {
      page:1,
      limit:3,
      trademarkList:[],
      total:0
    }
  },
  mounted(){
    this.getTrademarkList()
  },
  methods:{
    async getTrademarkList(page = 1){
      this.page = page
      const result = await this.$API.trademark.getPageList(this.page,this.limit)
      if(result.code === 20000 || result.code === 200){
        // console.log(result.data)
        this.trademarkList = result.data.records
        this.total = result.data.total
      }
    },
    handleSizeChange(size){
      this.limit = size
      this.getTrademarkList()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
