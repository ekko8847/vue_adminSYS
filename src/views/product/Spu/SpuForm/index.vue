<template>
  <el-form label-width="100px" :model="spuInfo">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
        <el-option
          :label="tm.tmName"
          :value="tm.id"
          v-for="(tm, index) in trademarkList"
          :key="tm.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input
        v-model="spuInfo.description"
        placeholder="SPU描述"
        type="textarea"
        rows="4"
      ></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :file-list="spuImageList"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handlePictureSuccess"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select
        v-model="saleAttrIdName"
        :placeholder="
          unSelectsaleAttrList.length > 0
            ? `还有${unSelectsaleAttrList.length}未选择`
            : `暂无可选择属性`
        "
      >
        <el-option
          :label="unSelectsaleAttr.name"
          :value="`${unSelectsaleAttr.id}:${unSelectsaleAttr.name}`"
          v-for="(unSelectsaleAttr, index) in unSelectsaleAttrList"
          :key="unSelectsaleAttr.id"
        ></el-option>
      </el-select>
      <el-button
        :disabled="!saleAttrIdName"
        type="primary"
        icon="el-icon-plus"
        @click="addSalesAttr"
        >添加销售属性</el-button
      >
      <el-table border style="width: 100%" :data="spuInfo.spuSaleAttrList">
        <el-table-column type="index" align="center" label="序号" width="80">
        </el-table-column>
        <el-table-column prop="saleAttrName" label="属性名" width="150">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称列表" width="width">
          <template slot-scope="{ row, $index }">
            <!-- 
            closable控制tag组件是否带有×
            :disable-transitions="false"tag关闭的时候是否有过渡动画
             -->
            <el-tag
              :disable-transitions="false"
              v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
              :key="spuSaleAttrValue.id"
              closable
              @close="row.spuSaleAttrValueList.splice(index, 1)"
              >{{ spuSaleAttrValue.saleAttrValueName }}
            </el-tag>
            <!-- 这里是通过点击给每一行的row的响应式设置isEdit为true
             再通过判断isEdit属性是否为true来动态显示input框 -->
            <el-input
              v-if="row.isEdit"
              ref="saveTagInput"
              v-model="row.saleAttrValueName"
              class="input-new-tag"
              size="small"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            ></el-input>
            <el-button v-else size="small" @click="showInput(row)">
              添加
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="150">
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <!-- 同步修改父组件数据 -->
      <el-button @click="$emit('update:isShowSpuForm', false)">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuForm",
  // props:['isShowSpuForm'],

  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      category3Id: "",
      //就是select收集的销售属性id和name组成的字符串
      saleAttrIdName: "",
      //根据接口返回的数据确定结构
      spuInfo: {
        // v-model直接收集
        description: "",
        spuName: "",
        tmId: "",
        //下面两个都是新添加的参数
        category3Id: "",
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          // spuSaleAttrValueList: [
          //   {
          //     baseSaleAttrId: 0,
          //     id: 0,
          //     isChecked: "string",
          //     saleAttrName: "string",
          //     saleAttrValueName: "string",
          //     spuId: 0,
          //   },
          // ],
          // },
        ]
      },

      trademarkList: [],
      baseSaleAttrList: [],
      spuImageList: []
    };
  },
  computed: {
    /* 通过所有的销售属性列表(请求回来的)
    和spu自己的销售属性列表(spuInfo包含的)
    来计算出未选择的销售属性列表
    filter + every
    */

    unSelectsaleAttrList() {
      return this.baseSaleAttrList.filter(item =>
        this.spuInfo.spuSaleAttrList.every(
          item1 => item1.saleAttrName !== item.name
        )
      );
    }
  },
  methods: {
    //upload图片上传成功的回调(收集数据)
    handlePictureSuccess(res, file, fileList) {
      this.spuImageList = fileList;
    },
    //删除图片的时候的回调(收集数据)
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    //预览大图的时候,点击图片放大镜的操作(自带的)
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    // 请求获取添加spu的初始化动态数据(发两个请求)
    async getAddSpuFormInitData(category3Id) {
      this.category3Id = category3Id;
      //获取所有的品牌列表
      const trademarkResult = await this.$API.trademark.getList();
      if (trademarkResult.code === 200 || trademarkResult.code === 20000) {
        this.trademarkList = trademarkResult.data;
      }
      //获取所有的销售属性
      const attrResult = await this.$API.spu.getSaleAttrList();
      if (attrResult.code === 200 || attrResult.code === 20000) {
        this.baseSaleAttrList = attrResult.data;
      }
    },

    // 请求获取修改spu的初始化动态数据(发4个请求)
    async getUpdateSpuFormInitData(spu, category3Id) {
      this.category3Id = category3Id;
      //根据spu的id获取spu的详情
      const result = await this.$API.spu.get(spu.id);
      if (result.code === 200 || result.code === 20000) {
        this.spuInfo = result.data;
      }
      //根据spu的id获取spu的图片列表
      const imgResult = await this.$API.sku.getSpuImageList(spu.id);
      if (imgResult.code === 200 || imgResult.code === 20000) {
        let spuImageList = imgResult.data;
        //给每个图片对象添加name和url.便于upload可以展示
        spuImageList.forEach(item => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        //最终添加后的item再赋值给data数据也是响应式的
        this.spuImageList = spuImageList;
      }
      //下面这两个请求和添加一样
      const trademarkResult = await this.$API.trademark.getList();
      if (trademarkResult.code === 200 || trademarkResult.code === 20000) {
        this.trademarkList = trademarkResult.data;
      }
      const attrResult = await this.$API.spu.getSaleAttrList();
      if (attrResult.code === 200 || attrResult.code === 20000) {
        this.baseSaleAttrList = attrResult.data;
      }
    },
    //点击添加销售属性
    addSalesAttr() {
      //从数组中解构
      let [baseSaleAttrId, saleAttrName] = this.saleAttrIdName.split(":");
      let obj = {
        baseSaleAttrId,
        saleAttrName,
        //添加的固定结构
        spuSaleAttrValueList: []
      };
      this.spuInfo.spuSaleAttrList.push(obj);
      //清空原来选择的数据
      this.saleAttrIdName = "";
    },
    //点击销售属性的添加按钮
    showInput(row) {
      this.$set(row, "isEdit", true);
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    //添加属性值的input按下enter和失去焦点回调
    handleInputConfirm(row) {
      let { baseSaleAttrId, saleAttrValueName } = row;
      if (saleAttrValueName.trim() == "") {
        //为空的话清空input框并不显示
        row.saleAttrValueName;
        row.isEdit = false;
        return;
      }
      //判断是否和之前的重复
      let isRepeat = row.spuSaleAttrValueList.some(
        item => item.saleAttrValueName === saleAttrValueName.trim()
      );
      if (isRepeat) {
        this.$message("属性值不能重复!");
        row.saleAttrValueName = "";
        row.isEdit = false;
        return;
      }
      //将添加的数据收集好构造成属性值对象
      let obj = { baseSaleAttrId, saleAttrValueName };
      //把属性值对象添加到这一行的属性值列表中
      row.spuSaleAttrValueList.push(obj);
      row.saleAttrValueName = "";
      row.isEdit = false;
    },
    //点击保存按钮
    async save() {
      let { category3Id, spuInfo, spuImageList } = this;
      //整理好接口文档所需的参数
      spuInfo.category3Id = category3Id;
      spuInfo.spuImageList = spuImageList.map(item => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data
        };
      });
      spuInfo.spuSaleAttrList.forEach(item => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      });
      //发请求
      try {
        const result = await this.$API.spu.addUpdate(spuInfo);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存SPU成功!");
          //返回列表页(.sync)
          this.$emit("update:isShowSpuForm", false);
          this.$emit("backSuccess", spuInfo.id);
          //清空data数据(这个组件并不会销毁 所以数据依然存在)
          this.resetData();
        } else {
          this.$message.error("保存SPU失败");
        }
      } catch (error) {
        this.$message.error("请求失败");
      }
    },
    resetData() {
      // this.$options.data是函数，调用完成拿到最初始的data返回的对象
      Object.assign(this._data, this.$options.data());
    }
  }
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
