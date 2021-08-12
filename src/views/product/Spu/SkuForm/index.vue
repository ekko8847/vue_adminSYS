<template>
  <el-form label-width="100px">
    <el-form-item label="SPU名称">{{ spu.spuName }}</el-form-item>

    <el-form-item label="SKU名称">
      <el-input v-model="skuInfo.skuName" placeholder="SKU名称"></el-input>
    </el-form-item>

    <el-form-item label="价格(元)">
      <el-input
        v-model="skuInfo.price"
        placeholder="价格(元)"
        type="number"
      ></el-input>
    </el-form-item>

    <el-form-item label="重量(千克)">
      <el-input
        v-model="skuInfo.weight"
        placeholder="重量(千克)"
        type="number"
      ></el-input>
    </el-form-item>

    <el-form-item label="规格描述">
      <el-input
        v-model="skuInfo.skuDesc"
        placeholder="规格描述"
        type="textarea"
        rows="4"
      ></el-input>
    </el-form-item>
    <!-- 将每一个选中的销售属性通过options身上的value收集一个saleAttrId和valueId
     再通过v-mdel绑定到saleAttr身上()
  -->
    <el-form-item label="销售属性">
      <el-form label-width="100px" :inline="true">
        <el-form-item
          v-for="(saleAttr, index) in spuSaleAttrList"
          :label="saleAttr.saleAttrName"
          :key="saleAttr.id"
        >
          <el-select v-model="saleAttr.saleAttrIdValueId" placeholder="请选择">
            <el-option
              v-for="(item, index) in saleAttr.spuSaleAttrValueList"
              :key="item.id"
              :label="item.saleAttrValueName"
              :value="`${saleAttr.id}:${item.id}`"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form label-width="100px" :inline="true">
        <el-form-item
          v-for="(attr, index) in attrList"
          :label="attr.attrName"
          :key="attr.id"
          ><el-select v-model="attr.attrIdValueId" placeholder="请选择">
            <el-option
              v-for="item in attr.attrValueList"
              :key="item.id"
              :label="item.valueName"
              :value="`${attr.id}:${item.id}`"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table
        border
        :data="spuImageList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="55">
        </el-table-column>
        <el-table-column label="图片" width="width" prop="prop">
          <template slot-scope="{ row, $index }">
            <img :src="row.imgUrl" alt="" style="width:100px;height:80px" />
          </template>
        </el-table-column>
        <el-table-column prop="imgName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="address" label="操作" width="width">
          <template slot-scope="{ row, $index }">
            <el-button
              v-if="row.isDefault === '0'"
              @click="changeDefault(row, spuImageList)"
              type="primary"
              size="mini"
              >设为默认</el-button
            >
            <el-tag v-else type="success">默认</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="cancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      attrList: [],
      spuSaleAttrList: [],
      spuImageList: [],

      skuInfo: {
        //以下三项父组件直接传递过来的不需要收集
        category3Id: "",
        spuId: "",
        tmId: "",
        //以下四项通过v-model收集
        price: "",
        weight: "",
        skuDesc: "",
        skuName: "",
        //下面的四个是需要自己想办法收集的
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: []

        /* 保存的时候发什么请求 需要哪些数据(参考接口文档)
        category3Id: 0,
        createTime: "2021-08-12T08:37:40.963Z",
        id: 0,
        isSale: 0,
        price: 0,
        skuAttrValueList: [
          {
            attrId: 0,
            attrName: "string",
            id: 0,
            skuId: 0,
            valueId: 0,
            valueName: "string"
          }
        ],
        skuDefaultImg: "string",
        skuDesc: "string",
        skuImageList: [
          {
            id: 0,
            imgName: "string",
            imgUrl: "string",
            isDefault: "string",
            skuId: 0,
            spuImgId: 0
          }
        ],
        skuName: "string",
        skuSaleAttrValueList: [
          {
            id: 0,
            saleAttrId: 0,
            saleAttrName: "string",
            saleAttrValueId: 0,
            saleAttrValueName: "string",
            skuId: 0,
            spuId: 0
          }
        ],
        spuId: 0,
        tmId: 0,
        weight: "string" */
      }
    };
  },
  methods: {
    async getAddSkuFormInitData(spu, category1Id, category2Id) {
      this.spu = spu;
      //获取平台属性列表
      let promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      //获取spu销售属性列表
      let promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      //获取spu的图片列表
      let promise3 = this.$API.sku.getSpuImageList(spu.id);
      /* Promise.all() 功能:批量处理promise(并发)
      参数:是一个promise对象组成的数组
      返回值:返回的是一个新的promise对象
      如果传递进去的多个promise对象有一个是失败的,
      那么返回的结果就是第一个失败的promise的原因;
      如果传递进去的多个promise对象都是成功的,
      那么返回的就是多个成功的promise的结果组成的数组
      */
      const result = await Promise.all([promise1, promise2, promise3]);
      this.attrList = result[0].data;
      this.spuSaleAttrList = result[1].data;
      let spuImageList = result[2].data;
      spuImageList.forEach(element => {
        element.isDefault = "0";
      });
      this.spuImageList = spuImageList;
    },
    //选择spu图片列表的时候,收集sku的图片列表(el-table)
    handleSelectionChange(val) {
      // this.multipleSelection = val;
      console.log(val);
      //val拿到的就是我们选中的图片
      this.skuImageList = val;
    },
    //设置默认选中图片的回调
    changeDefault(row, spuImageList) {
      spuImageList.forEach(item => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      //收集默认的图片
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    //点击保存按钮
    async save() {
      let { spu, attrList, spuSaleAttrList, skuImageList, skuInfo } = this;
      //整理参数
      //1,下面这是父组件传过来的
      skuInfo.category3Id = spu.category3Id;
      skuInfo.spuId = spu.id;
      skuInfo.tmId = spu.tmId;
      //2,整理图片列表
      skuInfo.skuImageList = skuImageList.map(item => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id
        };
      });
      //3.整理平台属性值列表
      let arr = [];
      attrList.forEach(item => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = { attrId, valueId };
          arr.push(obj);
        }
      });
      skuInfo.skuAttrValueList = arr;
      //4.整理销售属性列表
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = { attrId, valueId };
          prev.push(obj);
        }
        return prev;
      }, []);
      //发请求保存
      try {
        const result = await this.$API.sku.addUpdate(skuInfo);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存成功");
          //跳转到列表页
          this.$emit("update:isShowSkuForm", false);
          //清空data里的数据
          Object.assign(this._data, this.$options.data());
        } else {
          this.$message.error("保存失败");
        }
      } catch (error) {
        this.$message.error("请求失败");
      }
      //点取消按钮
    },
    cancel() {
      this.$emit("update:isShowSkuForm", false);
      Object.assign(this._data, this.$options.data());
    }
  }
};
</script>

<style lang="scss" scoped></style>
