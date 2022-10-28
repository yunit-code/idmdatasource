//这里只需要写加载哪些js即可，直接闭包方式
;(function(window){
    //获取IDM的加载队列最后一条信息
    var lastMdule;
    if(window.IDM&&window.IDM.module&&window.IDM.module.queue&&window.IDM.module.queue.moduleMain.length>0){
        lastMdule = window.IDM.module.queue.moduleMain[window.IDM.module.queue.moduleMain.length-1];
    }

    //代码包的内部代码路径，注意js的加载顺序，否则会找不到对象报错之类的问题
    var resource={
        js:{
            // vendors1:"js/chunk-2d0a49a1",
            // vendors2:"js/chunk-2d0a4a08",
            // vendors3:"js/chunk-2d0aa783",
            // vendors4:"js/chunk-2d0aad69",
            // vendors5:"js/chunk-2d0abf84",
            // vendors6:"js/chunk-2d0af049",
            // vendors7:"js/chunk-2d0af087",
            // vendors8:"js/chunk-2d0af63f",
            // vendors9:"js/chunk-2d0b1df7",
            // vendors10:"js/chunk-2d0b2154",
            // vendors11:"js/chunk-2d0b2cae",
            // vendors12:"js/chunk-2d0b6d0b",
            vendors13:"js/chunk-2d0b9fd7",
            // vendors14:"js/chunk-2d0ba0cb",
            // vendors15:"js/chunk-2d0ba0eb",
            // vendors16:"js/chunk-2d0ba6eb",
            // vendors17:"js/chunk-2d0bce90",
            // vendors18:"js/chunk-2d0bd5ea",
            // vendors19:"js/chunk-2d0bd92a",
            // vendors20:"js/chunk-2d0be0fa",
            // vendors21:"js/chunk-2d0c063a",
            // vendors22:"js/chunk-2d0c0c21",
            // vendors23:"js/chunk-2d0c49c5",
            // vendors24:"js/chunk-2d0c8302",
            // vendors25:"js/chunk-2d0cc294",
            // vendors26:"js/chunk-2d0cca40",
            // vendors27:"js/chunk-2d0cca48",
            // vendors28:"js/chunk-2d0ccba9",
            // vendors29:"js/chunk-2d0ccbf3",
            // vendors30:"js/chunk-2d0ceb27",
            // vendors31:"js/chunk-2d0d0061",
            // vendors32:"js/chunk-2d0d34f0",
            // vendors33:"js/chunk-2d0d3dbb",
            // vendors34:"js/chunk-2d0d6390",
            // vendors35:"js/chunk-2d0d67f0",
            // vendors36:"js/chunk-2d0d74c5",
            // vendors37:"js/chunk-2d0d7a90",
            // vendors38:"js/chunk-2d0daf30",
            // vendors39:"js/chunk-2d0db41a",
            // vendors40:"js/chunk-2d0db494",
            // vendors41:"js/chunk-2d0db807",
            // vendors42:"js/chunk-2d0de2b7",
            // vendors43:"js/chunk-2d0deab3",
            // vendors44:"js/chunk-2d0df495",
            // vendors45:"js/chunk-2d0e140e",
            // vendors46:"js/chunk-2d0e4538",
            // vendors47:"js/chunk-2d0e5767",
            // vendors48:"js/chunk-2d0e5971",
            // vendors49:"js/chunk-2d0e6141",
            // vendors50:"js/chunk-2d0e8caa",
            // vendors51:"js/chunk-2d0e97dc",
            // vendors52:"js/chunk-2d0e9992",
            // vendors53:"js/chunk-2d0f062f",
            // vendors54:"js/chunk-2d207995",
            // vendors55:"js/chunk-2d20f345",
            // vendors56:"js/chunk-2d20f3c8",
            // vendors57:"js/chunk-2d2103ff",
            // vendors58:"js/chunk-2d21042e",
            // vendors59:"js/chunk-2d212edf",
            // vendors60:"js/chunk-2d212efb",
            // vendors61:"js/chunk-2d2138dc",
            // vendors62:"js/chunk-2d216ba2",
            // vendors63:"js/chunk-2d218469",
            // vendors64:"js/chunk-2d21a075",
            // vendors65:"js/chunk-2d21a095",
            // vendors66:"js/chunk-2d21a3d5",
            // vendors67:"js/chunk-2d21a6fa",
            // vendors68:"js/chunk-2d21aebb",
            // vendors69:"js/chunk-2d21f830",
            // vendors70:"js/chunk-2d22235a",
            // vendors71:"js/chunk-2d224b32",
            vendors72:"js/chunk-2d2250cf",
            vendors73:"js/chunk-2d225f49",
            // vendors74:"js/chunk-2d22dbb6",
            // vendors75:"js/chunk-2d2306a2",
            // vendors76:"js/chunk-2d2311bb",
            // vendors77:"js/chunk-2d231235",
            // vendors78:"js/chunk-2d238a72",
            // vendors79:"js/chunk-55300104",
            // vendors80:"js/chunk-743dd601",
            vendors80:"js/chunk-2d22db0b",
            vendors:"js/chunk-vendors",
            index:"js/index",
        },
        css:["css/index","css/chunk-vendors"]
    },
    doc = document, config = {},
    //获取当前所在目录
    getPath = function(){
        var head = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement;
        var js = head.getElementsByTagName("script"), jsPath = js[js.length - 1].src;
        console.log(jsPath);
        if(lastMdule){
            jsPath = IDM.url.getWebPath("@"+lastMdule.codeSrc,"",lastMdule.projectNo);
        }
        
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }(),
    //异常提示
    error = function(msg){
        window.console && console.error && console.error('IDM hint: ' + msg);
    },
    isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

    config.resources = {}; //记录资源物理路径
    config.status = {}; //记录资源加载状态
    config.timeout = 10; //符合规范的资源请求最长等待秒数
    function loadjs(apps,rcallback){
        var that = this;
        if(rcallback){
            this.callback = rcallback;
        }
        apps = typeof apps === 'string' ? [apps] : apps;
        var dir = getPath;
        var head = doc.getElementsByTagName('head')[0];
        var item = apps[0], timeout = 0;
        if(apps.length === 0){
            return rcallback&&rcallback(this);
        }
        //加载模块
        var node = doc.createElement('script'), url =  dir + (resource.js[item] || item) + '.js';
        node.async = true;
        node.charset = 'utf-8';
        node.src = url;
        node.setAttribute('objectID', "IDM-Module-"+url);
        function onScriptLoad(e, url){
          var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
          if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
            config.status[item] = true;
            config.resources[item] = url;
            head.removeChild(node);
            (function poll() {
              if(++timeout > config.timeout * 1000 / 4){
                onCallback(apps);
                return error(item +":"+url + ' is not a valid js');
              };
              config.status[item] ? onCallback(apps) : setTimeout(poll, 4);
            }());
          }
        }
        //首次加载
        if(!config.resources[item]){
            head.appendChild(node);
            if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
                node.attachEvent('onreadystatechange', function(e){
                    onScriptLoad(e, url,item,apps,that);
                });
            } else {
                node.addEventListener('load', function(e){
                    onScriptLoad(e, url,item,apps,that);
                }, false);
            }
        } else {
            (function poll() {
            if(++timeout > config.timeout * 1000 / 4){
                onCallback(apps) 
                return error(item+":"+url + ' is not a valid js');
            };
            (typeof config.resources[item] === 'string' && config.status[item]) 
            ? onCallback(apps) 
            : setTimeout(poll, 4);
            }());
        }
        function onCallback(apps){
            apps.length > 1 ?
            loadjs(apps.slice(1), this.callback)
            : ( typeof this.callback === 'function' && this.callback.call(this) );
        }
        
        config.resources[item] = url;
        return that;
    }
    /**
     * 加载外部css
     * @param {*} src 
     * @param {*} reload 
     * @param {*} fun 
     */
    function loadcss(src,reload, fun){
        var head = document.getElementsByTagName('head')[0] || document.head || document.documentElement;
        
        var linkList = head.getElementsByTagName("link");
        var isExists = false;
        for (var index = 0; index < linkList.length; index++) {
            var element = linkList[index];
            if(element.getAttribute("objectID")=="IDM-Module-"+src){
                if(reload){
                    element.remove();
                }else{
                    isExists = true;
                }
            }
        }
        if(isExists){
            //存在则不再次加载css
            fun&&fun();
            return;
        }

        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        link.setAttribute('objectID', "IDM-Module-"+src);

        if (typeof fun === 'function') {
            if (window.attachEvent) {
                link.onreadystatechange = function () {
                    var r = link.readyState;
                    if (r === 'loaded' || r === 'complete') {
                        link.onreadystatechange = null;
                        fun();
                    }
                };
            } else {
                link.onload = fun;
            }
        }
        head.appendChild(link);
    }
    var jsArray= [];
    Object.keys(resource.js).forEach(function(key){
        jsArray.push(key)
    });
    loadjs(jsArray,function(){
        //js组件加载完成
        console.log("加载完成")
        if(lastMdule&&lastMdule.callback){
            lastMdule.callback.call(this,lastMdule)
        }
    });
    resource.css&&resource.css.forEach(function(item){
        var url = getPath + item + '.css';
        loadcss(url,false);
    })
})(window);