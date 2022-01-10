import http from './http';
import util from './util';
import moment from 'moment';
import store from '../store';

let log = {
    //是否初始化
    init:false,
    //定时任务对象
    interval:'',
    //缓存最大容量
    size:20,
    //日志缓存空间{logTime:'',logTitle:'',logContent:''}
    cacheList:[],
    //存储日志信息到数据库
    dbLog(){
        //复制原数据信息
        let data = util.copyObject(this.cacheList);
        //清空数组信息
        this.cacheList = [];
        //保存数据信息到数据
        if(store.getters.token){
            http.post('/log/saveLog',{
                data:JSON.stringify(data)
            }).then((response) => {});
        }
    },
    //打印日志
    print(title,info){
        try {
            console.log(title,info);
            this.cacheList.push({logTime:moment().format('YYYY-MM-DD HH:mm:ss:.SSS'),logTitle:title,logContent:info});
            //缓存信息数组容量大于最大容量
            if(this.cacheList.length>this.size){
                this.dbLog();
            }
            //开启定时任务
            if(!this.init){
                this.init = true;
                this.intervalDbLog();
            }
        } catch (e) {
            console.log('print-error',e);
        }
    },
    //定时处理
    intervalDbLog(){
        window.clearInterval(this.interval);
        this.interval = window.setInterval(() => {
            this.dbLog();
        },1000*10);
    },
    //定时处理
    stopDbLog(){
        window.clearInterval(this.interval);
        this.init = false;
    }
};

export default log;
