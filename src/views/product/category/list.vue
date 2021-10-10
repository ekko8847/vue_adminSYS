<template>
  <div>
    <el-table
      v-show="!showFormPage"
      class="category-list"
      border
      lazy
      :data="categorys"
      :load="load"
      style="width:90%; margin-bottom:20px;"
      :row-key="getRowKey"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="分类ID" align="center" width="150" />

      <el-table-column prop="name" label="分类名称" sortable />

      <el-table-column label="操作" width="250" align="center">
        <template v-slot="{ row, $index }">
          <HintButton
            v-if="$hasBP('btn.Category.add')"
            :title="row.level && row.level == 1 ? '添加分类' : '添加内容'"
            :disabled="!row.level"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="showPages(row)"
          />
          <HintButton
            :title="row.level ? '查看分类' : '查看内容'"
            size="mini"
            type="info"
            icon="el-icon-info"
            @click="showCategoryInfo(row)"
          />
          <HintButton
            v-if="$hasBP('btn.Category.update')"
            :title="row.level ? '修改分类' : '修改内容'"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="updateCategory(row)"
          />
          <HintButton
            v-if="$hasBP('btn.Category.remove')"
            :title="row.level ? '删除分类' : '删除内容'"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCategory(row)"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加分类" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="id" :label-width="formLabelWidth">
          <el-input v-model="form.id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateCategory">确 定</el-button>
      </div>
    </el-dialog>
    <el-form
      ref="form"
      :model="contenForm"
      label-width="80px"
      v-if="showFormPage"
    >
      <el-form-item label="id">
        <el-input v-model="contenForm.id"></el-input>
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="contenForm.title"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          type="textarea"
          v-model="contenForm.describe"
          rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item label="图片">
        <!-- :file-list="spuImageList"就是在展示图片列表
      每个图片对象当中必须有name和url -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="imageList"
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
      <el-form-item>
        <el-button type="primary" @click="saveContent">保存</el-button>
        <el-button @click="showFormPage = false">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategoryList",

  data() {
    return {
      categorys: [], //用于存储所有分类列表的数组
      dialogFormVisible: false,
      showFormPage: false,
      formLabelWidth: "120px",
      //添加分类时需要的数据
      form: {
        id: "",
        name: ""
      },
      //添加内容时需要的数据
      contenForm: {
        id: "",
        title: "",
        describe: ""
      },
      imageList: [],
      dialogVisible: false,
      dialogImageUrl: ""
    };
  },

  mounted() {
    this.getCategorys1();
  },

  methods: {
    /*
    获取一级分类列表显示
    */
    getCategorys1() {
      this.$API.category.getCategorys1().then(result => {
        const categorys = result.data;
        categorys.forEach(c => {
          c.hasChildren = true;
          c.level = 1;
        });
        this.categorys = categorys;
      });
    },

    /*
    异步加载下一级分类列表显示
    */
    async load(row, treeNode, resolve) {
      // console.log("---", row, treeNode);
      if (row.level === 1) {
        const categorys2 = await this.getCategorys2(row);
        console.log("---", row);
        resolve(categorys2);
      } else if (row.level === 2) {
        const categorys3 = await this.getCategorys3(row);
        console.log("@@@", row);
        resolve(categorys3);
      }
    },

    /*
    获取二级分类列表, 返回包含数据的promise对象
    */
    getCategorys2(row) {
      return this.$API.category.getCategorys2(row.id).then(result => {
        const categorys2 = result.data;
        if (categorys2 && categorys2.length > 0) {
          categorys2.forEach(item => {
            // 标识有子分类
            item.hasChildren = true;
            // 分类级别为2级
            item.level = 2;
          });
          return categorys2;
        } else {
          row.hasChildren = false;
          return [];
        }
      });
    },

    /*
    获取三级分类列表, 返回包含数据的promise对象
    */
    async getCategorys3(row) {
      const result = await this.$API.category.getCategorys3(row.id);
      const categorys3 = result.data;
      if (categorys3 && categorys3.length > 0) {
        return categorys3;
      } else {
        row.hasChildren = false;
        return [];
      }
    },

    /*
    动态确定当前行的唯一key
    */
    getRowKey(row) {
      return row.level + "-" + row.id;
    },

    /*
    返回二级分类列表的类名
    */
    tableRowClassName({ row, rowIndex }) {
      if (row.level === 2) {
        return "level2-row";
      }
    },

    showPages(row) {
      if (row.level === 1) {
        this.dialogFormVisible = true;
        this.form = {
          id: "",
          name: ""
        };
      } else {
        this.showFormPage = true;
        this.contenForm = {
          id: "",
          title: "",
          describe: ""
        };
      }
    },
    showCategoryInfo(row) {},
    updateCategory(row) {},
    deleteCategory(row) {},
    addOrUpdateCategory() {},
    saveContent() {},
    /*   cancel() {
      this.showFormPage = false;
      // this.contentForm = {
      //   id: "",
      //   title: "",
      //   describe: ""
      // };

      Object.keys(this.contentForm).forEach(key => (contentForm[key] = ""));
    } */
    // 上传图片成功的回调，这里面用户也要收集新的图片列表
    handlePictureSuccess(res, file, fileList) {
      this.imageList = fileList;
    },

    // 删除图片的时候的回调函数，点击图片删除的操作，里面需要收集新的图片列表
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.imageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    }
  }
};
</script>
<style lang="scss">
.category-list {
  .level2-row {
    background: #f0f9eb;
  }
}
</style>
