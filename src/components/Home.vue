<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <i>电商后台管理系统</i>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'65px':'200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+items.path"
              v-for="items in item.children"
              :key="items.id"
              @click="saveNavState('/'+items.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-s-grid"></i>
                <!-- 文本 -->
                <span>{{items.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主页面区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-users ',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取侧边栏所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status != 200) this.$message.error(res.meta.msg)
      // console.log(res)
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
  }
  img {
    height: 55px;
    width: 55px;
  }
  i {
    font-style: normal;
    font-size: 20px;
    padding-left: 18px;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
  .el-submenu {
    i {
      font-size: 18px;
    }
  }
  .iconfont {
    margin-right: 8px;
  }
  .toggle_button {
    margin-right: 0;
    background-color: #4a5064;
    font-size: 16px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    line-height: 24px;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>