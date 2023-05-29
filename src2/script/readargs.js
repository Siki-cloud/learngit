//获取当前的js文件的路径
function getJsPath(jsname) {
    var js = document.scripts;
    var jsPath = "";
    for (var i = js.length; i > 0; i--) {
        if (js[i - 1].src.indexOf(jsname) > -1) {
            return js[i - 1].src;
        }
    }
    return jsPath;
}

function getUrlParam(jsname){
	var url = getJsPath(jsname);
	console.log(url);
	var theparameter = new Object();
	if(url.indexOf("?") != -1){
		//参数不为空
		var str = url.substr(url.indexOf("?")+1);
		strs = str.split("&");
		for (var i=0; i <strs.length;i++){
			theparameter[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);//解码
		}
	
	}
	return theparameter;
}

//获取js文件后面的参数
function getParam(jspath, parm) {
    var urlparse = jspath.split("\?");
    var parms = urlparse[1].split("&");
    var values = {};
    for(var i = 0; i < parms.length; i++) {
        var pr = parms[i].split("=");
        if (pr[0] == parm)
        return pr[1];
    }
    return "";
}