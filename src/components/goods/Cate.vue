<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col class="elButton">
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
                <!-- 表格 -->
                <tree-table :selection-type="false" :data="catelist" :columns="columns" :expand-type="false" show-index index-text=" " border >
                    <!-- 是否有效模板 -->
                    <template slot="isok" slot-scope="scope">
                        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                        <i class="el-icon-error" v-else style="color: red"></i>
                    </template>
                    <!-- 排序模板 -->
                    <template slot="order" slot-scope="scope">
                        <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                        <el-tag type="warning" size="mini" v-else>三级</el-tag>
                    </template>
                    <!-- 操作 -->
                    <template slot="opt" slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCategoriesById(scope.row.cat_id)">删除</el-button>
                    </template>
                </tree-table>
                <!-- 分页区域 -->
                 <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
            </el-row>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类:">
                    <!-- options 用来指定数据源 -->
                    <!-- props用来指定配置对象 -->
                     <el-cascader
                        v-model="selectedKeys"
                        expand-trigger = "hover"
                        :options="parentCateList"
                        :props="{checkStrictly: true, value: 'cat_id', label: 'cat_name',children: 'children'}"
                        @change="parentCateChanged"
                        clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑对话框 -->
        <el-dialog
            title="提示"
            :visible.sync="editCateDialogVisible"
            width="50%" @close="editCateDialogClosed">
            <el-form :model="editFrom" :rules="editFromRules" ref="editFormRef" label-width="80px">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="editFrom.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateInFo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的父级分类id数组
      selectedKeys: [],
      // 展示编辑对话框
      editCateDialogVisible: false,
      // 编辑规则
      editFromRules: {
        name: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
        ]
      },
      // 编辑数据
      editFrom: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品失败')
      }
      this.catelist = res.data.result
      // 为总数居条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示添加分类对话框
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        // eslint-disable-next-line no-unused-expressions
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        this.addCateForm.cat_level = this.addCateForm.cat_pid = 0
      }
    },
    // 点击按钮添加新的分类
    addCate () {
      console.log(this.addCateForm)
      console.log(this.addCateForm.cat_level)
      this.$refs.addCateFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // eslint-disable-next-line no-unused-vars
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件 重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = this.addCateForm.cat_pid = 0
    },
    // 删除分类
    async removeCategoriesById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.error('已取消删除！')
      }
      console.log(id)
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.delete('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
    },
    // 展示编辑对话框
    async showEditDialog (id) {
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return
      }
      this.editFrom = res.data
      this.editCateDialogVisible = true
    },
    editCateInFo () {
      this.$refs.editFormRef.validate(async valid => {
        // eslint-disable-next-line no-unused-vars
        const { data: res } = await this.$http.put('categories/' + this.editFrom.cat_id, {
          cat_name: this.editFrom.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败!')
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    editCateDialogClosed () {
      this.$refs.editFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.elButton{
    margin-bottom: 15px;
}
.el-cascader{
    width: 100%;
}
</style>
