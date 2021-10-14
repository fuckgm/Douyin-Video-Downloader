// ==UserScript==
// @name         抖音视频下载器
// @namespace    http://tampermonkey.net/
// @version      1.17
// @description  下载抖音APP端禁止下载的视频、下载抖音无水印视频、免登录使用大部分功能、屏蔽不必要的弹窗,适用于拥有或可安装脚本管理器的电脑或移动端浏览器,如:PC端Chrome、Edge、华为浏览器等,移动端Kiwi、Yandex、Via等
// @author       那年那兔那些事
// @license      MIT License
// @include      *://*.douyin.com/*
// @include      *://*.douyinvod.com/*
// @include      *://*.iesdouyin.com/*
// @icon         https://s3.bmp.ovh/imgs/2021/08/63899211b3595b11.png
// ==/UserScript==

(function() {
	var check = {
		ua: function() {
			var UAstr = "pc";
			if (/Android|webOS|iPhone|iPod|BlackBerry|HarmonyOS/i.test(navigator.userAgent)) {
				UAstr = "mobile";
			}
			return UAstr;
		},
		url: function() {
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
			} else if (Url.search("douyinvod.com") !== -1 && Url.search("/video/tos/") !== -1) {
				res = "download";
			} else if (Url.search("iesdouyin.com/share/video/") !== -1) {
				res = "appshare";
			}
			return res;
		}
	}

	var createBtn = {
		list: function(a0, i) {
			var VideoUrl;
			var videoID = a0.parentElement.children[0].href;
			if (videoID !== undefined) {
				videoID = videoID.slice(videoID.search("video/") + "video/".length);
				var res = fetch("https://www.douyin.com/web/api/v2/aweme/iteminfo/?item_ids=" + videoID)
					.then(
						response =>
						response
						.json())
					.then(function(resJson) {
						VideoUrl = resJson.item_list[0].video.play_addr.url_list[0].replace("playwm",
							"play");
					});
			} else {
				videoID = "";
				VideoUrl = "";
			}
			var a01 = a0.children[1];
			var a02, a020;
			if (a01 === undefined) {
				a02 = document.createElement("span");
				a02.setAttribute("class", "b32855717201aaabd3d83c162315ff0a-scss")
				a02.innerHTML =
					"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: not-allowed;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
				a02.style = "text-align: left;";
				a0.appendChild(a02);
			} else {
				a02 = a01.cloneNode(true);
				a02.innerHTML =
					"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: pointer;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
				a02.style = "text-align: left;";
				a020 = a02.children[0];
				a020.onmouseover = function() {
					a020.setAttribute("fill", "rgba(47,48,53,.9)");
				};
				a020.onmouseleave = function() {
					a020.setAttribute("fill", "rgba(47,48,53,.4)");
				}
				a02.onclick = function() {
					open(VideoUrl);
				}
				a0.insertBefore(a02, a01);
			}
			a0.name = "newBtn";
		},
		share: function() {
			var OldTittle = document.getElementsByClassName("author-name--2Gvl7");
			var VideoObj = document.getElementsByTagName("video");
			if (document.getElementById("NewDownloadBtn") === null) {
				if ((OldTittle.length !== 0) && (VideoObj.length !== 0)) {
					OldTittle = OldTittle[0];
					var NewTittle = OldTittle.cloneNode(true);
					var VideoUrl = VideoObj[0].src.replace("playwm", "play");
					var OriginHTML = NewTittle.innerHTML;
					var BtnHtml = "<a href=" + VideoUrl +
						"target='_blank'><span style='font-size: 0.34667rem;line-height: 0.48rem;margin-bottom: 0.10667rem;color: rgba(255,255,255,0.9);border:2px solid rgba(255,255,255,0.9);border-radius: 4px;cursor:pointer;'>点击下载</span></a>";
					NewTittle.innerHTML = OriginHTML + "   " + BtnHtml;
					NewTittle.id = "NewDownloadBtn";
					OldTittle.parentElement.insertBefore(NewTittle, OldTittle);
					OldTittle.style.display = "none";
				}
			}
		},
		detail: function() {
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
		},
		swiper: function() {
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
		},
		video: function() {
			var relativeTitleBox = document.getElementsByClassName(
				"_86d134501588dfefce20e44d7f9e587b-scss")[0];
			var relativeRoomBox = document.getElementsByClassName("_03c7d709ebf244be0fac49bd513b6d75-scss")[
				0];
			var oldTitle = document.createElement("span");
			var newBtn = document.createElement("span");
			var displayText = "[ 展开 ]";
			var hideText = "[ 隐藏 ]";
			oldTitle.innerHTML = relativeTitleBox.innerHTML;
			newBtn.innerHTML = displayText;
			newBtn.style = "margin-left:10px;color:rgba(47, 48, 53,0.7);cursor:pointer;";
			newBtn.id = "relativeBtn";
			newBtn.onclick = function() {
				if (newBtn.innerText === displayText) {
					relativeRoomBox.style.display = "";
					newBtn.innerText = hideText;
				} else {
					relativeRoomBox.style.display = "none";
					newBtn.innerText = displayText;
				}
			}
			newBtn.onmouseover = function() {
				newBtn.style.color = "rgba(47, 48, 53,0.9)";
			}
			newBtn.onmouseleave = function() {
				newBtn.style.color = "rgba(47, 48, 53,0.7)";
			}
			relativeTitleBox.innerHTML = ""
			relativeTitleBox.appendChild(oldTitle);
			relativeTitleBox.appendChild(newBtn);
			relativeRoomBox.style.display = "none";
		}
	};

	var init = {
		main: function() {
			Page = currentPage;
			console.log("当前页判断为" + Page + "页");
			if (Timer !== -1) {
				clearInterval(Timer);
				console.log("已释放上一定时器(ID:" + Timer + ")");
				Timer = -1;
			}
		},
		login: function() {
			var ClassArray = [
				"abace09bde29f9d2077ba2a9e9e2b67d-scss _93fbc55b0dd6667bca4858426fd34dde-scss _14339689bca6b9eda19c146a14df625e-scss _7ecaa8ba84de53f8bea1cb4996e405a7-scss _8466f1adbc57d0978d0ac366e59ed9a7-scss",
				"bed9a6c25b644fe7083f8daf4da9574b-scss _7da806a86cca87e85c2238c842716b35-scss _981181df75601f4772116d77f7b11bc3-scss d137d3747225da4f801767811d7104db-scss _1e88f2ef9e8486fae5ffe34156b1ded4-scss"
			];
			for (let i = 0; i < ClassArray.length; i++) {
				var LoginBtn = document.getElementsByClassName(ClassArray[i])[0];
				if (LoginBtn) {
					break;
				}
			}
			if (LoginBtn && LoginBtn.name !== "newLoginBtn") {
				LoginBtn.addEventListener("click", function() {
					loginPopupFlag = false;
					console.log("用户登录中...");
				});
				LoginBtn.name = "newLoginBtn";
			}
		},
		edge: function() {
			switch (currentPage) {
				case "home":
				case "channel":
				case "recommend":
				case "follow":
				case "livehome":
				case "hot":
					var EdgeBarClass = ["fb2dec3549d317f2d5116f185d19bea8-scss",
						"_8344e6bcc8551f4c88c21183a102908e-scss"
					];
					var EdgeBar = null;
					for (let i = 0; i < EdgeBarClass.length; i++) {
						EdgeBar = document.getElementsByClassName(EdgeBarClass[i]);
						if (EdgeBar.length !== 0) {
							break;
						} else {
							EdgeBar = null;
						}
					}
					if (EdgeBar[0] !== null) {
						var EdgeObj = EdgeBar[0].children;
						if (EdgeObj.length !== 0) {
							for (let i = 0; i < EdgeObj.length; i++) {
								var EdgeChoice = EdgeObj[i];
								if (EdgeChoice.name !== "Displaying") {
									if (EdgeChoice.childElementCount > 0 && EdgeChoice.children[0].href
										.search("200204") === -1) {
										EdgeChoice.style.display = "flex";
									}
									EdgeChoice.name = "Displaying";
								}
							}
							console.log("显示" + currentPage + "页侧栏所有选项");
						}
					}
					break;
				default:
			}
		}
	};

	var main = {
		others: function() {
			init.main();
		},
		detail: function() {
			init.main();
			Timer = setInterval(function() {
				var BtnList = document.getElementsByClassName(
					"_9c2452d0d6d8dbc6de035f37c1b11314-scss")[0];
				if (BtnList !== undefined) {
					if (BtnList.children[0] !== undefined) {
						clearInterval(Timer);
						console.log("抖音视频下载器启动成功,定时器(id:" + Timer + ")关闭");
						Timer = -1;
						createBtn.detail();
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
		},
		recommend: function() {
			init.main();
			Timer = setInterval(function() {
				var BtnList = document.getElementsByClassName(
					"_240bd410e1956131036dfa3fa3b986d7-scss")[0];
				if (BtnList !== undefined) {
					if (BtnList.name !== "newBtnDownload") {
						if (BtnList.children[0] !== undefined) {
							createBtn.swiper();
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		},
		follow: function() {
			this.recommend();
		},
		channel: function() {
			init.main();
			Timer = setInterval(function() {
				var a = document.getElementsByClassName("d8d25680ae6956e5aa7807679ce66b7e-scss");
				if (a !== undefined) {
					if (a.length !== 0) {
						for (let i = 0; i < a.length; i++) {
							if (a[i].name !== "newBtn") {
								createBtn.list(a[i], i);
							}
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		},
		home: function() {
			this.channel();
		},
		search: function() {
			this.channel();
		},
		hot: function() {
			this.channel();
		},
		download: function() {
			init.main();
			var videoOBJ = document.getElementsByTagName('video')[0];
			videoOBJ.pause();
			var videoURL = location.href;
			var videoID = videoURL.slice(videoURL.search("tos-cn-ve-15/") + "tos-cn-ve-15/".length);
			videoID = videoID.slice(0, videoID.search("/"));
			var a = document.createElement("a");
			a.href = videoURL;
			a.download = videoID + ".mp4";
			a.click();
		},
		livehome: function() {
			init.main();
		},
		livedetail: function() {
			init.main();
			createBtn.video();
			window.onload = function() {
				var Btn = document.getElementById("relativeBtn");
				if (Btn) {
					if (Btn.innerText === "[ 隐藏 ]") {
						Btn.click();
						console.log("隐藏相关直播");
					}
				}
			}
		},
		appshare: function() {
			init.main();
			var pastUA = "";
			Timer = setInterval(function() {
				var currentUA = check.ua();
				if (pastUA !== currentUA) {
					pastUA = currentUA;
					if (currentUA === "pc") {
						var Res = confirm("点击确认跳转PC版页面");
						if (Res == true) {
							var currentURL = location.pathname;
							var VideoID = currentURL.slice(currentURL.search("video/") + "video/"
								.length);
							location.href = "https://www.douyin.com/video/" + VideoID;
						} else {
							console.log("用户取消跳转PC版页面");
						}
					}
				}
				createBtn.share();
			}, 500);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		},
		match: function() {
			switch (currentPage) {
				case "others":
					this.others();
					break;
				case "detail":
					this.detail();
					break;
				case "recommend":
					this.recommend();
					break;
				case "follow":
					this.follow();
					break;
				case "channel":
					this.channel();
					break;
				case "home":
					this.home();
					break;
				case "search":
					this.search();
					break;
				case "hot":
					this.hot();
					break;
				case "download":
					this.download();
					break;
				case "livehome":
					this.livehome();
					break;
				case "livedetail":
					this.livedetail();
					break;
				case "appshare":
					this.appshare();
					break;
				default:
					console.log("当前页无匹配功能,启动默认功能(others页)");
					this.others();
			}
		},
		popup: function() {
			//普通弹窗，直接无脑屏蔽
			var ClassArray = ["login-guide-container", "athena-survey-widget",
				"athena-survey-widget  ltr desktop-normal theme-flgd   "
			];
			var HideNum = 0;
			var PopObj;
			for (let i = 0; i < ClassArray.length; i++) {
				PopObj = document.getElementsByClassName(ClassArray[i])[0];
				if (PopObj && PopObj.style.display !== "none") {
					PopObj.style.display = "none";
					HideNum += 1;
				}
			}
			//登录弹窗，不能无脑屏蔽，需要考虑情况
			try {
				PopObj = document.getElementById("login-pannel").parentElement.parentElement;
			} catch (e) {
				PopObj = false;
			}
			if (loginPopupFlag) {
				if (PopObj && PopObj.style.display !== "none") {
					PopObj.style.display = "none";
					HideNum += 1;
				}
			} else {
				if (PopObj && PopObj.style.display === "none") {
					PopObj.style.display = "";
				}
				if (PopObj === false) {
					loginPopupFlag = true;
					console.log("用户取消登录或登录成功");
				}
			}
			if (HideNum > 0) {
				console.log(currentPage + "页检测到" + HideNum + "个非必要弹窗,已隐藏!");
			}
		}
	}

	var Timer = -1;
	var Page = "others";
	var currentPage = "others";
	var loginPopupFlag = true;
	var checkTimer = setInterval(function() {
		currentPage = check.url();
		main.popup();
		init.login();
		if (Page !== currentPage) {
			if (Page !== "others") {
				console.log("页面切换(上一页为" + Page + "页)");
			}
			main.match();
			init.edge();
		}
	}, 200);
	console.log("抖音视频下载器(URL监听与弹窗检测)启动,定时器(id:" + checkTimer + ")开启");
})();
