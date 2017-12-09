'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var LOOK = {
    zIndex: 10000
};





var Look = function Look() {
    this.container = "body";
    this.type = "text";
    this.src = ""; // 只适用与iframe类型
    this.title = "温馨提示";
    this.content = ""; // 需要提醒的文字 不适用与iframe类型
    this.zIndex = 10000;
    this.height = "auto";
    this.width = "auto";
    this.minHeight = "auto";
    this.minWidth = "auto";
    this.maxHeight = "auto";
    this.maxWidth = "auto";
    this.position = {}; // 弹窗出现的方向 默认center top/bottom/left/right/leftTop/rightTop/leftBottom/rightBottom


    this.buttons = []; // 按钮的数组  {text:xxx,click:xxx,type:"green/blue/red"}
    this.titleBar = true; //是否渲染标题栏
    this.titleButtons = { // 头部按钮 close/small/large
        small: function small(that) {
            look.msg("暂未实现");
        },
        large: function large(that) {
            that.isMaxSize ? that.reSize() : that.maxSize();
        },
        close: function close(that) {
            that.close(that);
        }
    };
    this.titleBarButtons = ["close"]; // 要显示的头部按钮 close/small/large
    this.autoClose = false; // 自动关闭  可以传毫秒数
    this.onClose = null;
    this.onOpen = null;
    this.buttonBar = true; //是否渲染按钮栏
    //可以写成对象配置遮罩层样式 遵循css规则 如果为null 则不渲染遮罩层
    this.showScreen = true; // 是否显示遮罩
    this.clickScreen = null; //点击遮罩层时的回调

    this.wraphtml = {}; // wrap包裹的html结构
};

Look.prototype.confirm = function (_config) {
    !_config && (_config = {});
    var that = this;
    var confirm = {
        type: "confirm",
        content: _config || "",
        buttons: [{
            text: "确定",
            type: "green",
            close: true,
            click: function click() {
                that.yes && that.yes();
            }
        }, {
            text: "关闭",
            close: true,
            click: function click() {
                that.no && that.no();
            }
        }]
    };
    switch (_config.skin) {
        case "0":
            confirm.minWidth = "auto";
            confirm.showScreen = false;
            confirm.titleBar = false;
            break;
    }

    if (typeof _config == "string") {
        confirm.content = _config;
    } else {
        $.extend(confirm, _config);
    }

    this.init(confirm);
    return this;
};
Look.prototype.prompt = function (_config) {
    !_config && (_config = {});
    var that = this;

    var prompt = {
        type: "prompt",
        content: _config || "",
        buttons: [{
            text: "确定",
            type: "green",
            close: true,
            click: function click() {
                that.value = that.$self.find(".look-input").val();
                that.yes && that.yes();
            }
        }, {
            text: "关闭",
            close: true,
            click: _config.no
        }]
    };
    switch (_config.skin) {
        case "0":
            prompt.minWidth = "auto";
            prompt.showScreen = false;
            prompt.titleBar = false;
            break;
    }

    if (typeof _config == "string") {
        prompt.content = _config;
    } else {
        $.extend(prompt, _config);
    }

    this.init(prompt);
    return this;
};
Look.prototype.alert = function (_config) {
    !_config && (_config = {});
    var that = this;
    var alert = {
        type: "alert",
        content: _config || "",
        buttons: [{
            text: "确定",
            type: "blue",
            close: true,
            click: function click() {
                that.ok && that.ok();
            }
        }]
    };
    switch (_config.skin) {
        case "0":
            alert.minWidth = "auto";
            alert.showScreen = false;
            alert.titleBar = false;
            break;
    }

    if (typeof _config == "string") {
        alert.content = _config;
    } else {
        $.extend(alert, _config);
    }

    this.init(alert);
    return this;
};
Look.prototype.msg = function (_config) {
    var msg = {
        type: "msg",
        skin: "0",
        titleBar: false,
        buttonBar: false,
        showScreen: false,
        minWidth: "auto",
        width: "auto",
        content: _config || "",
        autoClose: 1000
    };

    if (typeof _config == "string") {
        msg.content = _config;
    } else {
        $.extend(msg, _config);
    }

    this.init(msg);
    return this;
};
Look.prototype.wrap = function (_config) {
    $.extend(_config.titleButtons || {});
    var wrap = {
        type: "wrap",
        titleBar: true,
        skin: "0",
        width: "auto",
        maxWidth: "auto"
    };
    $.extend(wrap, _config);
    this.init(wrap);
    return this;
};
Look.prototype.iframe = function (_config) {
    !_config && (_config = {});
    this.titleBarButtons = ["close","small","large"];
    var iframe = {
        type: "iframe",
        titleButtons: titleButtons
    };

    $.extend(iframe, _config);

    this.init(iframe);
    return this;
};

