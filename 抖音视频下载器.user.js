// ==UserScript==
// @name         抖音视频下载器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  下载抖音无水印视频（仅仅支持pc版网页，移动端请将浏览器ua改成电脑ua）
// @author       那年那兔那些事
// @include      *://*.douyin.com/*
// @include      *://v26-web.douyinvod.com/*
// ==/UserScript==

(function() {
	var checkUrl = window.location.pathname;
	var Timer;
	if (checkUrl.search("tos-cn-ve-15") !== -1) {
		var videoURL = "https://v26-web.douyinvod.com/" + checkUrl;
		var videoID = checkUrl.slice(checkUrl.search("tos-cn-ve-15/") + "tos-cn-ve-15/".length);
		videoID = videoID.slice(0, videoID.search("/"));
		var a = document.createElement("a");
		a.href = videoURL;
		a.download = videoID + ".mp4";
		a.click();
	} else if (checkUrl.search("video") !== -1) {
		Timer = setInterval(function() {
			var BtnList = document.getElementsByClassName("_9c2452d0d6d8dbc6de035f37c1b11314-scss")[0];
			if (BtnList !== undefined) {
				if (BtnList.children[0] !== undefined) {
					clearInterval(Timer);
					Timer = -1;
					var newBtn = BtnList.children[0].cloneNode(true);
					newBtn.setAttribute("id", "newBtnDownload");
					newBtn.children[0].children[0].setAttribute("d",
						"M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z");
					newBtn.children[1].setAttribute("class", "_891e9d38c00e1b78e2eae43ab8b92359-scss");
					newBtn.children[1].innerText = "下载";
					newBtn.onclick = function() {
						var videoURL = document.getElementsByTagName("video")[0].src;
						open(videoURL);
					}
					BtnList.appendChild(newBtn);
				}
			}
		}, 200);
		setTimeout(function() {
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("抖音视频下载器运行错误");
			}
		}, 2000);
	} else if (checkUrl.search("recommend") !== -1) {
		Timer = setInterval(function() {
			var BtnList = document.getElementsByClassName("_240bd410e1956131036dfa3fa3b986d7-scss")[0];
			if (BtnList !== undefined) {
				if (BtnList.name !== "newBtnDownload") {
					if (BtnList.children[0] !== undefined) {
						document.getElementsByClassName("_240bd410e1956131036dfa3fa3b986d7-scss")[0].name =
							"newBtnDownload";
						var newBtn = BtnList.children[1].cloneNode(true);
						newBtn.children[0].children[0].children[0].setAttribute("d",
							"M14 9h8v8h-8z M10 17L26 17 18 26z M7 26h22v2h-22z M7 22h2v4h-2z M27 22h2v4h-2z"
							);
						newBtn.children[1].innerText = "下载";
						newBtn.onclick = function() {
							var videoURL = document.getElementsByTagName("video")[0].src;
							open(videoURL);
						}
						BtnList.appendChild(newBtn);
					}
				}
			}
		}, 200);
	}

})();
