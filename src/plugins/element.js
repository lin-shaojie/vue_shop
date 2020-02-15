import Vue from 'vue'
import {
    Button,
    Form,
    FormItem,
    Input,
    Message
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message; //挂载到全局，这样每个组件中this.$message都可以使用了