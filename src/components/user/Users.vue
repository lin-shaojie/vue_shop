<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入搜索内容" clearable @clear="getUsersList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" border>
        <el-table-column prop="date" type="index" :index="1" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-row :gutter="10">
              <el-col :span="8">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editUserInfo(scope.row.id)"
                ></el-button>
              </el-col>
              <el-col :span="8">
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeUser(scope.row.id)"
                ></el-button>
              </el-col>
              <el-col :span="8">
                <el-tooltip
                  class="item"
                  effect="light"
                  content="分配角色"
                  placement="top"
                  :enterable="false"
                >
                  <!-- 分配角色按钮 -->
                  <el-button
                    type="warning"
                    icon="el-icon-setting"
                    size="mini"
                    @click="setRole(scope.row)"
                  ></el-button>
                </el-tooltip>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addUserClose">
        <!-- 内容主体区域 -->
        <el-form :model="addUserInfo" :rules="addUserRules" ref="addUserRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserInfo.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserInfo.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserInfo.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editUserInfoVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserInfoVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserMessage">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <p>
        当前的用户:
        <strong>{{userInfo.username}}</strong>
      </p>
      <p>
        当前的角色:
        <strong>{{userInfo.role_name}}</strong>
      </p>
      <p>
        分配新角色:
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleDesc"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }

      callback(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return callback()
      }

      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 用户列表查询参数
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      pagenum: 0,
      total: 0,
      // 控制添加用户对话框的显示与影藏
      dialogVisible: false,
      // 控制修改用户信息的显示与隐藏
      editUserInfoVisible: false,
      //添加用户
      addUserInfo: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 查询用户信息
      editForm: {},
      // 添加用户验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到  8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框的 显示 与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      // 被选中的角色id
      selectRoleId: ''
    }
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status != 200)
        return this.$message.error('请求用户列表失败！')
      this.userList = res.data.users
      this.pagenum = res.data.pagenum
      this.total = res.data.total
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`)
      this.queryInfo.pagesize = val
      this.getUsersList()
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`)
      this.queryInfo.pagenum = val
      this.getUsersList()
    },
    // 监听用户状态
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      console.log(res)
      if (res.meta.status != 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      } else {
        return this.$message.success('更新用户状态成功！')
      }
    },
    // 监听关闭添加用户对话框
    addUserClose() {
      this.$refs.addUserRef.resetFields()
    },
    //确认按钮添加用户操作
    addUser() {
      //表单预验证
      this.$refs.addUserRef.validate(async valid => {
        //表单预验证失败
        if (!valid) return this.$message.error('请填写正确信息！')
        // 可以发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addUserInfo)
        if (res.meta.status != 201) {
          return this.$message.error('添加用户失败！')
        } else {
          this.$message.success('添加用户成功！')
          this.dialogVisible = false
          this.getUsersList()
        }
      })
    },
    async editUserInfo(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status != 200) {
        this.$message.error('查询用户信息失败！')
      } else {
        this.editForm = res.data
      }
      this.editUserInfoVisible = true
    }, // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改用户信息
    editUserMessage() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        //表单预验证失败
        if (!valid) return
        // 可以发起修改用户请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('更新用户信息失败！')
        } else {
          // 关闭对话框
          this.editUserInfoVisible = false
          this.$message.success('更新用户信息成功！')
          this.getUsersList()
        }
      })
    },
    // 根据id 删除用户对应的信息
    async removeUser(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
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
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status != 200) return this.$message.error('删除用户失败！')

      this.$message.success('删除用户成功！')
      this.getUsersList()
    },
    // 分配角色对话框
    async setRole(userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo

      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的新角色！')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('设置角色失败')
      } else {
        this.$message.success('设置角色成功')
        this.setRoleDialogVisible = false
        this.getUsersList()
      }
    },
    // 监听分配角色对话框
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  },
  created() {
    this.getUsersList()
  }
}
</script>
<style lang="less" scoped>
</style>