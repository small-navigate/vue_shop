<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe row-key="id" >
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="( item1,i1 ) in scope.row.children" :key="item1.id"
                        :class="['bdbuttom','vcenter', i1 === 0 ? 'bdtop' : '']">
                            <!-- 一级权限渲染 -->
                            <el-col :span="5">
                                <el-tag>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级 三级 权限渲染 -->
                            <el-col :span="19">
                                <el-row v-for="(item2,i2) in item1.children" :key='item2.id' :class="[i2 === 0 ? '' : 'bdtop' ,'vcenter']" @close="removeRightById(scope.row, item2.id)" closable>
                                    <el-col :span="6">
                                        <el-tag type="success" @close="removeRightById(scope.row, item2.id)" closable>{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 角色编辑的对话框 -->
        <el-dialog
            title="编辑"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editDialogRef">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 角色添加的对话框 -->
         <el-dialog
         title="添加角色"
         :visible.sync="addDialogVisible"
         width="50%"
         @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" label-width="80px" :rules="editFormRules" ref="addDialogRef">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 内容底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
         </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      setRightDialogVisible: false,
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleID: '',
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 根据id删除对应权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除!')
      }
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      role.children = res.data
    },
    // 这是展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rightslist = res.data
      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式 获取角色下所有三级权限的ID 并保存到 defkeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 分配权限函数
    async allotRights () {
      // eslint-disable-next-line no-unused-vars
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.post(
       `roles/${this.roleId}/rights`,
       { rids: idStr }
      )
      console.log(res)
    },
    // 根据id删除角色
    async removeRoleById (id) {
      // eslint-disable-next-line no-unused-vars
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.error('已取消删除！')
      }
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 监听 Dialog 对话框 关闭事件
    editDialogClosed () {
      this.$refs.editDialogRef.resetFields()
    },
    // 显示 对话框
    async showEditDialog (id) {
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.getRolesList()
      this.editDialogVisible = true
    },
    editRolesInfo () {
      this.$refs.editDialogRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // eslint-disable-next-line no-unused-vars
        console.log(this.editForm.roleId)
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          console.log(res.meta)
          return this.$message.error(res.meta.msg)
        }
        this.getRolesList()
        this.editDialogVisible = false
        this.$message.success(res.meta.msg)
      })
    },
    addRoles () {
      this.$refs.addDialogRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // eslint-disable-next-line no-unused-vars
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    addDialogClosed () {
      this.$refs.addDialogRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbuttom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
