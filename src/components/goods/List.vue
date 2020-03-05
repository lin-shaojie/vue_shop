<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框和添加商品区域 -->
      <el-row :gutter="20">
        <!-- 搜索框区域 -->
        <el-col :span="7">
          <el-input
            placeholder="请输入搜索内容"
            v-model="queryGoodsInfo.query"
            clearable
            @change="getGoodsList()"
            @clear="getGoodsList() "
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮区域 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="150px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editGoodsInfo(scope.row.goods_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteGoods(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryGoodsInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryGoodsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改商品对话框 -->
    <el-dialog title="修改商品" :visible.sync="setGoodsDialogVisible" width="50%">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsMessage">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询商品列表数据对象
      queryGoodsInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表的数据
      goodsList: [],
      //   商品总数
      total: 0,
      // 修改商品对话框的显示与影藏
      setGoodsDialogVisible: false,
      // 编辑商品要提交的表单数据
      editForm: {
        goods_id: 0,
        goods_cat: [],
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0
      },
      // 编辑商品的表单验证规则
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryGoodsInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      } else {
        this.goodsList = res.data.goods
        this.total = res.data.total
      }
    },
    // 改变每页显示几条
    handleSizeChange(val) {
      this.queryGoodsInfo.pagesize = val
      this.getGoodsList()
    },
    // 改变当前第几页
    handleCurrentChange(val) {
      this.queryGoodsInfo.pagenum = val
      this.getGoodsList()
    },
    // 删除商品按钮
    async deleteGoods(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
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
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status != 200) return this.$message.error('删除商品失败！')

      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 编辑商品
    async editGoodsInfo(id) {
      this.setGoodsDialogVisible = true
      const { data: res } = await this.$http.get(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('查询失败！')
      } else {
        this.editForm.goods_name = res.data.goods_name
        this.editForm.goods_price = res.data.goods_price
        this.editForm.goods_number = res.data.goods_number
        this.editForm.goods_weight = res.data.goods_weight
        this.editForm.goods_cat = res.data.goods_cat
        this.editForm.goods_id = res.data.goods_id
      }
    },
    // 添加商品按钮
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 确认提交编辑商品
    editGoodsMessage() {
      this.setGoodsDialogVisible = false
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        const { data: res } = await this.$http.put(
          `goods/${this.editForm.goods_id}`,
          this.editForm
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品信息失败！')
        } else {
          this.$message.success('编辑商品信息成功！')
          this.getGoodsList()
          this.setGoodsDialogVisible = false
        }
      })
    }
  },
  created() {
    this.getGoodsList()
  },
  computed: {
    cateId() {
      if (this.editForm.goods_cat.length == 3) {
        return this.editForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>