Look.prototype.init = function (config) {
    $.extend(this, config);
    this.render();
    return this;
};

// 开始渲染弹窗结构到容器(默认body)中
Look.prototype.render = function () {
    this.lookId = this.randomNum(5);
    if (this.type != "wrap") {
        var html = this.create.getHtml(this);
        var container = $(this.container);
        container.append(html);
    } else {
        this.create.createWrap(this);
    }
    this.$self = $(".look-container[data-id=" + this.lookId + "]");
    var that = this;

    that.renderComplete && that.renderComplete();

};

// 渲染完成
Look.prototype.renderComplete = function () {

    // 先开始逐个去绑定事件
    this.bindEvent();

    // 再配置大小
    this.autoSize();

    // 然后开始定位
    this.setPosition();

    // 再显示弹窗
    this.open();

    return this;
};

// 渲染完成去自动配置大小
Look.prototype.autoSize = function () {
    var that = this;
    that.IE(function () {
        var de_box_h = that.$self.find(".look-box").height() || 0;
        var de_box_w = that.$self.find(".look-box").outerWidth() || 0;
        var offset = that.$self.find(".look-box").offset();
        !that.height || that.height == "auto" && (that.height = de_box_h);
        !that.width || that.width == "auto" && (that.width = de_box_w);
        that.$self.find(".look-box").css({
            height: that.height,
            width: that.width,
            minHeight: that.minHeight,
            minWidth: that.minWidth,
            maxHeight: that.maxHeight,
            maxWidth: that.maxWidth
        });
        that.IE(function () {
            that.IE(function () {
                var head_h = that.$self.find(".look-head").outerHeight() || 0;
                var floor_h = that.$self.find(".look-floor").outerHeight() || 0;
                var box_h = parseInt(that.height);
                if ((that.height + "").indexOf("%") != -1 || that.height == "auto") {
                    box_h = that.$self.find(".look-box").height();
                }
                var body_h = box_h - (head_h + floor_h);
                if (that.type == "iframe" || that.type == "wrap") {
                    that.$self.find(".look-box .look-body").css("height", body_h);
                }
                if (!$.isEmptyObject(that.showScreen) && typeof that.showScreen != "boolean") {
                    that.$self.find(".look-screen").css(that.showScreen);
                }
            });
        });
    });



    return that;

};

// 给所有能点的 都加上事件
Look.prototype.bindEvent = function () {
    var $self = this.$self;
    var buttons = this.buttons;
    var that = this;

    // 给所有按钮加上事件
    if (this.buttonBar) {
        $self.find(".look-floor .look-floor-btns .floor-btn").each(function (index) {
            var btn = buttons[index];
            var callback = btn.click;
            $(this).click(function () {
                if (btn.close) {
                    that.close();
                }
                callback && callback(that, btn);
            });
        });
    };

    // 给标题按钮加事件
    $self.find(".look-head .title-btn").each(function () {
        $(this).click(function () {
            var type = $(this).data("type");
            that.titleButtons[type] && that.titleButtons[type](that);
        });
    });

    $self.find(".mini-close").click(function () {
        var type = $(this).data("type");
        that.titleButtons.close && that.titleButtons.close(that);
    });

    // 给遮罩加点击事件
    $self.find(".look-screen").each(function () {
        $(this).click(function () {
            that.clickScreen && that.clickScreen(that);
        });
    });

    this.mousePull($self.find(".look-head"), $self.find(".look-box"));
    return this;
};

