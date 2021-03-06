<template>
  <div>
    <el-card>
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <!-- 列表页 -->
      <div v-show="isShowList">
        <el-button
          :disabled="!category3Id"
          type="primary"
          icon="el-icon-plus"
          @click="showAddDiv"
          >添加属性</el-button
        >
        <el-table :data="attrList" style="width: 100%" border>
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <!-- 作用域插槽：
        1、父组件传递数据给子组件
        2、子组件展示数据，展示的同时留插槽，回传当前展示的数据
        3、父组件接收回传的数据，判断数据添加结构再次传递给子组件当中的插槽 -->
          <el-table-column
            prop="attrValueList"
            label="属性值列表"
            width="width"
          >
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改"
                @click="showUpdateDiv(row)"
              >
              </HintButton>
              <el-popconfirm
                :title="`你确定删除${row.attrName}`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除"
                >
                </HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加修改时展示的页面 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input
              v-model="attrForm.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          :disabled="!attrForm.attrName"
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
        <el-table
          border
          :data="attrForm.attrValueList"
          style="width: 100%;margin: 20px 0"
        >
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                style="display:block;width: 100%"
                v-else
                @click="toEdit(row, $index)"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`你确定删除${row.valueName}吗?`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          :disabled="attrForm.attrValueList.length === 0"
          @click="save"
          >保存</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
/*  // 在vue当中，响应式的数据处理，对于数组和对象是不一样的
    // 数组只要用到了重写的7个方法，那么内部所有的东西一定是响应式
    // 对象的响应式数据是靠数据劫持（数据监视）
    // 对于我们初始化的data数据，一上来data里面就有的所有对象的属性（无论是外层还是内层的属性），
    // 都添加get和set方法达到响应式的目的，只要修改这些属性，set方法当中就会修改页面
    // 但是对于我们的对象来说只是一开始data里面的所有属性都添加了响应式，而后期自己给我们的响应式对象添加的属性
    // 通过点语法，添加的属性不是响应式，因为此时数据劫持和数据监视早都已经完成了 */
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,

      attrForm: {
        attrName: "",
        attrValueList: [
          // 收集属性值，其实就是要创建如下的对象，添加到attrForm.attrValueList这个数组里面
          // 问题：添加这个属性值对象的时候，属性值名称怎么来（我们得让用户去自己输入得来，不能写死）
          // 如何解决： 占位的思想，本质我们就是想让页面先出现一个输入框，然后输入属性值名称之后再收集到对象
          // 第一步：当用户点击添加平台属性值，我们让表格当中先出现一行，占位的，数据无所谓
          // 其实就是给attrValueList里面添加一条数据，数据里面的值随意，然后表格就会出现一行
          // 在这一行当中，我们给一个input，让用户输入这次添加的属性值名称
          // 第二步：在输入框当中我们只需要把输入框v-model绑定到用户刚刚添加进行的属性值对象的属性值名称身上就可以
          // {
          // attrId: 0,
          // id: 0,
          // valueName: "string",
          // },
        ],
        categoryId: "",
        categoryLevel: 3
      }
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      // console.log(111);
      //根据传过来的数据判断是几级id 同样的每次确定新id时应该清空旧id(只有在选中3级才确定发请求)
      if (level === 1) {
        // 如果用户选中1级，传递父组件，那么父组件也应该清空它里面的23级以及父组件当中的属性列表
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        // 如果用户选中2级，传递父组件，那么父组件也应该清空它里面的3级以及父组件当中的属性列表
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        // 如果用户选中3级,传递给父组件，那么此时我们只需要发请求获取属性列表数据
        this.category3Id = categoryId;
        // 发请求获取父组件当中的属性列表
        this.getAttrList();
      }
    },
    //发请求拿属性列表的数据
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200 || result.code === 20000) {
        this.attrList = result.data;
      }
    },
    //切换div模块显示 点击列表页添加
    showAddDiv() {
      this.isShowList = false;
      // 解决添加属性取消后再次点击添加，数据依然存在的问题
      this.attrForm = {
        attrValueList: [],
        attrName: "",
        categoryId: this.category3Id, //不能直接在data里面拿data的数据
        categoryLevel: 3 //代表的是几级
      };
    },
    // 点击列表页的修改按钮
    showUpdateDiv(row) {
      this.isShowList = false;
      //深度克隆目的是解决点击取消后同步修改(内部和外部)
      this.attrForm = cloneDeep(row);
      this.attrForm.attrValueList.forEach(item => {
        //这样添加isEdit就是响应式
        this.$set(item, "isEdit", false);
      });
    },

    //点击修改属性值
    /* 每个新添加的属性值，一上来应该是显示input  编辑模式;
    每个老的属性值，一上来应该是显示span   查看模式 */
    addAttrValue() {
      // 添加属性值和添加属性没关系
      // 添加属性的时候可以添加属性值，修改属性的时候，也可以添加属性值
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: "",
        isEdit: true
      });
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    // 点击span切换为input  从查看模式切换为编辑模式
    toEdit(row, index) {
      row.isEdit = true;
      //避免input还没创建好
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // input失去焦点或者回车切换为span 从编辑模式切换为查看模式,同时查看的时候需要对输入的内容做判断
    toLook(row) {
      let attrValueName = row.valueName;
      if (attrValueName.trim() === "") {
        row.valueName = "";
        return;
      }
      let isRepeat = this.attrForm.attrValueList.some(item => {
        if (item !== row) {
          return item.valueName === attrValueName;
        }
      });
      if (isRepeat) {
        this.$message.info("属性值不能重复!");
        row.valueName = "";
        return;
      }
      row.isEdit = false;
    },
    async save() {
      let attr = this.attrForm;
      //必须不为空且将自己添加的isEdit去掉
      attr.attrValueList.filter(item => {
        if (item.valueName !== "") {
          delete item.isEdit;
          //filter返回值必须为true
          return true;
        }
      });
      //当添加的属性值为空时,不发请求
      if (attr.attrValueList.length === 0) {
        this.$message.info("属性值至少得有一个!");
        return;
      }
      //开始发请求
      try {
        const result = await this.$API.attr.addOrUpdate(attr);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("保存成功!");
          //重新回到列表页
          this.isShowList = true;
          this.getAttrList();
        } else {
          this.$message.error("保存失败!");
        }
      } catch (error) {
        this.$message.error("请求数据失败");
      }
    },
    async deleteAttr(row) {
      try {
        const result = await this.$API.attr.delete(row.id);
        if (result.code === 200 || result.code === 20000) {
          this.$message.success("删除属性成功!");
          this.getAttrList();
        } else {
          this.$message.error("删除失败!");
        }
      } catch (error) {
        this.$message.error("请求失败");
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
