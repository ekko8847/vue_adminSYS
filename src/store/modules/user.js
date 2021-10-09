import {login as loginAPI} from '@/api'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import {constantRoutes, allAsyncRoutes, anyRoute} from '@/router/routes'
import router from '@/router'
import cloneDeep from 'lodash/cloneDeep'
/**
 * 递归过滤异步路由表，返回符合用户菜单权限的路由表
 * @param asyncRoutes
 * @param routeNames
 */
 function filterAsyncRoutes (allAsyncRoutes, routeNames) {
  const asyncRoutes = allAsyncRoutes.filter(route => {
    
    if (!routeNames.includes(route.name)) return false

    if (route.children && route.children.length>0) {
      // 是否修改了allAsyncRoutes内部的数据?  改了  内部子路由被过滤掉了
      // test44 allAsyncRoutes ==>filter 子数组
      // admin/其它用户 allAsyncRoutes  ==> filter   
      // 问题: allAsyncRoutes有所有路由配置吗?  没有, 现在只是test44用户过滤后的
      route.children = filterAsyncRoutes(route.children, routeNames)
    }
    return true
  })

  return asyncRoutes
}

// function filterAsyncRoutes(allAsyncRoutes, routeNames) {
//   const accessedRoutes = allAsyncRoutes.filter(route => {
    
//     if (routeNames.includes(route.name)) {

//       if (route.children && route.children.length) {
//         //如果这个路由下面还有下一级的话,就递归调用
//         const cRoutes = filterAsyncRoutes(route.children, routeNames)
//         //如果过滤一圈后,没有子元素了,这个父级菜单就也不显示了
//         if (cRoutes && cRoutes.length>0) {
//           route.children = cRoutes
//           return true
//         }
//         return false
//       }
//       return true
//     }

//     return false
//   })

//   return accessedRoutes
// }

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    
    roles: [], 
    buttons: [],
    routes: [], // 用于显示导航菜单的路由数组,包括了constantRoutes和asyncRoutes
  }
}

const state = getDefaultState()

const mutations = {
  SET_USER: (state, userInfo) => {
    state.name = userInfo.name // 用户名
    state.avatar = userInfo.avatar // 头像
    state.roles = userInfo.roles // 角色列表
    state.buttons = userInfo.buttons // 按钮权限列表
  },

  SET_TOKEN (state, token) {
    state.token = token
  },

  RESET_USER (state) {
    Object.assign(state, getDefaultState())
  },

  SET_ROUTES: (state, asyncRoutes) => {
    // 保存异步路由
    // state.asyncRoutes = asyncRoutes
    // 合并常量路由,异步路由与备选路由, 并保存
    state.routes = constantRoutes.concat(asyncRoutes)
    // 将当前用户的异步权限路由和备选路由添加到路由器
    router.addRoutes([...asyncRoutes, anyRoute])
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      loginAPI.login(username, password)
        .then(result => {
          const { data } = result
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  },

  // get user info
  async getInfo({ commit, state }) {
    const {data} = await loginAPI.getInfo()
    commit('SET_USER', data)
    // commit('SET_ROUTES', filterAsyncRoutes(data.routes))
    commit('SET_ROUTES', filterAsyncRoutes(cloneDeep(allAsyncRoutes), data.routes))
  },

  /* 
  重置用户信息
  */
  async resetUser({ commit, state }) {
    // 如果当前是登陆的, 请求退出登陆
    if (state.name) {
      await loginAPI.logout()
    }
    // 删除local中保存的token
    removeToken()
    // 重置路由
    resetRouter()
    // 提交重置用户信息的mutation
    commit('RESET_USER')
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}