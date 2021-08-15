import { login, logout, getInfo } from "@/api/acl/user";
import { getToken, setToken, removeToken } from "@/utils/auth";
import {
  resetRouter,
  allAsyncRoutes,
  constantRoutes,
  anyRoute,
  default as router
} from "@/router";
import cloneDeep from "lodash/cloneDeep";

function filterUserAsyncRoutes(allAsyncRoutes, routeNames) {
  // 这个函数就是根据返回的name数组从所有的异步路由当中过滤出用户自身的异步路由
  const asyncRoutes = allAsyncRoutes.filter(item => {
    if (routeNames.indexOf(item.name) !== -1) {
      if (item.children && item.children.length) {
        // 一级路由过滤，还要考虑过滤二级路由
        // 如果有子路由，那么就过滤出需要的子路由数组，把原本的子路由给覆盖掉
        item.children = filterUserAsyncRoutes(item.children, routeNames);
        // 如果我们拿过来所有的异步路由，经过这次过滤完成，那么所有的异步路由当中
        // 二级的路由就彻底被改变为过滤出来的某个，原来的所有的二级路由就找不到了
      }
      return true;
    }
  });
  return asyncRoutes;
}

// 他们这里用的全是.then.catch的写法,存储token是放在cookie里
// 我们当年用的是async和await的写法，存储token是放在localStorage里

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    avatar: "",
    buttons: [], //按钮级别权限的信息
    roles: [], //角色信息
    routes: [] ////这个routes到时候保存的并不是返回的name组成的数组，而是真正的用户相关的所有路由组成的数组
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    // Object.assign是把后面对象的所有属性拷贝到前面这个对象里面
    // 使用新的对象，把新的对象里面属性，拷贝到前面老的state对象里面
    // 由于属性是一样的，那么后面属性会把老的state属性覆盖掉，达到重置的目的
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  // SET_NAME: (state, name) => {
  //   state.name = name;
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar;
  // }
  SET_USERINFO(state, userInfo) {
    state.name = userInfo.name;
    state.avatar = userInfo.avatar;
    state.buttons = userInfo.buttons;
    state.roles = userInfo.roles;
  },
  SET_ROUTES(state, routes) {
    state.routes = routes; //这里拿过来的是用户已经确定的路由数组，不是name数组
  }
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response;
          commit("SET_TOKEN", data.token);
          setToken(data.token);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // // get user info
  // getInfo({ commit, state }) {
  //   return new Promise((resolve, reject) => {
  //     getInfo(state.token)
  //       .then(response => {
  //         const { data } = response;

  //         if (!data) {
  //           return reject("Verification failed, please Login again.");
  //         }

  //         // const { name, avatar } = data;

  //         // commit("SET_NAME", name);
  //         // commit("SET_AVATAR", avatar);
  //         commit("SET_USERINFO", data);
  //         // 根据返回的name数组从所有的异步路由数组当中，过滤出用户需要显示的异步路由数组
  //         let asyncRoutes = filterUserAsyncRoutes(
  //           cloneDeep(allAsyncRoutes),
  //           data.routes
  //         );
  //         //拿到用户对应的所有路由数组
  //         let routes = constantRoutes.concat(asyncRoutes, anyRoute);
  //         commit("SET_ROUTES", routes); //所有路由 = 常量路由 + 用户自身的异步路由 + 任意路由

  //         /* 你只是把所有的路由保存起来，目的是后面用于动态去遍历生成菜单
  //         但是你别忘了 你的路由器里面现在注册的并不是这些路由，而是只有常量路由
  //         我们得动态的把路由器里面注册的路由给换成我们自己的路由
  //         动态添加路由，目前我们已经有了静态路由在路由器当中，接下来只需要把自身的异步路由和
  //         任意路由动态添加进去即可
  //         这里是给路由器动态的去添加路由，而不是把东西添加到常量路由数组当中 */
  //         router.addRoutes([...asyncRoutes, anyRoute]);
  //         resolve(data);
  //       })
  //       .catch(error => {
  //         reject(error);
  //       });
  //   });
  // },
  //async await写法
  async getInfo({ commit, state }) {
    try {
      const result = await getInfo(state.token);
      if (result.code === 200 || result.code === 20000) {
        const { data } = result;
        commit("SET_USERINFO", data);

        // 根据返回的name数组从所有的异步路由数组当中，过滤出用户需要显示的异步路由数组
        let asyncRoutes = filterUserAsyncRoutes(
          cloneDeep(allAsyncRoutes),
          data.routes
        );
        //拿到用户对应的所有路由数组
        let routes = constantRoutes.concat(asyncRoutes, anyRoute);
        commit("SET_ROUTES", routes); //所有路由 = 常量路由 + 用户自身的异步路由 + 任意路由

        /* 你只是把所有的路由保存起来，目的是后面用于动态去遍历生成菜单
        但是你别忘了 你的路由器里面现在注册的并不是这些路由，而是只有常量路由
        我们得动态的把路由器里面注册的路由给换成我们自己的路由
        动态添加路由，目前我们已经有了静态路由在路由器当中，接下来只需要把自身的异步路由和
        任意路由动态添加进去即可
        这里是给路由器动态的去添加路由，而不是把东西添加到常量路由数组当中 */
        router.addRoutes([...asyncRoutes, anyRoute]);
      } else {
        console.log("Verification failed, please Login again.", error.message);
      }
    } catch (error) {
      return Promise.reject(new Error("ff"));
    }
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  }
};

export default {
  namespaced: true, //开启命名空间，作用可以让多个模块action当中有同名的方法
  state,
  mutations,
  actions
};
