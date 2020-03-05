<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
      <!-- 商品分类区域 -->
      <el-row>
        <el-col :span="12">
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover',
                      value: 'cat_id',
                      label: 'cat_name',
                      children: 'children',
                      }"
            @change="cascaderChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab标签页 -->
      <el-tabs type="border-card" v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数列表 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="medium"
            :disabled="isBtnDisabled"
            @click="addFormVisible= true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>

            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  size="small"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性列表 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="medium"
            :disabled="isBtnDisabled"
            @click="addFormVisible= true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :key="index"
                  v-for="(item,index) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>

            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  size="small"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addFormVisible"
      width="50%"
      @close="addFormClose"
    >
      <!-- 添加参数/属性的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editFormVisible"
      width="50%"
      @close="editFormClose"
    >
      <!-- 添加参数/属性的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取级联选择框分类参数列表
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      // 默认选择激活的tab
      activeName: 'many',
      // 获取的动态参数的数据
      manyTableData: [],
      // 获取的静态参数的数据
      onlyTableData: [],
      // 添加参数/属性 对话框的显示与隐藏
      addFormVisible: false,
      //  添加参数/属性的表单
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改参数对话框的显示与隐藏
      editFormVisible: false,
      // 修改参数对话的表单数据
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      this.cateList = res.data
    },
    // 监听 级联选择框选中项发生变化时
    cascaderChange() {
      this.getParamsData()
    },
    // 监听tab 被选中时触发
    handleTabClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 获取参数的列表数据
    async getParamsData() {
      //  说明选中的不是为三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('只允许为第三级分类设置相关参数！')
      }
      //根据所选分类的商品id,和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(this.meta.msg)
      } else {
        res.data.forEach(item => {
          // 原本attr_vals 为字符串，最终切割返回值为一个数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 自定义属性，避免多个文本框冲突
          item.inputVisible = false
          // 输入框的值
          item.inputValue = ''
        })
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    // 监听添加参数/属性 对话框的 关闭事件
    addFormClose() {
      // 清空表单数据
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.getParamsData()
          this.addFormVisible = false
        }
      })
    },
    // 显示修改参数对话框
    async showEditDialog(attr_id) {
      console.log(attr_id)
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.editForm = res.data
        this.editFormVisible = true
      }
    },
    // 监听修改参数/属性 对话框的 关闭事件
    editFormClose() {
      // 清空表单数据
      this.$refs.editFormRef.resetFields()
    },
    //  确认按钮 修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.getParamsData()
          this.editFormVisible = false
        }
      })
    },
    // 删除参数 按钮
    async deleteParams(attr_id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.$message.success(res.meta.msg)
        this.getParamsData()
      }
    },
    // 将attr_valus 的数据 提交保存到数据库中
    async saveAttrVals(row) {
      // 发起请求，保存到数据库中
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.$message.success('修改参数项成功')
      }
    },
    // 文本输入框的失去焦点和事件和enter事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 如果没有return，则输入内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())

      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },

    // 添加按钮
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick 的作用： 当页面上的元素重新渲染之后，才会调用回调函数
      // 因为重新渲染后，页面上的元素其实还是按钮，并不是一个文本框
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //标签关闭事件
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 计算属性，是一个属性，所以要用属性绑定的方式
    // 控制 添加属性/参数 按钮是否禁用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 获取当前选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    //监听 对话框标题是 添加动态参数还是静态属性
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>


<style lang="less" scoped>
.el-alert {
  margin-bottom: 20px;
}
.el-cascader {
  display: inline-block;
}
.el-tabs {
  margin-top: 20px;
}
.el-tag {
  margin-left: 15px;
}
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
</style>>
