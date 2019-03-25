# Layui-FlowChart

 ~~~
 基于Layui开发，公司之前用到这个功能，自己用的散装代码...
 这次重新梳理了一下。
 emm...慢慢修复优化。
 :)
 ~~~
> 版本 V1.0
 + 第一个版本 :)
> 功能描述
 + 右键点击选择编辑
 + 选择下方按钮填写后确定
 + 在虚线操作区域拖拽移动位置
 + 双击某图标开启滚轮旋转
 + 右键保存
 
 > 调用
 
    layui.config({
         base: 'layui_exts/'
     }).extend({
         FlowChart: 'FlowChart/FlowChart'
     }).use(['element','FlowChart'], function () {
     
         var FlowChart = layui.FlowChart;
         var arr = [
             {
                 "left": "596px",
                 "top": "58px",
                 "url": "so",
                 "indexno": "",
                 "text": "销售单",
                 "img": "layui_exts/FlowChart/image/nav_icon_1.png",
                 "sta": "new"
             },
             {
                 "left": "777px",
                 "top": "57px",
                 "url": "OD",
                 "indexno": "",
                 "text": "送货",
                 "img": "layui_exts/FlowChart/image/nav_icon_2.png",
                 "sta": "new"
             },
             {
                 "left": "686px",
                 "top": "83px",
                 "url": "",
                 "indexno": "",
                 "text": "自定义",
                 "img": "layui_exts/FlowChart/image/line_1.png",
                 "sta": "new"
             }
         ];
         var urlstr = "layui_exts/FlowChart/image/";
         FlowChart.render({
             elem:'#box'
             /*AJAX请求地址*/
             ,url :'/main/getajax'
             ,ImageURL:[
                 urlstr + "nav_icon_1.png",
                 urlstr + "nav_icon_2.png",
                 urlstr + "nav_icon_3.png",
                 urlstr + "nav_icon_4.png",
                 urlstr + "nav_icon_5.png",
                 urlstr + "nav_icon_6.png",
                 urlstr + "nav_icon_7.png",
                 urlstr + "nav_icon_8.png",
                 urlstr + "line_1.png",
                 urlstr + "line_6.png",
                 urlstr + "line_12.png",
                 urlstr + "line_13.png",
             ]
             // 赋值渲染
             ,data:arr
             // 保存到缓存测试
             ,chartTest:false
             // 保存提示信息
             ,saveMsg:"保存中.."
             // 保存后回调
             ,callBack:function (data) {
                 console.log(data)
             }
             // 点击当前图标的回调 ，编辑状态下无法跳转
             ,link:function (elem) {
                 console.log(elem)
             }
              // 页面唯一识别 默认数据中的，我原来的业务使用到，可以删除，并Savedata自定义
             ,PageIndex:"so"
             /* 
              *自定义提交数据结构 已有data,尽量使用其他
              * 默认数据
              * obj.action = MOD_NAME;
              * obj.menucode = _config.PageIndex;
              * obj.data = [];
              */
             ,Savedata:{
                 "a":123,
                 "b":456,
             }
         });
     })



