<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
        label-width="100px"
      >
        <!-- Tabs 标签页区域 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                ref="elcascader"
                clearable
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover',
                      value: 'cat_id',
                      label: 'cat_name',
                      children: 'children',
                      }"
                @change="parentCateChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="items"
                  v-for="(items,index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :on-success="upLoadSuccess"
              :headers="headers"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 上传图片时的预览图片的对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" style="width:100%" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 当前激活的步骤条和标签页
      activeIndex: '0',
      // 添加商品表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中项绑定值
        goods_cat: [],
        // 上传的图片临时路径
        pics: [],
        // 富文本编辑器的介绍
        goods_introduce: '',
        // 商品的参数（数组）
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
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
      },
      // 商品分类数据
      cateList: [],
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性面板数据
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片时候设置的请求头
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片对话框的显示与隐藏
      previewVisible: false,
      // 预览图片的路径
      previewPath: '',
      content: '<h2>I am Example</h2>',
      editorOption: {
        // some quill options
      }
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.cateList = res.data
      }
    },
    // 监听 级联选择框值发生变化的时候
    parentCateChange() {
      // selectedKeys 数组的长度如果大于0，说明选中了父级分类，反之没有选中。
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('请选择一个三级分类')
      }
    },
    // 切换标签之前的钩子,若返回 false则阻止切换。
    beforeTabLeave(activeName, oldActiveName) {
      // activeName oldActiveName 对应的值分别为 el-tab-pane 标签中的name属性的值
      if (oldActiveName == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择一个三级分类！')
        return false
      }
    },
    // 点击TAB页标签 发生的事件
    async tabClick() {
      //点击标签的时候 如果等于1说明 选中的为动态参数标签
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败！')
        } else {
          res.data.forEach(item => {
            item.attr_vals =
              item.attr_vals.length == 0
                ? (item.attr_vals = [])
                : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        }
      } else if (this.activeIndex === '2') {
        // 证明访问的静态属性面板
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败！')
        }
        this.onlyTableData = res.data
      }
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 文件列表移除文件时的钩子
    handleRemove(file) {
      // file表示为当前要移除的图片信息
      console.log(file)
      // 1. 获取要删除图片的临时路径
      const tmpPath = file.response.data.tmp_path
      // 2.根据临时路径从数组中找到该索引值
      const index = this.addForm.pics.findIndex(x => {
        // x为数组中的每一项
        return x.pic == tmpPath
      })
      // 3.根据索引从数组中删除该项
      this.addForm.pics.splice(index, 1)
    },
    // 图片上传成功 执行的钩子
    upLoadSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 将数组转换为字符串
        // lodash深拷贝，为了操作不和级联选择器的v-model冲突
        const newForm = _.cloneDeep(this.addForm)
        newForm.goods_cat = newForm.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        newForm.attrs = this.addForm.attrs

        // 发起请求，添加商品。
        const { data: res } = await this.$http.post('goods', newForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        console.log(res)
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 5px 10px 5px 0px;
}
.quill-editor {
  margin-bottom: 15px;
}
</style>