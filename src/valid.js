/* eslint-disable */
import Vue from 'vue';
import http from './http';
import util from './util';
import store from '../store';

// 这里有些正则表达式没有经过验证,慎用
let REGEX = {
    test: {
        ping: /test$/,
        msg: "测试",
    },
    mobile: {
        ping: /^0?1(3\d|4[5-8]|5[0-35-9]|6[567]|7[01345-8]|8\d|9[025-9])\d{8}$/,
        msg: "格式:手机号码",
    },
    telephone: {
        ping: /^(0\d{2,3})?[1-9]\d{6,7}$/,
        msg: "格式:固话号码",
    },
    mobileOrTelephone: {
        ping: /^((0\d{2,3})?[1-9]\d{6,7})|(0?1(3\d|4[5-8]|5[0-35-9]|6[567]|7[01345-8]|8\d|9[025-9])\d{8})$/,
        msg: "格式:手机号码或固话号码",
    },
    mobile2: {
        ping: /^[1][0-9]{10}$/,
        msg: "格式:手机号码",
    },
    mobile3: {
        ping: /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/,
        msg: "格式:手机号码",
    },
    mobileNum: {
        ping: /^\d{1,20}$/,
        msg: "格式:数字号码",
    },
    date10: {
        ping: /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/,
        msg: "格式:YYYY-MM-DD",
    },
    date19: {
        ping: /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/,
        msg: "格式:YYYY-MM-DD hh:mm:ss",
    },
    time8: {
        ping: /^((20|21|22|23|[0-1]\d):[0-5][0-9])(:[0-5][0-9])?$/,
        msg: "格式:hh:mm:ss",
    },
    letter: {
        ping: /^[a-zA-Z]+$/,
        msg: "格式:字符为英文字母",
    },
    integer: {
        ping: /^[-+]?\d*$/,
        msg: "格式:整型数字",
    },
    double: {
        ping: /^[-+]?\d+(\.\d+)?$/,
        msg: "格式:双精度数字",
    },
    code: {
        ping: /^[a-zA-Z0-9_]+$/,
        msg: "格式:字母或数字",
    },
    chinese: {
        ping: /^[\u0391-\uFFE5]+$/,
        msg: "格式:汉字",
    },
    email: {
        ping: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        msg: "格式:邮箱",
    },
    zipcode: {
        ping: /^\d{6}$/,
        msg: "格式:邮编",
    },
    ipv4: {
        ping: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/,
        msg: "格式:IPV4",
    },
    positiveInterger: {
        ping: /^\+?[1-9][0-9]*$/,
        msg: "格式:非零正整数",
    },
    negtiveInteger: {
        ping: /^-[1-9][0-9]*$/,
        msg: "格式:非零负整数",
    },
    nickName: {
        ping: /^[\u4e00-\u9fa5A-Za-z0-9-_]*$/,
        msg: "格式:只能中英文,数字,下划线,减号",
    },
    userCode: {
        ping: /^[A-Za-z0-9-_]*$/,
        msg: "格式:以字母开头,长度在4-20之间,只能包含字母,数字,下划线和减号",
    },
    userAccount: {
        ping: /^[\u4e00-\u9fa5A-Za-z0-9-_]*$/,
        msg: "格式:长度在4-20之间,只能包含字母,数字和下划线",
    },
    specialLetter: {
        ping: /^%&',;=?$"/,
        msg: "格式:含有[^%&',;=?$\x22]+",
    },
    isChinese: {
        ping: /^[\u4e00-\u9fa5],{0,}$/,
        msg: "格式:汉字",
    },
    idCard: {
        ping: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        msg: "格式:身份证号",
    },
    seatNumber: {
        ping: /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/,
        msg: "格式:座机号码",
    },
    agentCode: {
        ping: /^\d{4,9}$/,
        msg: "格式:4-9位工号",
    },
    url: {
        ping: /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/,
        msg: "url格式不正确",
    }
}
let valid = {
    custom: function (rule, value, callback) {
        let required = rule.required;
        if (required === true) {
            if (util.isNull(value)) {
                callback(new Error('该项不能为空'));
                return;
            }
        } else {
            if (util.isNull(value)) {
                callback();
                return;
            }
        }
        let flag = false;
        let msgSum = "";
        try {
            // 判断正则验证
            let regex1 = rule.regex;
            if (util.isNull(regex1) === false) {
                // let str = "^1\\d{10}$";
                let regexObj1 = new RegExp(regex1);
                if (!regexObj1.test(value)) {
                    msgSum = msgSum + "请输入正确的值" + ";";
                    flag = true;
                } else {
                    callback();
                    return;
                }
            }
            // 判断pongs验证
            if (util.isNull(rule.pongs)) {
                callback();
                return;
            }
            let arr = rule.pongs.split(",");
            for (let tmp of arr) {
                let regex2 = tmp.trim();
                if (util.isNull(regex2)) {
                    continue;
                }
                let regexObj2 = REGEX[regex2];
                if (!regexObj2.ping.test(value)) {
                    let msg = regexObj2.msg;
                    if (util.isNull(msg)) {
                        msgSum += "请输入正确的值" + ";";
                    } else {
                        msgSum += msg + ";";
                    }
                    flag = true;
                } else {
                    callback();
                    return;
                }
            }
            if (flag === true) {
                // 没有一项符合验证
                callback(new Error(msgSum));
            }
            callback();
        } catch (e) {
            callback(new Error("请输入正确的表达式"));
        }
    },
    validateJSON: function (rule, value, callback) {
        let required = rule.required;
        if (required === true) {
            if (util.isNull(value)) {
                callback(new Error('该项不能为空'));
                return;
            }
        }
        try {
            let obj=JSON.parse(value);
            if(typeof obj === 'object' && obj ){
                callback();
            }else{
                callback(new Error("JSON格式不正确"));
            }
        } catch(e) {
            callback(new Error("JSON格式不正确"));
        }
    },
    myValidator: function (rule, value, callback) {
        let required = rule.required;
        if (required === true) {
            if (util.isNull(value)) {
                callback(new Error('该项不能为空'));
                return;
            }
        }
        try{
            // 判断正则验证
            let str = "^1\\d{10}$";
            let regexObj = new RegExp(str);
            if (!regexObj.test(value)) {
                callback(new Error('请输入11位以1开头的数字'));
                return;
            }
            callback();
        }catch (e) {
            callback(new Error("请输入正确的表达式"));
        }
    },
    isSecurityPassword: function(v){
        let reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,30}$');
        return reg.test(v);
    },
    isSequencePwd:function(value){
        let arr = [];
        let regs = [];
        regs[0] = /[a-z]{4,}/;
        regs[1] = /[A-Z]{4,}/;
        regs[2] = /\d{4,}/;
        for(let i in regs){
            if(value && regs[i].exec(value) != null){
                arr = arr.concat(regs[i].exec(value));
                let rv = value.split("").reverse().join("");
                arr = arr.concat(regs[i].exec(rv));
            }
        }
        for(let t in arr){
            if(this.isSequence(4,arr[t])){
                return false;
            }
        }
        return !this.isKeywordSerial(4,value);
    },
    isSequence : function(len,v,index,result){
        if(!!!index){
            index = 0;
        }
        if(!!!result){
            result = {};
            result.repeat = 1;
            result.sequence = 1;
        }
        if(v.length > index+1){
            let bCode = v.charCodeAt(index);
            let aCode = v.charCodeAt(index+1);
            if(bCode == aCode){
                result.repeat++;
            }else{
                result.repeat = 0;
            }
            if(bCode+1 == aCode){
                result.sequence++;
            }else{
                result.sequence = 0;
            }
            return this.isSequence(len,v,index+1,result);
        }else{
            return result.repeat>=len || result.sequence >= len;
        }
    },
    isKeywordSerial:function(len,v){
        let ks = [];
        ks.push("`1234567890-=");
        ks.push("qwertyuiop[]\\");
        ks.push("asdfghjkl;'");
        ks.push("zxcvbnm,./");
        ks.push("~!@#$%^&*()_+");
        ks.push("1qaz");
        ks.push("2wsx");
        ks.push("3edc");
        ks.push("4rfv");
        ks.push("5tgb");
        ks.push("6yhn");
        ks.push("7ujm");
        ks.push("8ik,");
        ks.push("9ol.");
        ks.push("0p;/");
        ks.push("8ik<");
        ks.push("9ol>");
        ks.push("0p:?");
        if(len && v && v.length >= len){
            v = v.toLowerCase();
            let va = [v,v.split("").reverse().join("")];
            for(let t in va){
                for(let i=len;i<va[t].length;i++){
                    for(let j in ks){
                        if(ks[j].indexOf(va[t].substring(i-len,i)) > -1){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
};

export default valid;
