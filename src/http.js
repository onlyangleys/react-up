/**
 * Created by yinqf on 2017/4/26.
 * http配置
 */
import axios from 'axios'
import router from '../router'
import qs from 'querystring'
import config from '../config/config';
import iv from 'iview';
import store from '../store';

//axios 配置
axios.defaults.timeout = 1000000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.baseURL = config.apiUrl;
axios.defaults.transformRequest = function (data) {
    return qs.stringify(data)
};

// http request 拦截器
axios.interceptors.request.use(
    config => {
        if (store.getters.token) {
            config.headers.common['access_token'] = store.getters.token;
        }
        config.metadata = { startTime: new Date().getTime() }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

// http response 拦截器
axios.interceptors.response.use(
    response => {
        if(response.data&&response.data.errorType){
            if(Object.is(response.data.errorType,'token_expire')){
                //超时TOKEN，跳到登录页面
                router.replace({
                    path: '/login'
                });
            }else if(Object.is(response.data.errorType,'token_invalid')){
                //无效TOKEN，跳到登录页面
                router.replace({
                    path: '/login'
                });
            }
        }else{
            let duration = new Date().getTime() - response.config.metadata.startTime;
            store.commit('saveReqMs',duration);
        }
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 401 跳转到登录页面
                    router.replace({
                        path: '/login'
                    });
            }
        }
        if(error.message.indexOf('timeout')!==-1){
            iv.Notice.error({
                title: '请求超时，请重试！',
                desc: ''
            });
        }
        return Promise.reject(error)
    });

export default axios;