// 最大化
Look.prototype.maxSize = function () {
    var $self = this.$self;
    var that = this;
    var maxHeight = $(window).height() - ($self.find(".look-head").height() + $self.find(".look-floor").height());
    $self.find(".look-box").css({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        height: "auto",
        width: "auto"
    }).find(".look-body").css({
        height: maxHeight
    });
    $self.attr("maxSize", true);
    this.isMaxSize = true;
    $self.find(".look-head .look-title-btns .icon-large").html("&#xe605;");
    return this;
};
// 恢复大小
Look.prototype.reSize = function () {
    var $self = this.$self;
    var that = this;

    $self.find(".look-box").css({
        left: this.position.left || "auto",
        top: this.position.top || "auto",
        right: this.position.right || "auto",
        bottom: this.position.bottom || "auto"
    });

    // 自动配置大小
    this.autoSize();
    // 将全屏状态改为true
    this.isMaxSize = false;

    $self.attr("maxSize", false);
    $self.find(".look-head .look-title-btns .icon-large").html("&#xe616;");
    return this;
};

Look.prototype.open = function () {
    var $self = this.$self;
    var that = this;
    // 将最新的显示层叠到最高
    this.maxShow();
    setTimeout(function () {
        $self.removeClass("hide");
        $self.find(".look-body .look-input").focus();
        that.dom && that.dom.show();
        that.onOpen && that.onOpen();
        that.autoClose && that.close(that.autoClose);
    }, 20);
    return this;
};

Look.prototype.close = function (_timeOrId) {
    if (this.type == "wrap") {
        this.closeWrap(_timeOrId);
        return this;
    };
    var $self = typeof _timeOrId == "string" ? _timeOrId : this.$self;
    if ($self == "all") {
        $self = $(".look-container");
    };
    var that = this;
    setTimeout(function () {
        $self.addClass("hide");
        setTimeout(function () {
            $self.remove();
        }, 300);
        that.onClose && that.onClose();
    }, typeof _timeOrId == "number" ? _timeOrId : 0);
    return this;
};

// 关闭wrap类型的
Look.prototype.closeWrap = function (_timeOrId) {
    var $self = typeof _timeOrId == "string" ? _timeOrId : this.$self;
    if ($self == "all") {
        $self = $(".look-container");
    };
    var that = this;
    setTimeout(function () {
        $self.addClass("hide");
        setTimeout(function () {
            that.dom && that.dom.hide();
            that.dom.unwrap();
            that.dom.prev().remove(".look-head");
            that.dom.next().remove(".look-floor");
            that.dom.unwrap();
            that.dom.prev().remove(".look-screen");
            that.dom.unwrap();
            that.dom.prev().remove(".mini-close");
        }, 300);
        that.onClose && that.onClose();
    }, typeof _timeOrId == "number" ? _timeOrId : 0);
    return this;
};

