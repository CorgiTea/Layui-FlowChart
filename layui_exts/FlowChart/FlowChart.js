layui.define(['laytpl', 'element', 'layer', 'code'], function (exports) {
    layui.code();
    var $ = layui.$
        , laytpl = layui.laytpl
        , layer = layui.layer
        , element = layui.element

        // 字符常量
        , MOD_NAME = "FlowChart"


        , FlowChart = {
            config:{
                chartTest : false,
                saveMsg : "保存中...",
                status : "show",
                callBack : function () {

                },
                link : function () {

                },
            },
            index: layui.FlowChart ? (layui.FlowChart.index + 10000) : 0
            //设置全局项
            , set: function (options) {
                var that = this;
                that.config = $.extend({}, that.config, options);
                return that;
            }

            //事件监听
            , on: function (events, callback) {
                return layui.onevent.call(this, MOD_NAME, events, callback);
            }
        }
        //操作当前实例
        , thisIns = function () {
            var that = this
                , options = that.config
                , id = options.id || options.index;

            return {
                reload: function (options) {
                    that.reload.call(that, options);
                }
                , config: options
            }
        }

        //构造器
        , Class = function (options) {
            var that = this;
            that.index = ++FlowChart.index;
            that.config = $.extend({}, that.config, FlowChart.config, options);
            that.render();
        };

    Class.prototype.render = function (options) {
        var _that = this,
            boxHeight = $(window).height(),
            _config = _that.config,
            rightmenu = $("<ul class='layui-FlowChart-RightMenu' hidden></ul>");
        $.extend(true, _that.config, options);

        // 参数检测
        if (typeof(_config.elem) !== 'string' && typeof(_config.elem) !== 'object') {
            console.error(MOD_NAME + ' error: elem参数未定义或设置出错，具体设置格式请参考文档API.');
            return;
        }
        var container;
        if (typeof(_config.elem) === 'string') {
            container = $('' + _config.elem + '');
        }
        if (typeof(_config.elem) === 'object') {
            container = _config.elem;
        }
        if (container.length === 0) {
            console.error(MOD_NAME + ' error:找不到elem参数配置的容器，请检查.');
            return;
        }
        // 关闭右键
        $(container).on("contextmenu", function () {
            return false;
        }).css({'height': boxHeight + 'px'}).addClass('layui-FlowChart').html('');

        $('<li event="edit"><button class="layui-btn layui-btn-primary">编辑</button></li>').appendTo(rightmenu);
        $('<li event="save"><button class="layui-btn layui-btn-primary">保存</button></li>').appendTo(rightmenu);
        $('<li event="cancel"><button class="layui-btn layui-btn-primary">取消</button></li>').appendTo(rightmenu);
        rightmenu.appendTo(container);

        BottomMenu = $('<ul class="layui-FlowChart-BottomMenu" hidden></ul>');
        for (var i = 0; i < _config.ImageURL.length; i++) {
            $('<li><img src="' + _config.ImageURL[i] + '" alt=""></li>').appendTo(BottomMenu);
        }

        var parent = $(container).parent();
        BottomMenu.appendTo(parent);
        _config.BottomMenu = BottomMenu;
        _config.boxHeight = boxHeight;
        _config.rightmenu = rightmenu;
        this.renderData();
        this.rightclick();
        this.conrainerclick();
        //绑定单击跳转
        this.goLink();
        layui.data('oldData',{
            key: 'oldData',
            value: this.config
        });
        return _that;
    };

    /**
     * 读取数据
     * @param data
     */
    Class.prototype.renderData = function () {
        var _config = this.config,
            chartBox = $(_config.elem);
        // 取调用传过来数据
        if (typeof(_config.data) === 'object' && _config.chartTest === false) {
            data = _config.data;
        }
        // 打开测试 取layui.data的数据
        if (_config.chartTest === true && Object.keys(layui.data(MOD_NAME)).length != 0) {
            data = layui.data(MOD_NAME)[MOD_NAME]['data'];
        }
        for (var i = 0; i < data.length; i++) {
            if(data[i].sta !== 'del'){
                $('<div style="top: '+data[i].top+'; left: '+data[i].left+'; "  url="'+data[i].url+'" sta="'+data[i].sta+'">' +
                    '<div><img src="'+data[i].img+'" alt="'+data[i].text+'"></div> ' +
                    '<p >'+data[i].text+'</p>' +
                    '</div>').appendTo(chartBox);
            }

        }
    };

    /**
     * 右键点击
     */
    Class.prototype.rightclick = function () {
        var _this = this,
            config = _this.config;
        /*鼠标右键*/
        $(config.elem).on('mousedown', function (e) {
            if (e.which == 3) {
                $(config.rightmenu).show().css({
                    'top': e.offsetY + 10
                    , 'left': e.offsetX + 10
                    , 'z-index': 99999
                });
                // 添加右键编辑菜单
                _this.menuLiFade(['edit']);
            }
            if (e.which == 1) {
                // 点击非菜单的地方 关闭菜单
                if ($(config.rightmenu).length == 1) {
                    var dragel = $(config.rightmenu)[0],
                        target = e.target;
                    if (!$.contains(dragel, target)) {
                        $(config.rightmenu).hide();
                    }
                }
            }
        });
        /*菜单点击*/
        $(config.rightmenu).children().on('click', function (e) {
            var lievent = $(e.target).parent('li').attr('event'),
                BottomMenuHeight = $(config.BottomMenu).height();
            //绑定拖拽
            _this.mousetouch(lievent);
            _this.config.status = lievent;
            if (lievent == 'edit') {
                $(config.elem).addClass('layui-FlowChart-border').css({
                    'height': config.boxHeight - BottomMenuHeight - 85 + 'px'
                });

                $(config.BottomMenu).show();
                $(config.rightmenu).hide();

                if ($(config.elem).children('div').length > 0) {
                    $(config.elem).children('div').attr('sta', 'update');
                } else {
                    return;
                }
                //隐藏除当前操作的其他按钮
                _this.menuLiFade([lievent]);
            }
            if (lievent == 'save') {
                //隐藏除当前操作的其他按钮
                _this.menuLiFade([lievent]);

                //后台保存
                _this.setChartInfo();
            }
            // 取消
            if (lievent == 'cancel') {
                $(config.elem).removeClass('layui-FlowChart-border').css({
                    'height': config.boxHeight + 'px'
                });
                $(config.BottomMenu).hide().find('.addbox').remove();
                _this.render();

            }
            $(config.rightmenu).hide();
        });
        /*移入变图案*/
        _this.hoverChangeSrc('.layui-FlowChart-BottomMenu li');
        _this.hoverChangeSrc('.layui-FlowChart div');

    };
    /**
     * 改变图片样式
     * @param elem
     */
    Class.prototype.hoverChangeSrc = function (elem) {
        $(elem).each(function (i, m) {
            var imgSrc = $(m).find('img').attr('src');
            $(m).find('img').hover(function () {
                var str = imgSrc.substring(imgSrc.lastIndexOf("_") + 1);
                var nstr = imgSrc.substring(0, imgSrc.lastIndexOf("_") + 1) + 'h' + str;
                $(m).find('img').attr('src', nstr);
                $(m).find('p').css({'color': '#ffb257'});
            }, function () {
                $(m).find('img').attr('src', imgSrc);
                $(m).find('p').css({'color': '#14a67e'});
            });
        });
    }
    /**
     * 保存已编辑好的位置
     */
    Class.prototype.setChartInfo = function () {
        let _this = this,
            _config = _this.config,
            obj,
            datas = [];
        $(_config.elem).children('div').each(function (i, e) {
            var left = $(e).css('left') ? $(e).css('left') : 0
                , top = $(e).css('top') ? $(e).css('top') : 0
                , transform = $(e).attr('transform') ? $(e).attr('transform') :0
                , text = ''
                , url = $(e).attr('url') ? $(e).attr('url') : ''
                , indeno = $(e).attr('no') ? $(e).attr('no') : ''
                , menucode = $(_config.elem).attr('menucode') ? $(_config.elem).attr('menucode') :''
                , sta = $(e).attr('sta')
                , img = $(e).find('img').attr('src')
                , obj = {};

            if ($(e).find('p').length > 0) {
                text = $(e).find('p').html();
            }
            obj.left = left;
            obj.top = top;
            obj.url = url;
            obj.indexno = indeno;
            obj.transform = transform;
            obj.text = text;
            obj.img = img;
            obj.menucode = menucode;
            obj.sta = sta;
            datas.push(obj);
        });
        if (typeof(_config.Savedata) === 'object') {
            obj = _config.Savedata;
        } else {
            obj = {};
            obj.action = MOD_NAME;
            obj.menucode = _config.PageIndex;

        }
        obj.data = datas;
        // 提交
        _this.ajax({
            "data": obj,
            "success": _config.callBack
        });
    };
    /**
     * 下方菜单点击
     */
    Class.prototype.conrainerclick = function () {
        let _this = this,
            _config = _this.config;
        /*界面新增图标方法*/
        $('.layui-FlowChart-BottomMenu li').each(function (i, e) {
            $(e).find('img').on('click', function () {
                //隐藏除当前操作的其他按钮
                $("<div class='addbox' ><input type='text' name='go' placeholder='快捷键'>" +
                    "<input type='text' name='text' placeholder='名称'>" +
                    '<i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #f64;" ></i>  ').appendTo($(this).parent());
                $(this).parent().siblings().find('.addbox').remove();
                /*确定*/

                $('.addbox .layui-icon-ok').on('click', function () {
                    var goval = $(this).parent().find('input[name=go]').val();
                    var testval = $(this).parent().find('input[name=text]').val();
                    var url = goval
                        , text = testval == '' ? '自定义' : testval
                        , src = $(this).parent().parent().children('img').attr('src');
                    $('<div style="top: 0;left: 0;"  url="' + url + '" no="" sta="new">' +
                        '<div>' +
                        '<img  src="' + src + '" alt="">' +
                        '</div>' +
                        ' <p>' + text + '</p>' +
                        '</div>').appendTo(_config.elem);
                    //绑定拖拽
                    _this.mousetouch(_config.status);
                    //增加删除按钮
                    _this.addclose();
                    $(this).parent().remove();
                })
            })
        })
    }
    /**
     * ajax 提交
     * @param param
     */
    Class.prototype.ajax = function (param) {
        var _this = this,
            _config = _this.config,
            url = _config.url,
            load = layer.msg(_config.saveMsg, {icon: 16, shade: [0.5, '#000'], scrollbar: false, time: 100000});

        $(_config.elem).removeClass('layui-FlowChart-border');
        //移除删除按钮
        _this.removeclose();
        $(_config.BottomMenu).hide().find('.addbox').remove();
        if(_config.chartTest === undefined || _config.chartTest === false){
            layui.data(MOD_NAME,null);
        }else{
            layer.msg("打开控制台查看参数");
            layui.data(MOD_NAME,{
                key: MOD_NAME,
                value: param.data
            });
        }

        if (typeof(url) === 'string' && url !== '') {
            $.ajax({
                type: 'POST', async: false, dataType: 'json',
                url: url,
                data: param.data,
                error: function () {
                    layer.msg('网络出错请稍候再试');
                }, success: function (res) {
                    if (typeof param.success === 'function') param.success(res);
                    layer.close(load);
                }
            });
        }

    }

    //点击图标打开指定模块
    Class.prototype.goLink = function () {
        let _config = this.config;

        $(_config.elem).children('div').each(function (i, e) {
                $(e).click(function () {
                    // 编辑状态禁止跳转
                    if(_config.status == 'edit'){
                        return false;
                    }
                    if (typeof _config.link === 'function') _config.link(e);
                })

        })
    }

    /**
     * 增加关闭按钮
     * @param e
     */
    Class.prototype.addclose = function () {
        let _this = this,
            config = _this.config;
        $(config.elem).children('div').each(function (i, e) {
            $(e).css({'cursor': 'move'});
            $('<i hidden class="layui-icon layui-icon-close" style="font-size: 30px;"></i>').appendTo($(e));
            $(e).hover(function () {
                $(e).find('.layui-icon-close').show();
            }, function () {
                $(e).find('.layui-icon-close').hide();
            })

            $(e).find('p').attr('contenteditable', "true").css({'cursor': 'text'});

        })
        $('.layui-icon-close').on('click', function () {
            var closeParent = $(this).parent('div');
            switch (closeParent.attr('sta')){
                case 'new':
                    closeParent.remove();
                    break;
                case 'del':
                    closeParent.removeClass('blur');
                    closeParent.attr('sta', 'update');
                    break;
                case 'update':
                    closeParent.addClass('blur');
                    closeParent.attr('sta', 'del');
                    break;
            }
        });

    }

    /**
     * 移除删除按钮
     */
    Class.prototype.removeclose = function () {
        let config = this.config;
        $(config.elem).children('div').each(function (i, e) {
            $(e).removeClass('blur');
            $(e).css({'cursor': 'pointer'});
            $(e).find('p').attr('contenteditable', "false").css({'cursor': 'auto'});
            $(e).find('.layui-icon-close').remove();
        })

    };

    /**
     * 右键菜单显隐
     * @param m   选择的状态
     */
    Class.prototype.menuLiFade = function (m = '') {
        let config = this.config;
        $(config.rightmenu).find('li').each(function (i, e) {
            $(e).hide();
            if (config.status == 'edit') {
                if ($.inArray($(e).attr('event'), ['save', 'cancel']) >= 0) {
                    $(e).show();
                }
            }else{
                if ($.inArray($(e).attr('event'), m) >= 0) {
                    $(e).show();
                }
            }

        })
    };


    /**
     * 鼠标拖拽
     * @param 事件 默认为编辑情况
     */
    Class.prototype.mousetouch = function (lievent) {
        var _this = this,
            config = _this.config;
        $(config.elem).children('div').each(function (i, e) {
            var $div = $(e).children('div');
            if (lievent == 'edit') {
                _this.addclose();
                $div.find('img').on('mousedown', function (e) {
                    e.preventDefault()
                })
                $div.bind("dblclick", function (event) {
                    layer.msg('旋转已开启');
                    $(this).on('mousewheel DOMMouseScroll', function (e) {
                        var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
                        var rotate = 0, str = '';
                        if (delta > 0) {// 向上滚
                            rotate = $(this).attr('transform') === undefined ? 0 : $(this).attr('transform') - 0;
                            if (rotate >= 360 || rotate <= -360) {
                                rotate = 0;
                            }
                            rotate += 1;
                            str = "rotate(" + rotate + "deg)";

                        } else if (delta < 0) {// 向上滚
                            rotate = $(this).attr('transform') === undefined ? 0 : $(this).attr('transform') - 0;
                            if (rotate >= 360 || rotate <= -360) {
                                rotate = 0;
                            }
                            rotate -= 1;
                            str = "rotate(" + rotate + "deg)";
                        }
                        $(this).find('img').css({
                            'transform': str
                        });
                        $(this).attr('transform', rotate);
                    })
                })
                $(document.body).css({"overflow-y": "hidden"});
                /* 绑定鼠标左键按住事件 */
                $div.bind("mousedown", function (event) {
                    var divparent = $(this).parent();
                    //旋转时 禁止出现滚动条

                    /* 获取需要拖动节点的坐标 */
                    var offset_x = divparent[0].offsetLeft;//x坐标
                    var offset_y = divparent[0].offsetTop;//y坐标
                    /* 获取当前鼠标的坐标 */
                    var mouse_x = event.pageX;
                    var mouse_y = event.pageY;
                    /* 绑定拖动事件 */
                    /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
                    $(document).bind("mousemove", function (ev) {
                        /* 计算鼠标移动了的位置 */
                        var _x = ev.pageX - mouse_x;
                        var _y = ev.pageY - mouse_y;
                        /* 设置移动后的元素坐标 */
                        var now_x = (offset_x + _x) + "px";
                        var now_y = (offset_y + _y) + "px";
                        /* 改变目标元素的位置 */
                        divparent.css({
                            top: now_y,
                            left: now_x
                        });

                    });
                });
                /* 单击解除事件绑定 */
                $(document).on("mouseup", function () {
                    // $(config.elem).children('div').each(function (i, e) {
                    //     $(e).children('div').off("mousewheel DOMMouseScroll");
                    // })
                    $(this).off("mousemove");
                    //恢复滚动条
                    $(document.body).css({"overflow-y": "auto"});
                });
            } else {
                $div.off("dblclick mousedown mousewheel DOMMouseScroll");
            }
        })
    }

    //核心入口
    FlowChart.render = function (options) {
        var ins = new Class(options);
        return thisIns.call(ins);
    };

    //加载组件所需样式
    layui.link(layui.cache.base + 'FlowChart/FlowChart.css', function () {
        //样式加载完毕的回调

    }, 'FlowChart');

    exports(MOD_NAME, FlowChart);
});