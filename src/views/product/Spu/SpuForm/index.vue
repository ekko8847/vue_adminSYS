<template>
  <el-form label-width="100px">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称"></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <el-select value="" placeholder="请选择品牌">
        <el-option label="label" value="value"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input placeholder="SPU描述" type="textarea" rows="4"></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <el-upload
        action="https://jsonplaceholder.typicode.com/posts/"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select value="" placeholder="还有3未选择">
        <el-option label="label" value="value"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>
      <el-table border style="width: 100%">
        <el-table-column type="index" align="center" label="序号" width="80">
        </el-table-column>
        <el-table-column prop="prop" label="属性名" width="150">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称列表" width="width">
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="150">
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
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
      dialogVisible: false
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    // 请求获取添加spu的初始化动态数据
    getAddSpuFormInitData() {},

    // 请求获取修改spu的初始化动态数据
    getUpdateSpuFormInitData() {}
  }
};
</script>

<style lang="scss" scoped></style>
