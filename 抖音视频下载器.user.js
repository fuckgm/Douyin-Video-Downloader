// ==UserScript==
// @name         抖音视频下载器
// @namespace    http://tampermonkey.net/
// @version      1.14
// @description  下载抖音APP端禁止下载的视频、下载抖音无水印视频,适用于拥有或可安装脚本管理器的电脑或移动端浏览器,如:PC端Chrome、Edge等；移动端Kiwi、Yandex、Via等
// @author       那年那兔那些事
// @license      MIT License
// @include      *://*.douyin.com/*
// @include      *://*.douyinvod.com/*
// @include      *://*.iesdouyin.com/*
// @icon         https://s3.bmp.ovh/imgs/2021/08/63899211b3595b11.png
// ==/UserScript==

(function() {
	function checkUA() {
		var UAstr = "pc";
		if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
			UAstr = "mobile";
		}
		return UAstr;
	}

	function changeUrl(UAstr) {
		if (UAstr === "pc") {
			var Res = confirm("点击确认跳转PC版页面");
			if (Res == true) {
				var currentURL = location.pathname;
				var VideoID = currentURL.slice(currentURL.search("video/") + "video/".length);
				location.href = "https://www.douyin.com/video/" + VideoID;
			} else {
				console.log("用户取消跳转PC版页面");
			}
		}
	}

	function checkUrl() {
		var Url = window.location.href;
		var res = "others";
		if (Url.search("www.douyin.com") !== -1) {
			if (Url.search("/video") !== -1) {
				res = "detail";
			} else if (Url.search("/recommend") !== -1) {
				res = "recommend";
			} else if (Url.search("/channel") !== -1) {
				res = "channel";
			} else if (Url.search("/follow") !== -1) {
				res = "follow";
			} else if (Url.search("/search") !== -1) {
				res = "search";
			} else if (Url.search("/hot") !== -1) {
				res = "hot";
			} else if (location.pathname === "/") {
				res = "home";
			}
		} else if (Url.search("live.douyin.com") !== -1) {
			if (location.pathname === "/") {
				res = "livehome";
			} else {
				res = "livedetail";
			}
		} else if (Url.search("douyinvod.com") !== -1) {
			res = "download";
		} else if (Url.search("iesdouyin.com/share/video/") !== -1) {
			res = "appshare";
		}
		return res;
	}

	function createListBtn(a0, i) {
		var VideoUrl;
		var videoID = a0.parentElement.children[0].href;
		if (videoID !== undefined) {
			videoID = videoID.slice(videoID.search("video/") + "video/".length);
			var res = fetch("https://www.douyin.com/web/api/v2/aweme/iteminfo/?item_ids=" + videoID).then(
					response =>
					response
					.json())
				.then(function(resJson) {
					VideoUrl = resJson.item_list[0].video.play_addr.url_list[0].replace("playwm", "play");
				});
		} else {
			videoID = "";
			VideoUrl = "";
		}
		var a01 = a0.children[1];
		var a02;
		if (a01 === undefined) {
			a02 = document.createElement("span");
			a02.setAttribute("class", "b32855717201aaabd3d83c162315ff0a-scss")
			a02.innerHTML =
				"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: not-allowed;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
			a02.style = "text-align: left;";
			a02.onmouseover = function() {
				a02.children[0].setAttribute("fill", "rgba(47,48,53,.9)");
			};
			a02.onmouseleave = function() {
				a02.children[0].setAttribute("fill", "rgba(47,48,53,.4)");
			}
			a0.appendChild(a02);
		} else {
			a02 = a01.cloneNode(true);
			a02.innerHTML =
				"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: pointer;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
			a02.style = "text-align: left;";
			a02.onmouseover = function() {
				a02.children[0].setAttribute("fill", "rgba(47,48,53,.9)");
			};
			a02.onmouseleave = function() {
				a02.children[0].setAttribute("fill", "rgba(47,48,53,.4)");
			}
			a02.onclick = function() {
				open(VideoUrl);
			}
			a0.insertBefore(a02, a01);
		}
		a0.name = "newBtn";
	}

	function createShareBtn() {
		var PareObj = document.getElementsByClassName("author-name--2Gvl7");
		var VideoObj = document.getElementsByTagName("video");
		if ((PareObj.length !== 0) && (VideoObj.length !== 0)) {
			if (PareObj[0].name !== "AddBtn") {
				var VideoUrl = VideoObj[0].src.replace("playwm", "play");
				var OriginHTML = PareObj[0].innerHTML;
				var BtnHtml = "<a href=" + VideoUrl +
					"target='_blank'><span style='font-size: 0.34667rem;line-height: 0.48rem;margin-bottom: 0.10667rem;color: rgba(255,255,255,0.9);border:2px solid rgba(255,255,255,0.9);border-radius: 4px;cursor:pointer;'>点击下载</span></a>";
				PareObj[0].innerHTML = OriginHTML + "   " + BtnHtml;
				PareObj[0].name = "AddBtn";
			}
		}
	}

	function createDetailBtn() {
		var BtnList = document.getElementsByClassName("_9c2452d0d6d8dbc6de035f37c1b11314-scss")[0];
		var videoURL = document.getElementsByTagName("video")[0].src;
		var newBtn = BtnList.children[2].cloneNode(true);
		newBtn.setAttribute("id", "newBtnDownload");
		newBtn.children[0].children[0].setAttribute("d",
			"M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z"
		);
		newBtn.children[1].setAttribute("class", "_891e9d38c00e1b78e2eae43ab8b92359-scss");
		newBtn.children[1].innerHTML = "<a href=" + videoURL +
			" style='text-decoration : none'>下载</a>";
		newBtn.children[0].onclick = function() {
			open(videoURL);
		}
		newBtn.onclick = function() {
			document.getElementsByTagName('video')[0].pause();
		}
		BtnList.appendChild(newBtn);
	}

	function createSwiperBtn() {
		var BtnList = document.getElementsByClassName("_240bd410e1956131036dfa3fa3b986d7-scss")[0];
		document.getElementsByClassName("_240bd410e1956131036dfa3fa3b986d7-scss")[0]
			.name =
			"newBtnDownload";
		var newBtn = BtnList.children[1].cloneNode(true);
		var videoURL = document.getElementsByTagName("video")[0].src;
		var pathLen = newBtn.children[0].children[0].children.length;
		if (pathLen > 1) {
			for (let i = 1; i < pathLen; i++) {
				newBtn.children[0].children[0].children[i].style.display = "none";
			}
		}
		newBtn.children[0].children[0].children[0].setAttribute("d",
			"M14 9h8v8h-8z M10 17L26 17 18 26z M7 26h22v2h-22z M7 22h2v4h-2z M27 22h2v4h-2z"
		);
		newBtn.children[1].innerHTML = "<a href=" + videoURL +
			" style='text-decoration : none'>下载</a>";
		newBtn.children[0].onclick = function() {
			open(videoURL);
		}
		newBtn.onclick = function() {
			document.getElementsByTagName('video')[0].pause();
		}
		BtnList.appendChild(newBtn);
	}

	function mainFn() {
		if (currentPage === "others") {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
		} else if (currentPage === "detail") {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
			Timer = setInterval(function() {
				var BtnList = document.getElementsByClassName("_9c2452d0d6d8dbc6de035f37c1b11314-scss")[0];
				if (BtnList !== undefined) {
					if (BtnList.children[0] !== undefined) {
						clearInterval(Timer);
						console.log("抖音视频下载器启动成功,定时器(id:" + Timer + ")关闭");
						Timer = -1;
						createDetailBtn();
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
			setTimeout(function() {
				if (Timer !== -1) {
					clearInterval(Timer);
					console.log("2s超时,定时器(id:" + Timer + ")关闭");
				}
			}, 2000);
		} else if ((currentPage === "recommend") || (currentPage === "follow")) {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
			Timer = setInterval(function() {
				var BtnList = document.getElementsByClassName("_240bd410e1956131036dfa3fa3b986d7-scss")[0];
				if (BtnList !== undefined) {
					if (BtnList.name !== "newBtnDownload") {
						if (BtnList.children[0] !== undefined) {
							createSwiperBtn();
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		} else if ((currentPage === "channel") || (currentPage === "home") || (currentPage === "search") || (
				currentPage === "hot")) {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
			Timer = setInterval(function() {
				var a = document.getElementsByClassName("d8d25680ae6956e5aa7807679ce66b7e-scss");
				if (a !== undefined) {
					if (a.length !== 0) {
						for (let i = 0; i < a.length; i++) {
							if (a[i].name !== "newBtn") {
								createListBtn(a[i], i);
							}
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		} else if (currentPage === "download") {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
			var videoOBJ = document.getElementsByTagName('video')[0];
			videoOBJ.pause();
			var videoURL = location.href;
			var videoID = videoURL.slice(videoURL.search("tos-cn-ve-15/") + "tos-cn-ve-15/".length);
			videoID = videoID.slice(0, videoID.search("/"));
			var a = document.createElement("a");
			a.href = videoURL;
			a.download = videoID + ".mp4";
			a.click();
		} else if ((currentPage === "livehome") || (currentPage === "livedetail")) {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
		} else if (currentPage === "appshare") {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
			var pastUA = "";
			Timer = setInterval(function() {
				var currentUA = checkUA();
				if (pastUA !== currentUA) {
					pastUA = currentUA;
					changeUrl(currentUA);
				}
				createShareBtn();
			}, 500);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		}
	}

	function displayAllChoice() {
		if ((currentPage === "home") || (currentPage === "channel") || (currentPage === "recommend") ||
			(currentPage === "follow") || (currentPage === "livehome") || (currentPage === "hot")) {
			var ChoiceObj = document.getElementsByClassName("d665312e963d020cd82d569bddfacb81-scss");
			if (ChoiceObj.length !== 0) {
				for (let i = 0; i < ChoiceObj.length; i++) {
					if (ChoiceObj[i].name !== "Displaying") {
						if (ChoiceObj[i].children[0].href.search("200204") === -1) {
							ChoiceObj[i].style.display = "flex";
						}
						ChoiceObj[i].name = "Displaying";
					}
				}
			}
			console.log("显示" + currentPage + "页侧栏所有选项");
		}

	}

	function hidePopup() {
		var ClassArray = ["login-guide-container", "athena-survey-widget",
			"athena-survey-widget  ltr desktop-normal theme-flgd   "
		];
		var HideNum = 0;
		for (let i = 0; i < ClassArray.length; i++) {
			var PopObj = document.getElementsByClassName(ClassArray[i])[0];
			if (PopObj && PopObj.style.display !== "none") {
				PopObj.style.display = "none";
				HideNum += 1;
			}
		}
		if (HideNum > 0) {
			console.log(currentPage + "页检测到" + HideNum + "个非必要弹窗,已隐藏!");
		}
	}

	var Timer = -1;
	var Page = "others";
	var currentPage = "others";
	var checkTimer = setInterval(function() {
		currentPage = checkUrl();
		hidePopup();
		if (Page !== currentPage) {
			if (Page !== "others") {
				console.log("页面切换(上一页为" + Page + "页)");
			}
			mainFn();
			displayAllChoice();
		}
	}, 200);
	console.log("抖音视频下载器(URL监听与弹窗检测)启动,定时器(id:" + checkTimer + ")开启");
})();
