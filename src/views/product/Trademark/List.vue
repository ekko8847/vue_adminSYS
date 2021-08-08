<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >

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
    <el-table :data="trademarkList" border style="width: 100%;margin:20px 0">
      <el-table-column align="center" type="index" label="序号" width="80">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <!-- row代表的就是当前遍历的这一项，如果你不知道row是谁，就看data是哪个数组 -->
        <!-- data里面的某一项就是这个row -->
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width:80px;height:60px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
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
    <!-- 添加和修改的dialog -->
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width:80%" :model="tmForm" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg文件,且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    var validateTmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称必须是2-10位")); //验证失败
      } else {
        callback(); //验证通过
      }
    };
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      //控制dialog框是否显示
      dialogFormVisible: false,
      tmForm: {
        logoUrl: "",
        tmName: ""
      },
      //验证规则
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          { validator: validateTmName, trigger: "change" }
        ],
        logoUrl: [{ required: true, message: "请选择品牌LOGO" }]
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    //请求数据
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 20000 || result.code === 200) {
        // console.log(result.data)
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    //切换每页显示数量(会默认传size过来)
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    handleAvatarSuccess(res, file) {
      //显示图片
      this.tmForm.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    //添加的时候清空dialog框 并让其展示
    showAddDialog() {
      this.dialogFormVisible = true;
      this.tmForm = {
        logoUrl: "",
        tmName: ""
      };
    },
    //修改和添加其实是一样的(用的都是确定按钮发送请求) 将本行的数据拷贝给input框收集到的(这样修改外面的数据不会变化)
    showUpdateDialog(row) {
      this.dialogFormVisible = true;
      //做了浅拷贝
      this.tmForm = { ...row };
    },
    //通过确定按钮发送请求 重新展示
    addOrUpdateTrademark() {
      this.$refs.tmForm.validate(async valid => {
        if (valid) {
          let trademark = this.tmForm;
          try {
            const result = await this.$API.trademark.addOrUpdate(trademark);
            if (result.code === 200 || result.code === 20000) {
              this.$message.success(
                trademark.id ? "修改品牌成功" : "添加品牌成功"
              );
              this.dialogFormVisible = false;
              //通过id判断是修改还是添加 添加停留在第一页 修改就在当前页
              this.getTrademarkList(trademark.id ? this.page : 1);
            } else {
              this.$message.error(
                trademark.id ? "修改品牌失败" : "添加品牌失败"
              );
            }
          } catch (error) {
            this.$message.error("请求失败!");
          }
        } else {
          this.$message.error("表单验证不合法!");
          return false;
        }
      });
    },
    //删除只需要拿到每一行的数据去删除(通过id)然后再请求数据刷新页面
    deleteTrademark(row) {
      this.$confirm(`确定删除${row.tmName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            const result = await this.$API.trademark.delete(row.id);
            if (result.code === 200 || result.code === 20000) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              // 删除哪一页的数据重新还是在哪一页，除非是最后一页，而且只有一条，删除之后回到前一页
              this.getTrademarkList(
                this.trademarkList.length > 1 ? this.page : this.page - 1
              );
            } else {
              this.$message.error("删除品牌失败");
            }
          } catch (error) {
            this.$message.error("删除品牌失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
