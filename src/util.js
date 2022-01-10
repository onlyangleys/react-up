import http from './http';
import store from '../store';
import { Message } from 'iview';
import log from "@/libs/log";

let util = {
    S4:function () {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },
    //产生唯一ID
    guid:function () {
        return (util.S4()+util.S4()+util.S4()+util.S4()+util.S4()+util.S4()+util.S4()+util.S4());
        // let UUID = require('uuid/v1');
        // return UUID().split("-").join("");
        // return UUID();
    },
    extendRouters:function(data) {
        let child = new Array(0);
        for (let item in data) {
            if (data.hasOwnProperty(item)) {
                if (data[item].url) {
                    child.push(
                        {
                            path: data[item].url,
                            component: (resolve) => require(['../views' + data[item].url + '.vue'], resolve)
                        }
                    );
                }
                if (data[item].child && data[item].child.length > 0) {
                    for (let childItem in data[item].child) {
                        if (data[item].child.hasOwnProperty(childItem) && data[item].child[childItem] && data[item].child[childItem].url) {
                            child.push(
                                {
                                    path: data[item].child[childItem].url,
                                    component: (resolve) => require(['../views' + data[item].child[childItem].url + '.vue'], resolve)
                                }
                            );
                        }
                    }
                }
            }
        }

        //默认路由
        const defaultRouter = [
            { "id":"default001", "name":"默认主页","href":"/workplace","url":"/workbench/workplace"},
            { "id":"default002", "name":"任务配置","href":"/taskConfig","url":"/task/taskConfig"},
            { "id":"default003", "name":"任务详情","href":"/taskDetail","url":"/workbench/taskDetail"},
            { "id":"default004", "name":"外呼工作台","href":"/workbench","url":"/workbench/workbench"},
            { "id":"default005", "name":"问卷详情","href":"/scriptQuestion","url":"/configcenter/scriptQuestion"},
            { "id":"default006", "name":"问卷处理列表","href":"/scriptAnswer","url":"/configcenter/scriptAnswer"},
            { "id":"default007", "name":"问卷处理详情","href":"/answerDetail","url":"/configcenter/answerDetail"},
            { "id":"default008", "name":"任务监控","href":"/taskMonitor","url":"/task/taskMonitor"},
            { "id":"default009", "name":"话术详情","href":"/speechDetail","url":"/configcenter/speechDetail"},
            { "id":"default010", "name":"问卷规则配置","href":"/scriptRule","url":"/configcenter/scriptRule"},
            { "id":"default011", "name":"新建群发","href":"/addcustomernotic","url":"/weixin/addcustomernotic"},
            { "id":"default012", "name":"群发记录","href":"/massRecord","url":"/weixin/massRecord"},
            { "id":"default013", "name":"新建图文","href":"/addMulti","url":"/weixin/addmulti"},
            { "id":"default014", "name":"群发详情","href":"/Recorddetail","url":"/weixin/Recorddetail"},
            { "id":"default015", "name":"知识详情","href":"/knowledgeDetail","url":"/knowledgebases/knowledgeDetail"},
            { "id":"default016", "name":"呼入工作台","href":"/callIn/workbench","url":"/callIn/workbench"},
            { "id":"default017", "name":"文本标记","href":"/textLabel","url":"/asrlabelcenter/textLabel"}
        ];

        for (let router in defaultRouter) {
            if (defaultRouter.hasOwnProperty(router)) {
                child.push(
                    {
                        path:defaultRouter[router].href,
                        component: (resolve) => require(['../views' + defaultRouter[router].url], resolve)
                    }
                );
            }
        }

        //匹配不到,回到首页
        child.push({path: '*', component: (resolve) => require(['../views/workbench/workplace'], resolve)});

        return child;
    },
    replaceAll:function(src,f,e) {
        let reg=new RegExp(f,"g"); //创建正则RegExp对象
        return src.replace(reg,e);
    },
    loadCodeMap(codeTypes){
        http.get('/generalCode/getCodeMap',{
            params:{
                codeTypes:codeTypes
            }
        }).then((response) => {
            if (response.data.success) {
                store.commit('saveCodeMap',response.data.content);
            }else{
                Message.warning(response.data.errorMessage);
            }
        });
    },
    loadDept(){
        http.get('/dept/getDeptMap',{
            params:{
                
            }
        }).then((response) => {
            if (response.data.success) {
                store.commit('saveDeptMap',response.data.content);
            }else{
                Message.warning(response.data.errorMessage);
            }
        });
    },
    loadUserButtons(userId,parentId,callback){
        http.post('/function/selectUserButtons',{
            userId: userId,
            parentId: parentId
        }).then((response) => {
            if (response.data.success) {
                callback(response.data.content);
            }else{
                Message.warning(response.data.errorMessage);
            }
        });
    },
    getMenuId($route,callback){
        if($route.query.hasOwnProperty("menu") && $route.query.menu && $route.query.menu.hasOwnProperty("menuId")) {
            callback($route.query.menu.menuId);
        }else{
            http.get('/function/showList',{params: {funUrl:$route.path}}).then((response) => {
                if (response.data.success && response.data.content.rows.length===1) {
                    callback(response.data.content.rows[0].funId);
                    return;
                }
                callback(null);
            });
        }
    },
    //判断是否具有权限
    hasPermission(permission, menuId){
        let b = false;
        if(permission){
            if(menuId){
                permission = menuId + ":" + permission + ",";
            }else{
                permission = ":" + permission + ",";
            }
            let userInfo = store.getters.userInfo;
            if(userInfo.hasOwnProperty("buttonPermissions") && userInfo.buttonPermissions){
                b = b || userInfo.buttonPermissions.indexOf(permission) > -1;
            }
            if(userInfo.hasOwnProperty("definedPermissions") && userInfo.definedPermissions){
                b = b || userInfo.definedPermissions.indexOf(permission) > -1;
            }
        }
        return b;
    },
    saveAgentLog(signId,agentNum,userId,status,logId,callback){
        //保存状态信息到数据库
        http.post('/agentLog/saveAgentLog',{
            agentCode: agentNum,
            userId: userId,
            status: status,
            historyStatus: '',
            logId: logId,
            signId: signId
        }).then((response) => {
            if(response.data.success && callback) {
                callback(response.data);
            }
        });
    },
    //异步导出数据
    exportDataAsync(modalCode,queryParam,total){
        if(!total || total <= 0){
            Message.warning('导出数据为0，请重新选择筛选添加!');
            return;
        }
        if(total && total>100000){
            Message.warning('导出数据超过10万，请重新选择筛选添加!');
            return;
        }
        let exportParams = {};
        exportParams.queryParam = '';
        exportParams.moduleCode = modalCode;
        if(queryParam){
            let tmp = {};
            for(let k in queryParam){
                if(queryParam[k] !== undefined && queryParam[k] !== ''){
                    tmp[k] = queryParam[k];
                }
            }
            exportParams.queryParam = JSON.stringify(tmp);
        }
        exportParams.moduleCode = modalCode;
        http.post('/dataExport/exportData',exportParams).then((response) => {
            if(response.data.success){
                Message.success(response.data.errorMessage);
            }else{
                Message.error(response.data.errorMessage);
            }
        });
    },
    formatToTimeStr:function (seconds){
        if(seconds){
            let h = Math.floor(seconds/3600);
            let m = Math.floor((seconds-h*3600)/60);
            let s = seconds-h*3600-m*60;
            let hs = h>9 ? ""+h : "0"+h;
            let ms = m>9 ? ""+m : "0"+m;
            let ss = s>9 ? ""+s : "0"+s;
            return hs + ":" + ms + ":" + ss;
        }else{
            return "00:00:00";
        }
    },
    isNull:function(obj){
        return null === obj || "undefined" === typeof(obj) || "" === obj;
    },
    copyObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    inArray(array,val){
        for (let i = 0; i < array.length; i++) {
            if (array[i] === val) {
                return true;
            }
        }
        return false;
    }
};

export default util;
