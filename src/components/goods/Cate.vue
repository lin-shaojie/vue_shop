<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加分按钮 -->
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 商品分类区域 -->
      <zk-table
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text="#"
        stripe
        border
        :expand-type="false"
        :selection-type="false"
      >
        <!-- 等级 -->
        <template slot="cat_deleted" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="cat_level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="editCateInfo(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </zk-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes,prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            ref="elcascader"
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',
                      value: 'cat_id',
                      label: 'cat_name',
                      children: 'children',
                      checkStrictly: true }"
            @change="parentCateChange"
            @visible-change="elCascaderOnlick"
            @expand-change="elCascaderOnlick"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑提交分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateInfoVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateInfoVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserMessage">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '是否有效',
          align: 'center',
          headerAlign: 'center',
          type: 'template',
          template: 'cat_deleted'
        },
        {
          label: '排序',
          align: 'center',
          headerAlign: 'center',
          type: 'template',
          template: 'cat_level'
        },
        {
          label: '操作',
          align: 'center',
          headerAlign: 'center',
          type: 'template',
          template: 'opt'
        }
      ],
      // 获取列表查询信息
      queryInfo: {
        type: 3,
        // 当前第几页
        pagenum: 1,
        // 每页几天数据
        pagesize: 5
      },
      // 添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 选择的父级分类的id数组
      selectedKeys: [],
      // 修改分类对话框的显示与隐藏
      editCateInfoVisible: false,
      // 修改分类查询到的结果
      editForm: {},
      // 修改分类的表单验证规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.cateList = res.data.result
        this.total = res.data.total
      }
    },

    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    // 改变当前页数
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    // 点击按钮显示添加分类对话框
    showAddCateDialog() {
      // 获取父级分类的数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.parentCateList = res.data
      }
    },
    // 监听 当选项发生变化时
    parentCateChange(value) {
      // console.log(this.selectedKeys)
      // selectedKeys 数组的长度如果大于0，说明选中了父级分类，反之没有选中。
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级负值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级负值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类对话框确认按钮
    addCate() {
      // console.log(this.addCateForm)
      //表单预验证
      this.$refs.addCateFormRef.validate(async valid => {
        //表单预验证失败
        if (!valid) return
        // 可以发起添加用户请求
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status != 201) {
          return this.$message.error(res.meta.msg)
        } else {
          this.addCateDialogVisible = false
          this.$message.success('创建成功！')
          this.getCateList()
        }
      })
    },
    // 监听对话框关闭，重置表单数据
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cate_level = 0
      this.addCateForm.cate_pid = 0
    },

    // 实现可以点击文字选中效果
    elCascaderOnlick() {
      let that = this
      setTimeout(function() {
        document.querySelectorAll('.el-cascader-node__label').forEach(el => {
          el.onclick = function() {
            this.previousElementSibling.click()
            that.$refs.elcascader.dropDownVisible = false
          }
        })
        document
          .querySelectorAll('.el-cascader-panel .el-radio')
          .forEach(el => {
            el.onclick = function() {
              that.$refs.elcascader.dropDownVisible = false
            }
          })
      }, 100)
    },
    // 编辑按钮，显示对话框
    async editCateInfo(id) {
      this.editCateInfoVisible = true
      const { data: res } = await this.$http.get(`categories/${id}`)
      this.editForm = res.data
    },
    // 编辑对话框的确认按钮，点击后实现修改
    async editUserMessage() {
      const { data: res } = await this.$http.put(
        'categories/' + this.editForm.cat_id,
        {
          cat_pid: this.editForm.cat_pid,
          cat_name: this.editForm.cat_name,
          cat_level: this.editForm.cat_level
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.editCateInfoVisible = false
      }
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // 如果用户点击了确认 删除，则返回字符串 confimr
      // 如果用户点击了取消，则返回字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)

      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>