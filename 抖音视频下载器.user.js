// ==UserScript==
// @name         抖音视频下载器
// @namespace    http://tampermonkey.net/
// @version      1.25
// @description  下载抖音APP端禁止下载的视频、下载抖音无水印视频、免登录使用大部分功能、屏蔽不必要的弹窗,适用于拥有或可安装脚本管理器的电脑或移动端浏览器,如:PC端Chrome、Edge、华为浏览器等,移动端Kiwi、Yandex、Via等
// @author       那年那兔那些事
// @license      MIT License
// @include      *://*.douyin.com/*
// @include      *://*.douyinvod.com/*
// @include      *://*.iesdouyin.com/*
// @include      *://*.zjcdn.com/*
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
			var UAstr = this.ua();
			var res = "others";
			//区分UA
			if (UAstr === "mobile" && Url.search("douyin.com/share/video/") !== -1) {
				res = "appshare";
			} else if (UAstr === "pc") {
				if (Url.search("www.iesdouyin.com/video/") !== -1) {
					res = "detail";
				} else if (Url.search("www.douyin.com") !== -1) {
					if (Url.search("/discover") !== -1) {
						res = "home";
					} else if (location.pathname === "/") {
						res = "recommend";
					} else if (Url.search("/follow") !== -1) {
						res = "follow";
					} else if (Url.search("/hot") !== -1) {
						res = "hot";
					} else if (Url.search("/channel") !== -1) {
						res = "channel";
					} else if (Url.search("/video") !== -1) {
						res = "detail";
					} else if (Url.search("/search") !== -1) {
						res = "search";
					}
				}
			}
			//不区分UA
			if (Url.search("live.douyin.com") !== -1) {
				if (location.pathname === "/") {
					res = "livehome";
				} else {
					res = "livedetail";
				}
			} else if (Url.search("douyinvod.com") !== -1 && Url.search("/video/tos/") !== -1) {
				res = "download";
			}
			return res;
		},
		name: function(type, pareObj) {
			if (!pareObj) {
				pareObj = document;
			}
			var res0, res1; //0:author,1:title
			switch (type) {
				case "share":
					res0 = pareObj.getElementsByClassName("author-name").children[0];
					res1 = pareObj.getElementsByClassName("desc")[0];
					break;
				case "list":
					res0 = pareObj.children[2].children[0];
					res1 = pareObj.children[1];
					break;
				case "swiper":
					res0 = pareObj.getElementsByClassName("mzZanXbP")[0];
					res1 = pareObj.getElementsByClassName("title")[0];
					break;
				case "video":
					res0 = pareObj.getElementsByClassName("mzZanXbP")[0];
					res1 = pareObj.getElementsByClassName("AQHQ2slR")[0];
					break;
				default:
					break;
			}
			if (!res0 || !res1) {
				return "";
			}
			res0 = res0.innerText.replace(/(^\s*)|(\s*$)/g, "");
			res1 = res1.innerText.replace(/(^\s*)|(\s*$)/g, "").slice(0, 30); //限制在30个字符内
			return res1 + "@" + res0;
		},
		download: function(url, name) {
			if (name) {
				return encodeURI(url + "&video-name=" + name);
			} else {
				return decodeURI(url).split("&video-name=");

			}
		}
	}

	var createBtn = {
		share: function() {
			if (!document.getElementById("NewDownloadBtn")) {
				var OldTittle = document.getElementsByClassName("author-name")[0];
				var VideoObj = document.getElementsByTagName("video")[0];
				if (OldTittle && VideoObj) {
					var NewTittle = OldTittle.cloneNode(true);
					var VideoUrl = VideoObj.src.replace("playwm", "play");
					VideoUrl = check.download(VideoUrl, check.name("share"));
					var OriginHTML = "<span>" + NewTittle.innerHTML + "</span>";
					var BtnHtml = "<a href=" + VideoUrl +
						"target='_blank' style='text-decoration: none;'><span style='font-size: 0.34667rem;line-height: 0.48rem;margin-bottom: 0.10667rem;color: rgba(255,255,255,0.9);border:2px solid rgba(255,255,255,0.9);border-radius: 4px;cursor:pointer;'>点击下载</span></a>";
					NewTittle.innerHTML = OriginHTML + "   " + BtnHtml;
					NewTittle.id = "NewDownloadBtn";
					OldTittle.parentElement.insertBefore(NewTittle, OldTittle);
					OldTittle.remove();
				}
			}
		},
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
			var a02 = document.createElement("span");
			if (a01 === undefined) {
				a02.innerHTML =
					"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: not-allowed;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
				a02.style = "text-align: left;";
				a0.appendChild(a02);
			} else {
				var UrlAnnexe = check.name("list", a0.parentElement);
				a02.innerHTML =
					"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: pointer;margin-left:5px;' fill='rgba(47,48,53,.4)'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
				var a020 = a02.children[0];
				a020.onmouseover = function() {
					a020.setAttribute("fill", "rgba(47,48,53,.9)");
				};
				a020.onmouseleave = function() {
					a020.setAttribute("fill", "rgba(47,48,53,.4)");
				}
				a02.onclick = function() {
					open(check.download(VideoUrl, UrlAnnexe));
				}
				a0.insertBefore(a02, a01);
			}
			a0.name = "newBtn";
		},
		swiper: {
			create: function(BtnList) {
				var newBtn = BtnList.children[1].cloneNode(true);
				var pathLen = newBtn.children[0].children[0].children.length;
				if (pathLen > 1) {
					for (let i = 1; i < pathLen; i++) {
						newBtn.children[0].children[0].children[i].style.display = "none";
					}
				}
				newBtn.children[0].children[0].children[0].setAttribute("d",
					"M14 9h8v8h-8z M10 17L26 17 18 26z M7 26h22v2h-22z M7 22h2v4h-2z M27 22h2v4h-2z"
				);
				newBtn.children[1].innerHTML = "<a style='text-decoration : none'>下载</a>";
				newBtn.onclick = function() {
					document.getElementsByTagName('video')[0].pause();
				}
				var newBtnBox = document.createElement("div");
				newBtnBox.setAttribute("class", "newBtnDownload");
				newBtnBox.appendChild(newBtn);
				BtnList.appendChild(newBtnBox);
			},
			change: function(BtnList, videoURL, presentObj) {
				var newBtnBox = BtnList.getElementsByClassName("newBtnDownload")[0];
				if (newBtnBox) {
					var newBtn = newBtnBox.children[0];
					if (videoURL) {
						var newVideoURL = check.download(videoURL, check.name("swiper"), presentObj);
						newBtn.children[0].onclick = function() {
							open(newVideoURL);
						}
						newBtn.children[1].innerHTML = "<a href=" + newVideoURL +
							" style='text-decoration : none'>下载</a>";
						newBtn.setAttribute("data-src", videoURL);
					}
				}
			}
		},
		video: function(BtnList) {
			if (!document.getElementById("newBtnDownload")) {
				var videoURL = document.getElementsByTagName("video")[0];
				if (videoURL) {
					videoURL = videoURL.getElementsByTagName("source")[0].src;
					videoURL = check.download(videoURL, check.name("video"));
					console.log(videoURL);
					var newBtn = BtnList.children[2].cloneNode(true);
					newBtn.setAttribute("id", "newBtnDownload");
					newBtn.children[0].children[0].setAttribute("d",
						"M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z");
					newBtn.children[1].setAttribute("class", "iR6dOMAO");
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
			}
		},
		live: function() {
			var relativeBox = document.getElementsByClassName("_7OgLGvrh")[0];
			if (relativeBox) {
				var relativeTitleBox = relativeBox.children[0].children[0];
				var relativeRoomBox = relativeBox.children[1];
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
			if (!document.getElementById("undisturbWatchBtn")) {
				var undisturbWatchBtn = document.createElement("button");
				undisturbWatchBtn.setAttribute("class", "VPz4-306");
				undisturbWatchBtn.style.margin = "0 0 0 8px";
				undisturbWatchBtn.innerText = "沉浸式观看";
				undisturbWatchBtn.id = "undisturbWatchBtn";
				undisturbWatchBtn.setAttribute("state-data", "off");
				undisturbWatchBtn.onclick = function() {
					var state = this.getAttribute("state-data");
					if (state === "off") {
						state = "on";
						this.style.background = "var(--color-primary)";
						this.style.color = "var(--color-anti-white)";
					} else {
						state = "off";
						this.style.background = "";
						this.style.color = "";
					}
					var list = ["BJUkFEKo", "l0I0l5H4", "_3zMWm4HT", "HPcNXBOf", "ohjo+Xk3"];
					var target;
					for (let i = 0; i < list.length; i++) {
						target = document.getElementsByClassName(list[i])[0];
						if (target) {
							if (state === "on") {
								target.style.display = "none";
							} else {
								target.style.display = "";
							}
						}
					}
					this.setAttribute("state-data", state);
					console.log("沉浸式观看:" + state);
				}
				var beforeBtn = document.getElementsByClassName("VPz4-306")[0];
				beforeBtn.parentElement.insertBefore(undisturbWatchBtn, beforeBtn);
			}
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
		click: function() {
			loginPopupFlag = false;
			console.log("用户登录中...");
		},
		login: function() {
			var ClassArray = [
				"abace09bde29f9d2077ba2a9e9e2b67d-scss _93fbc55b0dd6667bca4858426fd34dde-scss _14339689bca6b9eda19c146a14df625e-scss _7ecaa8ba84de53f8bea1cb4996e405a7-scss _8466f1adbc57d0978d0ac366e59ed9a7-scss",
				"bed9a6c25b644fe7083f8daf4da9574b-scss _7da806a86cca87e85c2238c842716b35-scss _981181df75601f4772116d77f7b11bc3-scss d137d3747225da4f801767811d7104db-scss _1e88f2ef9e8486fae5ffe34156b1ded4-scss"
			];
			var LoginBtnArray, LoginBtn;
			for (let i = 0; i < ClassArray.length; i++) {
				LoginBtnArray = document.getElementsByClassName(ClassArray[i]);
				if (LoginBtnArray[0]) {
					break;
				}
			}
			for (let i = 0; i < LoginBtnArray.length; i++) {
				LoginBtn = LoginBtnArray[i];
				if (LoginBtn && LoginBtn.name !== "newLoginBtn") {
					LoginBtn.addEventListener("click", init.click);
					LoginBtn.name = "newLoginBtn";
				}
			}
		},
		edge: function() {
			switch (currentPage) {
				case "home":
				case "recommend":
				case "follow":
				case "hot":
				case "channel":
				case "livehome":
					var ClassArray = ["fb2dec3549d317f2d5116f185d19bea8-scss",
						"_8344e6bcc8551f4c88c21183a102908e-scss"
					];
					var EdgeBar;
					for (let i = 0; i < ClassArray.length; i++) {
						EdgeBar = document.getElementsByClassName(ClassArray[i])[0];
						if (EdgeBar) {
							break;
						}
					}
					if (EdgeBar && EdgeBar.childElementCount !== 0) {
						for (let i = 0; i < EdgeBar.childElementCount; i++) {
							var EdgeOpt = EdgeBar.children[i];
							if (EdgeOpt.name !== "Displaying") {
								if (EdgeOpt.childElementCount > 0 && EdgeOpt.children[0].href
									.search("200204") === -1) {
									EdgeOpt.style.display = "flex";
								}
								EdgeOpt.name = "Displaying";
							}
						}
						console.log("显示" + currentPage + "页侧栏所有选项");
					}
					break;
			}
		}
	};

	var main = {
		others: function() {
			init.main();
		},
		appshare: function() {
			init.main();
			Timer = setInterval(function() {
				createBtn.share();
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
			setTimeout(function() {
				if (Timer !== -1) {
					clearInterval(Timer);
					console.log("2s超时,定时器(id:" + Timer + ")关闭");
				}
			}, 2000);
		},
		home: function() {
			init.main();
			Timer = setInterval(function() {
				var a = document.getElementsByClassName("_2NJWgK5p");
				if (a.length !== 0) {
					for (let i = 0; i < a.length; i++) {
						if (a[i].name !== "newBtn") {
							createBtn.list(a[i], i);
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		},
		recommend: function() {
			init.main();
			var BtnList, newBtnBox, presentObj, videoURL, btnObj;
			Timer = setInterval(function() {
				BtnList = document.getElementsByClassName("TvKp5rIf")[0];
				if (BtnList) {
					newBtnBox = BtnList.getElementsByClassName("newBtnDownload")[0];
					if (!newBtnBox) {
						createBtn.swiper.create(BtnList);
					} else {
						btnObj = newBtnBox.children[0];
						presentObj = document.getElementsByClassName(
							"swiper-slide _79rCAeWZ swiper-slide-active")[0];
						videoURL = presentObj.getElementsByTagName("video")[0].children[0].src;
						if (videoURL && btnObj.getAttribute("data-src") !== videoURL) {
							createBtn.swiper.change(BtnList, videoURL, presentObj);
						}
					}
				}
			}, 200);
			console.log("抖音视频下载器(" + Page + "页)启动,定时器(id:" + Timer + ")开启");
		},
		follow: function() {
			this.recommend();
		},
		hot: function() {
			this.home();
		},
		channel: function() {
			this.home();
		},
		detail: function() {
			init.main();
			Timer = setInterval(function() {
				var BtnList = document.getElementsByClassName("HF-f8Lg-")[0].children[0];
				if (BtnList) {
					if (BtnList.children[2]) {
						createBtn.video(BtnList);
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
		search: function() {
			this.home();
		},
		livehome: function() {
			init.main();
		},
		livedetail: function() {
			init.main();
			window.onload = function() {
				createBtn.live();
				var Btn = document.getElementById("relativeBtn");
				if (Btn) {
					if (Btn.innerText === "[ 隐藏 ]") {
						Btn.click();
						console.log("抖音视频下载器(" + Page + "页)启动,隐藏相关直播");
					}
				}
			}
		},
		download: function() {
			init.main();
			var videoOBJ = document.getElementsByTagName('video')[0];
			videoOBJ.pause();
			var data = check.download(location.href);
			var a = document.createElement("a");
			a.href = data[0];
			a.download = (data[1] ? data[1] : "抖音无水印视频") + ".mp4";
			a.click();
		},
		match: function() {
			switch (currentPage) {
				case "others":
					this.others();
					break;
				case "appshare":
					this.appshare();
					break;
				case "home":
					this.home();
					break;
				case "recommend":
					this.recommend();
					break;
				case "follow":
					this.follow();
					break;
				case "hot":
					this.hot();
					break;
				case "channel":
					this.channel();
					break;
				case "detail":
					this.detail();
					break;
				case "search":
					this.search();
					break;
				case "livehome":
					this.livehome();
					break;
				case "livedetail":
					this.livedetail();
					break;
				case "download":
					this.download();
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
			//不登陆看评论的弹窗
			try {
				PopObj = document.getElementById("login-pannel").parentElement.parentElement;
			} catch (e) {
				PopObj = false;
			}
			//控制台输出相关信息
			if (HideNum > 0) {
				console.log(currentPage + "页检测到" + HideNum + "个非必要弹窗,已隐藏!");
			}
		},
		jump: function() {
			var currentUA = check.ua();
			if (pastUA !== currentUA) {
				pastUA = currentUA;
				if (currentUA === "pc") {
					var currentHost = location.hostname;
					var currentPath = location.pathname;
					var newUrl = "";
					if (currentHost.search("douyin.com") !== -1) {
						if (currentPath.search("/share/video/") !== -1) {
							newUrl = "https://www.douyin.com" + currentPath.replace("/share", "");
						} else if (currentPath === "/home") {
							newUrl = "https://www.douyin.com";
						}
					}
					if (newUrl !== "") {
						var Res = confirm("点击确认跳转PC版页面");
						if (Res) {
							location.href = newUrl;
						} else {
							console.log("用户取消跳转PC版页面");
						}
					}
				}
			}
		}
	}

	var Timer = -1;
	var Page = "others";
	var currentPage = "others";
	var pastUA = "";
	var loginPopupFlag = true;
	var checkTimer = setInterval(function() {
		currentPage = check.url();
		main.jump();
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