Look.prototype.create = {
    getHtml: function (that) {
        var screen = this.createScreen(that);
        var box = this.createBox(that);
        var container = "<div class=\"look-container hide\" data-id=\"" + that.lookId + "\" data-type=\"" + that.type + "\">\n                " + screen + "\n                " + box + "\n            </div>";
        return container;
    },
    createScreen: function (that) {
        if (!that.showScreen) {
            return "";
        }
        var screen = "<div class=\"look-screen\"></div>";
        return screen;
    },
    createIframe: function (that) {
        var iframe = "<iframe src=\"" + that.src + "\"  frameborder=\"0\" width=\"100%\" height=\"100%\" scrolling=\"auto\" ></iframe>";
        return iframe;
    },
    createBox: function (that) {

        var type = that.type || "text";
        var skin = that.skin || "skin";
        var head = this.createHead(that);
        var body = this.createBody(that);
        var floor = this.createFloor(that);
        var box = "<div class=\"look-box " + type + " skin-" + skin + "\"  >\n" + head + "\n" + body + "\n" + floor + "\n</div>";
        return box;
    },
    createHead: function (that) {
        if (!that.titleBar) {
            return "";
        };

        var titleButtonsHtml = "";
        var head = "";
        if (that.skin == "0") {
            titleButtonsHtml = this.createMiniCloseBtn(that);
            head = titleButtonsHtml;

        } else {
            titleButtonsHtml = this.createTitleBtns(that);
            head = "<div class=\"look-head\">\n<div class=\"look-title\">" + that.title + "</div>\n<div class=\"look-title-btns\">\n" + titleButtonsHtml + "\n</div>\n</div>";

        };
        return head;
    },
    createBody: function (that) {
        var type = that.type || "text";
        var cont = "";
        switch (type) {
            case "iframe":
                cont = this.createIframe(that);
                break;
            case "prompt":
                cont = this.createInput(that);
                break;
            case "html":
                cont = this.createParents(that);
                break;

            default:
                cont = that.content;
        }

        var body = "<div class=\"look-body\">" + cont + "</div>";
        return body;
    },
    createFloor: function (that) {
        if (!that.buttonBar || that.buttons.length == 0) {
            return "";
        }
        var btnhtml = this.createBtns(that);
        var floor = "<div class=\"look-floor\">\n<div class=\"look-floor-btns\">\n" + btnhtml + "\n</div>\n</div>";
        return floor;
    },
    createBtns: function (that) {

        var buttons = that.buttons;
        var btnhtml = "";

        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var type = btn.type || "";
            btnhtml += '<div class="floor-btn ' + type + ' ">' + btn.text + '</div>';
        };
        return btnhtml;
    },
    createTitleBtns: function (that) {
        var titleButtonsHtml = "";
        var titleButtons = that.titleButtons;
        var iconfont = "&#xe685;";//关闭图标
        for (var key in titleButtons) {
            var isBtn = $.inArray(key,that.titleBarButtons) != -1;
            if(!isBtn){
                continue;
            }
            var val = titleButtons[key];
            switch (key) {
                case "close":
                    iconfont = "&#xe685;";
                    break;
                case "large":
                    iconfont = "&#xe616;";
                    break;
                case "large-copy":
                    iconfont = "&#xe605;";
                    break;
                case "small":
                    iconfont = "&#xe71f;";
                    break;
            };
            titleButtonsHtml += '<div class="title-btn" data-type="' + key + '" ><i class="look-iconfont icon-' + key + '">' + iconfont + '</i> </div>';
        };
        return titleButtonsHtml;
    },
    createMiniCloseBtn: function (that) {
        return "<div class=\"mini-close\"><i class=\"look-iconfont icon-close\">&#xe685;</i></div>";
    },
    createInput: function (that) {
        !that.value && (that.value = "");
        var html = "\n        <p>" + that.content + "</p>\n        <input class=\"look-input\" value=\"" + that.value + "\" />\n        ";
        return html;
    },
    createWrap: function (that) {
        if (!that.dom) {
            return that;
        };
        that.dom = typeof that.dom == "string" ? $(that.dom) : that.dom;
        var dom = that.dom;

        var titleButtons = that.titleButtons;
        var iconfont = "&#xe685;";//关闭图标
        var btnhtml = this.createBtns(that);
        var container = that.wraphtml.container = $("<div class=\"look-container hide\" data-id=\"" + that.lookId + "\" data-type=\"" + that.type + "\"></div>");
        var screen = that.wraphtml.screen = $(this.createScreen(that));
        var box = that.wraphtml.box = $("<div class=\"look-box wrap \" ></div>");
        var head = that.wraphtml.head = $(this.createHead(that));
        var body = that.wraphtml.body = $(this.createBody(that));
        var floor = that.wraphtml.floor = $(this.createFloor(that));
        var screen = $("<div class=\"look-screen\"></div>");
        dom.wrap(container).wrap(box).before(head).after(floor).wrap(body);
        dom.parents(".look-container[data-id=" + that.lookId + "]").prepend(screen);

    }
};

// 配置定位
Look.prototype.setPosition = function (_position) {

    var position = _position || this.position;
    // 只有将direction设置为false position里面的定位才会生效
    var direction = this.direction || "center";

    var that = this;

    setTimeout(function () {


        var e = that.$self.find(".look-box");

        var w = $(window).width(),
            h = $(window).height();
        var thisW = e.width();
        var thisH = e.height();
        var _eTop = e[0].offsetTop;
        var _eLeft = e[0].offsetLeft;

        var centerX = w / 2 - thisW / 2; // 水平居中
        var centerY = h / 2 - thisH / 2; // 垂直居中
        var right = w - thisW;
        var bottom = h - thisH;

        if (direction) {
            switch (direction) {
                case "top":
                    e.css({
                        'left': centerX,
                        'top': 0
                    });
                    that.position.left = centerX;
                    that.position.top = 0;
                    break;
                case "bottom":
                    e.css({
                        'left': centerX,
                        'top': bottom
                    });
                    that.position.left = centerX;
                    that.position.top = bottom;
                    break;
                case "left":
                    e.css({
                        'top': centerY,
                        'left': 0
                    });
                    that.position.left = 0;
                    that.position.top = centerY;
                    break;
                case "right":
                    e.css({
                        'top': centerY,
                        'left': right
                    });
                    that.position.left = right;
                    that.position.top = centerY;
                    break;
                case "leftTop":
                    e.css({
                        'top': 0,
                        'left': 0
                    });
                    that.position.left = 0;
                    that.position.top = 0;
                    break;
                case "rightTop":
                    e.css({
                        'top': 0,
                        'left': right
                    });
                    that.position.left = right;
                    that.position.top = 0;
                    break;
                case "leftBottom":
                    e.css({
                        'top': bottom,
                        'left': 0
                    });
                    that.position.left = 0;
                    that.position.top = bottom;
                    break;
                case "rightBottom":
                    e.css({
                        'top': bottom,
                        'left': right
                    });
                    that.position.left = right;
                    that.position.top = bottom;
                    break;
                default:
                    e.css({
                        'left': centerX,
                        'top': centerY
                    });
                    that.position.left = centerX;
                    that.position.top = centerY;
                    break;
            }
        } else {
            e.css(position);
        }

    }, 0);


    return this;
};

