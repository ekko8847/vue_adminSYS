<template>
  <div>
    <el-card>
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddSpuForm"
        >
          添加SPU
        </el-button>
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column type="index" align="center" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="success"
                size="mini"
                icon="el-icon-plus"
                title="添加SKU"
                @click="showAddSkuForm(row)"
              >
              </HintButton>
              <HintButton
                type="warning"
                size="mini"
                icon="el-icon-edit"
                title="修改SPU"
                @click="showUpdateSpuForm(row)"
              >
              </HintButton>
              <HintButton
                type="info"
                size="mini"
                icon="el-icon-info"
                title="查看SPU的SKU列表"
                @click="showSkuList(row)"
              >
              </HintButton>
              <el-popconfirm
                :title="`确定删除${row.spuName}吗？`"
                @onConfirm="deleteSpu(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  title="删除SPU"
                >
                </HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
          :current-page="page"
          :page-sizes="[2, 3, 5]"
          :page-size="limit"
          :pager-count="7"
          :total="total"
          layout="prev, pager, next, jumper,->,sizes,total"
        >
        </el-pagination>
      </div>
      <!-- 使用.sync实现子向父通信(类似于自定义事件 但子组件里面触发事件写法不同) -->
      <!-- <SpuForm
        v-show="isShowSpuForm"
        :isShowSpuForm="isShowSpuForm"
        @update:isShowSpuForm="isShowSpuForm = $event"
      ></SpuForm> -->
      <SpuForm
        ref="spu"
        v-show="isShowSpuForm"
        :isShowSpuForm.sync="isShowSpuForm"
        @backSuccess="backSuccess"
      ></SpuForm>
      <SkuForm
        v-show="isShowSkuForm"
        ref="sku"
        :isShowSkuForm.sync="isShowSkuForm"
      >
      </SkuForm>
    </el-card>

    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
      :before-close="dialogClose"
    >
      <el-table :data="skuList" v-loading="loading">
        <el-table-column
          property="skuName"
          label="名称"
          width=""
        ></el-table-column>
        <el-table-column
          property="price"
          label="价格"
          width=""
        ></el-table-column>
        <el-table-column
          property="weight"
          label="地址"
          width=""
        ></el-table-column>
        <el-table-column property="prop" label="默认图片" width="">
          <template slot-scope="{ row, $index }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width:100px;height:80px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  components: {
    SkuForm,
    SpuForm
  },
  data() {
    return {
      isShowList: true,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 2,
      total: 0,
      //下面两个数据来控制三个页面的切换
      isShowSpuForm: false,
      isShowSkuForm: false,

      dialogTableVisible: false,
      spu: {},
      skuList: [],
      //指令加载
      loading: false
    };
  },
  //解决三级的联动的可操作性
  watch: {
    isShowSpuForm(newVal, oldVal) {
      this.isShowList = !newVal;
    },
    isShowSkuForm(newVal, oldVal) {
      this.isShowList = !newVal;
    }
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level == 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.category1Id = categoryId;
      } else if (level == 2) {
        (this.category3Id = ""), (this.spuList = []);
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    async getSpuList(pager = 1) {
      this.page = pager;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200 || result.code === 20000) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    //修改每页数量
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
    //添加spu按钮的回调
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spu.getAddSpuFormInitData(this.category3Id);
    },
    //修改spu按钮的回调(列表页)
    showUpdateSpuForm(row) {
      this.isShowSpuForm = true;
      this.$refs.spu.getUpdateSpuFormInitData(row, this.category3Id);
    },
    //添加sku按钮的回调(列表页)
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      //row里面包含category3Id(基础属性列表发请求需要)
      this.$refs.sku.getAddSkuFormInitData(
        row,
        this.category1Id,
        this.category2Id
      );
    },
    //子组件保存成功后的回调
    backSuccess(spuId) {
      if (spuId) {
        // 证明是修改回来的
        this.getSpuList(this.page);
      } else {
        // 证明是添加回来的
        this.getSpuList();
      }
    },
    //点击删除spu的回调
    async deleteSpu(row) {
      try {
        const result = await this.$API.spu.remove(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除成功");
          //删除之后刷新页面看当前页列表长度是否大于1 大于就在当前 否则回上一页
          this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1);
        } else {
          this.$message.error("删除失败");
        }
      } catch (error) {
        this.$message.error("请求失败", error.message);
      }
    },
    //点击查看spu的sku的回调
    async showSkuList(row) {
      this.dialogTableVisible = true;
      this.spu = row;
      //请求之前开启loading加载
      this.loading = true;
      try {
        const result = await this.$API.sku.getListBySpuId(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.skuList = result.data;
        } else {
          this.$message.error("获取sku列表失败!");
        }
      } catch (error) {
        this.$message.error("请求失败!");
      }
      //请求之后关闭loading加载(指令方式)
      this.loading = false;
    },
    //dialog框关闭之前的回调
    dialogClose(done) {
      //清空data里的数据
      this.spu = {};
      this.skuList = [];
      done();
    }
  }
};
</script>

<style lang="scss" scoped></style>
