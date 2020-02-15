<template>
  <div>
    Home组件
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang="less" scoped>
</style>