// 将最新的显示层叠到最高
Look.prototype.maxShow = function () {
    this.zIndex = LOOK.zIndex;
    LOOK.zIndex++;
    this.$self.find(".look-box").css("z-index", this.zIndex);
};

//拖拽
Look.prototype.mousePull = function (click, move) {
    //要点击的id，要拖动的id

    var isDown = false;
    var that = this;

    var box_X = 0;
    var box_Y = 0;

    click.click(function (e) {
        e.stopPropagation();
    });

    //按下后记录相对位置
    click.mousedown(function (e) {
        // 将最新的显示层叠到最高
        that.maxShow();

        var isMaxSize = that.$self.attr("maxSize");
        if (isMaxSize == "true") {
            isDown = false;
            return that;
        }

        box_X = e.pageX - move.offset().left + $(window).scrollLeft();
        box_Y = e.pageY - move.offset().top + $(window).scrollTop();
        move.css({
            right: that.position.right || "auto",
            bottom: that.position.bottom || "auto",
            left: move.offset().left,
            top: move.offset().top
        });
        //asd
        isDown = true;
    });

    $(document).mousemove(function (e) {
        var rt = $(document).width() - (e.pageX + move.width() - box_X);
        var lf = e.pageX - box_X;
        var top = $(document).height() - (e.pageY + move.height() - box_Y);
        var bot = e.pageY - box_Y;
        if (isDown == true) {
            if (rt < 0) {
                that.position.left = $(document).width() - move.width();
                move.css('left', that.position.left + 'px');
            } else if (lf < 0) {
                move.css('left', 0);
                that.position.left = 0;
            } else {
                that.position.left = e.pageX - box_X;
                move.css('left', that.position.left + 'px');
            }
            if (top < 0) {
                that.position.top = $(document).height() - move.height();
                move.css('top', that.position.top + 'px');
            } else if (bot < 0) {
                move.css('top', 0);
                that.position.top = 0;
            } else {
                that.position.top = e.pageY - box_Y;
                move.css('top', that.position.top + 'px');
            }
        };
    });
    $(document).mouseup(function (e) {
        isDown = false;
    });
};

Look.prototype.randomNum = function (len) {
    var m = "";
    for (var i = 0; i < len; i++) {
        m += Math.floor(Math.random() * 10);
    }
    return m;
};

Look.prototype.IE = function (_callback) {
    var ie = navigator.appName == "Microsoft Internet Explorer";  //是否IE
    if (ie) {
        setTimeout(function () {
            _callback && _callback();
        }, 0);
    } else {
        _callback && _callback();
    }
};

window.look = new Look();

window.look.msg = function (_obj) {
    var msg = new Look();
    msg.msg(_obj);
    return msg;
};
window.look.alert = function (_obj) {
    var alert = new Look();
    alert.alert(_obj);
    return alert;
};
window.look.confirm = function (_obj) {
    var confirm = new Look();
    confirm.confirm(_obj);
    return confirm;
};
window.look.prompt = function (_obj) {
    var prompt = new Look();
    prompt.prompt(_obj);
    return prompt;
};
window.look.iframe = function (_obj) {
    var iframe = new Look();
    iframe.iframe(_obj);
    return iframe;
};
window.look.wrap = function (_obj) {
    var wrap = new Look();
    console.log(wrap.wrap)
    wrap.wrap(_obj);
    return wrap;
};