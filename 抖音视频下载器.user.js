// ==UserScript==
// @name         抖音视频下载器
// @namespace    http://tampermonkey.net/
// @version      1.30
// @description  下载抖音APP端禁止下载的视频、下载抖音无水印视频、免登录使用大部分功能、屏蔽不必要的弹窗,适用于拥有或可安装脚本管理器的电脑或移动端浏览器,如:PC端Chrome、Edge、华为浏览器等,移动端Kiwi、Yandex、Via等
// @author       那年那兔那些事
// @license      MIT License
// @include      *://*.douyin.com/*
// @include      *://*.douyinvod.com/*
// @include      *://*.idouyinvod.com/*
// @include      *://*.iesdouyin.com/*
// @include      *://*.zjcdn.com/*
// @icon         https://s3.bmp.ovh/imgs/2021/08/63899211b3595b11.png
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// ==/UserScript==

(function() {
	var tools = {
		checkUA: function() {
			var UAstr = "pc";
			if (/Android|webOS|iPhone|iPod|BlackBerry|HarmonyOS/i.test(navigator.userAgent)) {
				UAstr = "mobile";
			}
			return UAstr;
		},
		identifySite: function() {
			var Url = window.location.href;
			var UAstr = this.checkUA();
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
			} else if (/douyinvod.com|zjcdn.com/i.test(Url) && Url.search("/video/tos/") !== -1) {
				res = "download";
			}
			return res;
		},
		videoName: function(type, pareObj) {
			if (!pareObj) {
				pareObj = document;
			}
			var title, author, id; //0:author,1:title,2:id
			switch (type) {
				case "share":
					title = pareObj.getElementsByClassName("desc")[0];
					author = pareObj.getElementsByClassName("author-name").children[0];
					id = location.pathname.split("video/")[1].replace("/", "");
					break;
				case "list":
					author = pareObj.children[2].children[0];
					title = pareObj.children[1];
					id = pareObj.children[0].href.split("video/")[1].replace("/", "");
					break;
				case "swiper":
					author = pareObj.getElementsByClassName("mzZanXbP")[0];
					title = pareObj.getElementsByClassName("title")[0];
					id = pareObj.getElementsByClassName("xgplayer-icon content-wrapper hasMarginRight")[0]
						.href.split("?")[0].split("video/")[1].replace("/", "");
					break;
				case "video":
					author = pareObj.getElementsByClassName("WLXvBZ9-")[0];
					title = pareObj.getElementsByClassName("AQHQ2slR")[0];
					id = location.pathname.split("video/")[1].replace("/", "");
					break;
				default:
					break;
			}
			if (!title || !author || !id) {
				return "";
			}
			author = author.innerText.replace(/(^\s*)|(\s*$)/g, "");
			title = title.innerText.replace(/(^\s*)|(\s*$)/g, "").slice(0, 30); //限制30字符
			return title + "@" + author + "@" + id;
		},
		downloadLink: function(url, name) {
			if (name) {
				var data = "&extraData=fileName-" + set.get("fileName") + "&&download-" + set.get(
					"download");
				return encodeURI(url + data + "&video-name=" + name);
			} else {
				return decodeURI(url).split("&video-name=");

			}
		},
		getData: function(url) {
			url = url.split("&extraData=");
			if (!url[1]) {
				return "";
			}
			url = url[1].split("&&");
			var data = {};
			var temp;
			for (let i in url) {
				temp = url[i].split("-");
				if (temp[0] && temp[1]) {
					data[temp[0]] = temp[1];
				}
			}
			return data;
		},
		parseUrl: function() {
			var res = [];
			var downloadData = this.downloadLink(location.href);
			var name = downloadData[1];
			var setData = tools.getData(downloadData[0]);
			if (setData["download"] && setData["download"] !== "auto") {
				res[1] = false;
			} else {
				res[1] = true;
			}
			switch (setData["fileName"]) {
				case "videoName":
					name = name.split("@")[0];
					break;
				case "id":
					name = name.split("@")[2];
					break;
				default:
					name = name.split("@")[0] + "@" + name.split("@")[1];
					break;
			}
			name = name ? name : "抖音视频";
			res[0] = name;
			return res;
		},
		cloneJSON: function(target) {
			return {
				...target
			};
		},
		extendJSON: function(origin, target) {
			return {
				...origin,
				...target
			};
		},
		fetchUrl: function(id) {
			if (typeof jQuery !== "function") {
				return false;
			}
			var url = "https://www.douyin.com/web/api/v2/aweme/iteminfo/?item_ids=" + id;
			var resUrl;
			$.ajax({
				url: url,
				type: "get",
				async: false,
				success: function(res) {
					resUrl = res.item_list[0].video.play_addr.url_list[0].replace("playwm",
						"play");
				}
			})
			return resUrl;
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
					VideoUrl = tools.downloadLink(VideoUrl, tools.videoName("share"));
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
			var a01 = a0.children[1];
			var a02 = document.createElement("span");
			a02.innerHTML =
				"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:32px;height:32px; cursor: pointer;margin-left:5px;' fill='var(--color-text-1)' fill-opacity='0.4'><path d='M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z' /></svg>";
			var a020 = a02.children[0];
			a020.onmouseover = function() {
				a020.setAttribute("fill-opacity", "1");
			};
			a020.onmouseleave = function() {
				a020.setAttribute("fill-opacity", "0.4");
			}
			if (a01 === undefined) {
				a02.onclick = function() {
					alert("当前项为直播间，暂时无法在列表中提取真实推流地址。请先进入直播间再提取地址");
				}
				a0.appendChild(a02);
			} else {
				var videoName = tools.videoName("list", a0.parentElement);
				var videoUrl = tools.fetchUrl(videoName.split("@")[2]);
				a02.onclick = function() {
					open(tools.downloadLink(videoUrl, videoName));
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
			change: function(BtnList, videoID, presentObj) {
				var newBtnBox = BtnList.getElementsByClassName("newBtnDownload")[0];
				if (newBtnBox) {
					var newBtn = newBtnBox.children[0];
					newBtn.setAttribute("data-id", videoID);
					newBtn.children[0].onclick = function() {
						alert("正在获取地址中，请稍后再试");
					}
					newBtn.children[1].innerHTML =
						"<a href='javascript:alert('正在获取地址中，请稍后再试')' style='text-decoration : none'>下载</a>";
					var videoURL = tools.fetchUrl(videoID);
					var videoName = tools.videoName("swiper", presentObj);
					videoURL = tools.downloadLink(videoURL, videoName);
					newBtn.children[0].onclick = function() {
						open(videoURL);
					}
					newBtn.children[1].innerHTML = "<a href=" + videoURL +
						" style='text-decoration : none'>下载</a>";
				}
			}
		},
		video: function(BtnList) {
			if (!document.getElementById("newBtnDownload")) {
				var videoURL = document.getElementById("RENDER_DATA").innerText;
				videoURL = JSON.parse(decodeURIComponent(videoURL));
				videoURL = videoURL.C_20.aweme.detail.video.playAddr[0].src.replace("playwm", "play");
				if (videoURL) {
					videoURL = tools.downloadLink(videoURL, tools.videoName("video"));
					var newBtn = BtnList.children[2].cloneNode(true);
					newBtn.setAttribute("id", "newBtnDownload");
					newBtn.children[0].children[0].setAttribute("d",
						"M12 7h8v8h-8z M8 15L24 15 16 24z M5 24h22v2h-22z M5 20h2v4h-2z M25 20h2v4h-2z");
					newBtn.children[1].setAttribute("class", "iR6dOMAO");
					newBtn.children[1].innerHTML = "<a href=" + videoURL +
						" style='text-decoration : none' target='_blank'>下载</a>";
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
		live: {
			create: function(name, id, logo, event, attribute) {
				var btn = document.createElement("button");
				btn.setAttribute("class", "VPz4-306");
				btn.style.margin = "0 0 0 8px";
				btn.innerHTML = logo + "<span>" + name + "</span>";
				btn.id = id;
				for (let i in event) {
					btn.addEventListener(i, event[i]);
				}
				for (let i in attribute) {
					btn.setAttribute(i, attribute[i]);
				}
				return btn;
			},
			undisturb: function() {
				var list = {
					"searchBar": {
						"class": "BJUkFEKo",
						"extraEvent": function(state) {
							var liveCategory = document.getElementsByClassName("xWQs9nlt KpjwjEYL")[
								0];
							if (!liveCategory) {
								console.log("直播分类模块丢失");
								return false;
							}
							if (state === "on") {
								liveCategory.style.top = "0";
							} else {
								liveCategory.style.top = "";
							}
						}
					},
					"liveCategory": {
						"class": "l0I0l5H4",
						"extraEvent": null
					},
					"relativeLive": {
						"class": "_3zMWm4HT",
						"extraEvent": null
					},
					"buttomMessage": {
						"class": "HPcNXBOf",
						"extraEvent": null
					},
					"chatWindow": {
						"class": "ojIOhXDJ",
						"extraEvent": function(state) {
							var livePlayer = document.getElementsByClassName("Jf1GlewW")[0];
							if (!livePlayer) {
								console.log("找不到直播播放器");
								return false;
							}
							if (state === "on") {
								livePlayer.style.margin = "auto";
							} else {
								livePlayer.style.margin = "";
							}
						}
					},
					"edgeTool": {
						"class": "ohjo+Xk3",
						"extraEvent": null
					},
				};
				var event = {
					"click": function() {
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
						var setData = set.get("hideList"),
							target, extraEvent;
						for (let i in setData) {
							target = false;
							extraEvent = false;
							if (setData[i] && list[i]) {
								target = document.getElementsByClassName(list[i].class)[0];
								extraEvent = list[i].extraEvent;
								if (target) {
									if (state === "on") {
										target.style.display = "none";
									} else {
										target.style.display = "";
									}
								}
								if (typeof extraEvent === "function") {
									extraEvent(state);
								}
							}
						}
						this.setAttribute("state-data", state);
						console.log("沉浸式观看:" + state);
					}
				}
				var attribute = {
					"state-data": "off",
					"title": "沉浸式观看模式:屏蔽不必要的窗口从而提高观看体验。按钮红色亮起表示已启动，非红色表示已关闭"
				}
				var btn = this.create("沉浸观看", "undisturbWatchBtn", "", event, attribute);
				return btn;
			},
			download: function() {
				var logo =
					"<svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg' class='_5AZvPWVz'><path fill-rule='evenodd' clip-rule='evenodd' d='M5 1L10 1L10 7L12 7L8 11L8 12L13 12L13 9L14 9L14 13L1 13L1 9L2 9L2 12L7 12L7 11L3 7L5 7z' fill='#2F3035'></path></svg>";
				var event = {
					"click": function() {
						var data = document.getElementById("RENDER_DATA").innerText;
						data = JSON.parse(decodeURIComponent(data));
						data = data.initialState.roomStore.roomInfo.room.stream_url;
						switch (set.get("download")) {
							case "m3u8":
								data = data.hls_pull_url_map["FULL_HD1"];
								break;
							case "flv":
								data = data.flv_pull_url["FULL_HD1"];
								break;
							default:
								data = data.hls_pull_url;
								break;
						}
						if (data && typeof data === "string") {
							var exportBox = document.createElement("input");
							exportBox.value = data;
							document.body.appendChild(exportBox);
							exportBox.select();
							document.execCommand('copy');
							exportBox.remove();
							alert("抖音真实推流地址已导出到剪贴板");
						}
					}
				}
				var attribute = {
					"title": "点击提取抖音直播真实推流地址"
				}
				var btn = this.create("提取地址", "newBtnDownload", logo, event, attribute);
				return btn;
			}
		},
		set: function() {
			if (document.getElementById("downloaderSettingBtn")) {
				return false;
			}
			var boxClassArray = ["nxsdxGGH", "ohjo+Xk3"],
				box;
			for (let i in boxClassArray) {
				box = document.getElementsByClassName(boxClassArray[i])[0];
				if (box) {
					break;
				}
			}
			var btn = document.createElement("div");
			btn.id = "downloaderSettingBtn";
			btn.style =
				"align-items:center;background-color: var(--color-bg-1);border-radius: 18px;bottom: 0;box-shadow: var(--shadow-2);cursor: pointer;display: flex;font-size: 0;height: 36px;justify-content: center;margin-top: 8px;width: 36px;";
			btn.innerHTML =
				"<svg width='32' height='32' fill='var(--color-text-3)' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36' style='color: var(--color-text-3);'><path fill-rule='evenodd' clip-rule='evenodd' d='M18.051782472841584,8.307068007308498 C12.516707606894524,8.307068007308498 8.029759537538956,12.794016076664168 8.029759537538956,18.329090942611256 C8.029759537538956,23.864165808558244 12.516707606894524,28.35111387791388 18.051782472841584,28.35111387791388 C23.586857338788583,28.35111387791388 28.073805408144114,23.864165808558244 28.073805408144114,18.329090942611256 C28.073805408144114,12.794016076664168 23.586857338788583,8.307068007308498 18.051782472841584,8.307068007308498 zM23.834408338773077,17.61746801229386 C22.83386098228989,18.76833881723545 21.278909714978113,19.148974338102818 19.914276208100574,18.711105577684705 L14.95773975158758,24.41098459125365 C14.429539010673908,25.017794841911893 13.510359392347201,25.079854981183725 12.903549141689044,24.552343797372888 S12.232610080449827,23.104963438132547 12.760121264260935,22.49815318747435 L17.723553291803697,16.792068159978093 C17.10777879880622,15.50604416284459 17.27051427511903,13.92075238300005 18.266234731880896,12.776087591985577 C19.208859291710244,11.690035154728026 20.647275408611392,11.292850263388228 21.953986118835438,11.621769001528975 L20.054945857116607,13.836626416431487 L20.676236806938302,15.643955583448678 L22.55321124136052,16.00873129094669 L24.457078402800576,13.788357419219931 C24.97286711586004,15.03921400409958 24.78323891252938,16.527278232418247 23.834408338773077,17.61746801229386 z'></path></svg>";
			btn.onclick = function() {
				if (document.getElementById("downloaderSettingPage")) {
					set.close();
				} else {
					set.create()
				}
			}
			btn.onmouseover = function() {
				btn.children[0].setAttribute("fill", "var(--color-text-1)");
			}
			btn.onmouseleave = function() {
				btn.children[0].setAttribute("fill", "var(--color-text-3)");
			}
			box.appendChild(btn);
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
		clickFn: function() {
			loginPopupFlag = "wait";
			console.log("用户登录中...");
		},
		login: function() {
			var ClassArray = ["SSV0NEur", "tk3nuzSi", "wlsrobSg", "OPE8io-h", "ib4UcBI5",
				"q6zgm94p k-vFWw3W FDOWibym scan__button",
				"q6zgm94p k-vFWw3W FDOWibym video-comment-high__contain__btn"
			];
			var BtnArray = [];
			var LoginBtnArray, LoginBtn;
			for (let i = 0; i < ClassArray.length; i++) {
				LoginBtnArray = document.getElementsByClassName(ClassArray[i]);
				if (LoginBtnArray[0]) {
					BtnArray.push(ClassArray[i]);
				}
			}
			for (let i = 0; i < BtnArray.length; i++) {
				LoginBtn = document.getElementsByClassName(BtnArray[i]);
				for (let j = 0; j < LoginBtn.length; j++) {
					if (LoginBtn[j] && LoginBtn[j].name !== "newLoginBtn") {
						LoginBtn[j].addEventListener("click", init.clickFn);
						LoginBtn[j].name = "newLoginBtn";
					}
				}
			}
		},
		edge: function() {
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
		},
		live: function() {
			if (set.get("undisturbWatch") === "auto") {
				var btn = document.getElementById("undisturbWatchBtn");
				if (btn) {
					btn.click();
				} else {
					console.log("沉浸式观看按钮丢失，自动进入沉浸式观看模式失败");
				}
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
			if(typeof jQuery!=="function"){
				var msg="部分功能可能无法在此浏览器上使用\n桌面端建议使用edge浏览器，移动端建议使用kiwi浏览器";
				console.log(msg);
				alert(msg);
				return false;
			}
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
			if(typeof jQuery!=="function"){
				var msg="部分功能可能无法在此浏览器上使用\n桌面端建议使用edge浏览器，移动端建议使用kiwi浏览器";
				console.log(msg);
				alert(msg);
				return false;
			}
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
						var videoID = presentObj.getElementsByClassName(
							"xgplayer-icon content-wrapper hasMarginRight")[0].href;
						videoID = videoID.split("?")[0].split("video/")[1].replace("/", "");
						if (videoID && btnObj.getAttribute("data-id") !== videoID) {
							createBtn.swiper.change(BtnList, videoID, presentObj);
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
				var beforeBtn = document.getElementsByClassName("VPz4-306")[0];
				var undisturbWatchBtn = createBtn.live.undisturb();
				var downloadBtn = createBtn.live.download();
				beforeBtn.parentElement.insertBefore(undisturbWatchBtn, beforeBtn);
				beforeBtn.parentElement.insertBefore(downloadBtn, beforeBtn);
				init.live();
				console.log("抖音视频下载器(" + Page + "页)启动");
			}
		},
		download: function() {
			init.main();
			var data = tools.parseUrl();
			if (data[1]) {
				var videoOBJ = document.getElementsByTagName('video')[0];
				videoOBJ.pause();
				var a = document.createElement("a");
				a.href = videoOBJ.children[0].src;
				a.download = data[0] + ".mp4";
				a.click();
			}
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
					set.init();
					createBtn.set();
					init.edge();
					this.home();
					this.judge();
					break;
				case "recommend":
					set.init();
					createBtn.set();
					init.edge();
					this.recommend();
					this.judge();
					break;
				case "follow":
					set.init();
					createBtn.set();
					init.edge();
					this.follow();
					this.judge();
					break;
				case "hot":
					set.init();
					createBtn.set();
					init.edge();
					this.hot();
					this.judge();
					break;
				case "channel":
					set.init();
					createBtn.set();
					init.edge();
					this.channel();
					this.judge();
					break;
				case "detail":
					set.init();
					createBtn.set();
					this.detail();
					this.judge();
					break;
				case "search":
					set.init();
					createBtn.set();
					this.search();
					this.judge();
					break;
				case "livehome":
					set.init("live");
					createBtn.set();
					init.edge();
					this.livehome();
					this.judge();
					break;
				case "livedetail":
					set.init("live");
					createBtn.set();
					this.livedetail();
					this.judge();
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
			if (loginPopupFlag === true) {
				if (PopObj && PopObj.style.display !== "none") {
					PopObj.style.display = "none";
					HideNum += 1;
				}
			} else {
				if (PopObj && PopObj.style.display === "none") {
					PopObj.style.display = "";
				}
				if (!PopObj && loginPopupFlag === "wait") {
					loginPopupFlag = true;
					console.log("用户取消登录或登录成功");
				}
			}
			//控制台输出相关信息
			if (HideNum > 0) {
				console.log(currentPage + "页检测到" + HideNum + "个非必要弹窗,已隐藏!");
			}
		},
		jump: function() {
			var currentUA = tools.checkUA();
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
		},
		judge: function() {
			switch (set.get("loginPopup")) {
				case "auto":
					if (currentPage === "follow") {
						loginPopupFlag = false;
					} else {
						loginPopupFlag = true;
						init.login();
					}
					break;
				case "hide":
					loginPopupFlag = true;
					break;
				case "display":
					loginPopupFlag = false;
					break;
			}
		}
	}

	var set = {
		baseData: {
			"video": {
				"fileName": "whole",
				"diyFileName": "",
				"download": "auto",
				"loginPopup": "auto"
			},
			"live": {
				"undisturbWatch": "manual",
				"hideList": {
					"searchBar": true,
					"liveCategory": true,
					"relativeLive": true,
					"buttomMessage": true,
					"chatWindow": false,
					"edgeTool": false
				},
				"loginPopup": "auto",
				"download": "default"
			}
		},
		baseOpt: {
			"video": {
				data: [{
					"name": "当前版本",
					"type": "text",
					"key": "version",
					"value": "v1.30"
				}, {
					"name": "视频文件名",
					"type": "choice",
					"key": "fileName",
					"value": [{
						"name": "完整(默认)",
						"key": "whole",
						"description": "文件自动重命名为：视频名@作者名.mp4"
					}, {
						"name": "仅视频名",
						"key": "videoName",
						"description": "文件自动重命名为：视频名.mp4"
					}, {
						"name": "数字ID",
						"key": "id",
						"description": "视频下载地址中，紧跟着主机名的那一串形似md5的数字为视频id。文件自动重命名为：id.mp4"
					}]
				}, {
					"name": "视频下载",
					"type": "choice",
					"key": "download",
					"value": [{
						"name": "自动下载",
						"key": "auto",
						"description": "脚本调用下载程序，并自动重命名"
					}, {
						"name": "手动下载",
						"key": "manual",
						"description": "需手动下载视频，且手动下载模式下，将关闭自动重命名。下载时需手动更改文件名"
					}]
				}, {
					"name": "登录弹窗",
					"type": "choice",
					"key": "loginPopup",
					"value": [{
						"name": "自动管理",
						"key": "auto",
						"description": "自动识别场景，根据不同场合选择是否屏蔽登录弹窗"
					}, {
						"name": "直接屏蔽",
						"key": "hide",
						"description": "遇到登录弹窗，直接屏蔽"
					}, {
						"name": "不屏蔽",
						"key": "display",
						"description": "遇到登录弹窗，不进行任何操作"
					}]
				}, {
					"name": "反馈建议",
					"type": "text",
					"key": "feedback",
					"value": "<a style='text-decoration:none;' href='https://greasyfork.org/zh-CN/scripts/431344/feedback' target='_blank'>点击前往反馈</a>"
				}, {
					"name": "更新日志",
					"type": "text",
					"key": "updateLog",
					"value": "<a style='text-decoration:none;' href='https://github.com/IcedWatermelonJuice/Douyin-Video-Downloader#更新日志' target='_blank'>点击前往查看</a>"
				}]
			},
			"live": {
				data: [{
					"name": "当前版本",
					"type": "text",
					"key": "version",
					"value": "v1.30"
				}, {
					"name": "沉浸观看",
					"type": "choice",
					"key": "undisturbWatch",
					"value": [{
						"name": "自动启动",
						"key": "auto",
						"description": "进入直播间后自动进入沉浸式观看模式，屏蔽不必要的内容"
					}, {
						"name": "手动启动",
						"key": "manual",
						"description": "需手动点击沉浸式观看按钮，从而屏蔽不必要的内容"
					}]
				}, {
					"name": "屏蔽列表",
					"type": "check",
					"key": "hideList",
					"value": [{
						"name": "顶部搜索",
						"key": "searchBar",
						"description": "位于页面顶部的抖音LOGO、搜索栏、登录图标等"
					}, {
						"name": "直播分类",
						"key": "liveCategory",
						"description": "位于页面顶部的直播分类导航栏"
					}, {
						"name": "相关直播",
						"key": "relativeLive",
						"description": "位于页面底部的相关直播模块"
					}, {
						"name": "底部信息",
						"key": "buttomMessage",
						"description": "位于页面底部的网站信息、相关链接等"
					}, {
						"name": "聊天窗口",
						"key": "chatWindow",
						"description": "位于直播窗口边上的聊天窗口。隐藏聊天窗口不影响直播窗口正常播放弹幕"
					}, {
						"name": "侧边工具",
						"key": "edgeTool",
						"description": "位于页面右下角的工具栏（包括脚本设置入口）"
					}]
				}, {
					"name": "登录弹窗",
					"type": "choice",
					"key": "loginPopup",
					"value": [{
						"name": "自动管理",
						"key": "auto",
						"description": "自动识别场景，根据不同场合选择是否屏蔽登录弹窗"
					}, {
						"name": "直接屏蔽",
						"key": "hide",
						"description": "遇到登录弹窗，直接屏蔽"
					}, {
						"name": "不屏蔽",
						"key": "display",
						"description": "遇到登录弹窗，不进行任何操作"
					}]
				}, {
					"name": "提取地址",
					"type": "choice",
					"key": "download",
					"value": [{
						"name": "默认地址",
						"key": "default",
						"description": "提取当前直播间画面采用的推流地址。一般情况下，抖音直播推流都为m3u8，少部分为flv。flv延迟一般比m3u8低一点点"
					}, {
						"name": "m3u8地址",
						"key": "m3u8",
						"description": "提取m3u8格式直播原画画质的推流地址。m3u8格式视频播放比较方便，但是第三方播放器播放播放直播，一般情况下延迟比官方直播间还要长几秒"
					}, {
						"name": "flv地址",
						"key": "flv",
						"description": "提取flv格式直播原画画质的推流地址。使用第三方播放器播放直播，一般情况下延迟比官方直播间还要短几秒（ps：一般直播视频从主播到用户那里都会有延迟）"
					}]
				}, {
					"name": "反馈建议",
					"type": "text",
					"key": "feedback",
					"value": "<a style='text-decoration:none;' href='https://greasyfork.org/zh-CN/scripts/431344/feedback' target='_blank'>点击前往反馈</a>"
				}, {
					"name": "更新日志",
					"type": "text",
					"key": "updateLog",
					"value": "<a style='text-decoration:none;' href='https://github.com/IcedWatermelonJuice/Douyin-Video-Downloader#更新日志' target='_blank'>点击前往查看</a>"
				}]
			}
		},
		data: {},
		opt: {},
		get: function(key) {
			if (key) {
				return this.data[key];
			} else {
				return this.data;
			}
		},
		edit: function(key, value) {
			this.data[key] = value;
			console.log(key + ":" + value);
		},
		save: function(data) {
			data = JSON.stringify(data);
			try {
				JSON.parse(data); //确保data是JSON字符串
			} catch (e) {
				return false;
			}
			localStorage.setItem("downloaderSettingData", data);
		},
		init: function(type) {
			if (type === "live") {
				this.data = tools.cloneJSON(this.baseData.live);
				this.opt = tools.cloneJSON(this.baseOpt.live);
			} else {
				this.data = tools.cloneJSON(this.baseData.video);
				this.opt = tools.cloneJSON(this.baseOpt.video);
			}
			var localData = localStorage.getItem("downloaderSettingData");
			var newData;
			if (localData) {
				localData = JSON.parse(localData);
				this.data = tools.extendJSON(set.get(), localData);
			} else {
				this.save(this.data);
			}
		},
		reset: function() {
			var backupData;
			if (/livehome|livedetail/i.test(currentPage)) {
				backupData = set.baseData.live;
			} else {
				backupData = set.baseData.video;
			}
			set.data = tools.cloneJSON(backupData);
			set.close();
			set.create();
		},
		apply: function() {
			var msg = "正在保存中\n应用设置需重载当前页面,是否继续应用设置?\n";
			if (confirm(msg)) {
				var opts = document.getElementsByClassName("downloaderSettingPage-opt");
				var obj, key, value;
				for (let i = 0; i < opts.length; i++) {
					if (opts[i].getAttribute("opt-type") === "choice") {
						obj = opts[i].getElementsByTagName("select")[0];
						key = obj.parentElement.getAttribute("opt-key");
						value = false;
						for (let i = 0; i < obj.childElementCount; i++) {
							if (obj.value === obj.children[i].value) {
								value = obj.children[i].getAttribute("choice-key");
								break;
							}
						}
						if (key && value) {
							set.edit(key, value);
						}
					} else if (opts[i].getAttribute("opt-type") === "check") {
						obj = opts[i].getElementsByTagName("form")[0];
						key = obj.parentElement.getAttribute("opt-key");
						obj = obj.getElementsByTagName("input");
						value = set.get(key);
						for (let i = 0; i < obj.length; i++) {
							value[obj[i].value] = obj[i].checked;
						}
						if (key && value) {
							set.edit(key, value);
						}
					}
				}
				set.save(set.get());
				location.reload();
			}
		},
		close: function() {
			document.getElementById("downloaderSettingPage").remove();
		},
		create: function() {
			var page = document.createElement("div");
			var box = document.createElement("div");
			page.id = "downloaderSettingPage";
			var bodyWidth = document.body.clientWidth;
			var bodyHeight = document.body.clientHeight;
			var pageWidth = bodyWidth - 40;
			var pageHeight = bodyHeight - 40;
			pageWidth = 360 < pageWidth ? 360 : pageWidth;
			pageHeight = 360 < pageHeight ? 360 : pageHeight;
			var pageLeft = (bodyWidth - pageWidth) / 2;
			var pageTop = (bodyHeight - pageHeight) / 2;
			page.style = "width:" + pageWidth + "px;height:" + pageHeight +
				"px;position:fixed;left:" +
				pageLeft + "px;top:" + pageTop +
				"px;background:var(--color-page-bg);border-radius:20px;font-size:14px;color:var(--color-text-0-hover);border:3px solid var(--color-navigation-bg);z-index:999;";
			box.style =
				"width:calc(100% - 40px);height:calc(100% - 40px);margin:20px;";
			box.appendChild(set.createHead());
			box.appendChild(set.createBody());
			box.appendChild(set.createFoot());
			page.appendChild(box);
			document.body.appendChild(page);
		},
		createHead: function() {
			var head = document.createElement("div");
			head.id = "downloaderSettingPage-head";
			head.style =
				"width:100%;height:30px;margin-bottom:20px;text-align:center;font-size:20px";
			head.innerText = "抖音视频下载器脚本设置";
			return head;
		},
		createBody: function() {
			var body = document.createElement("div");
			body.id = "downloaderSettingPage-body";
			body.style = "width:100%;height:calc(100% - 100px);overflow:auto auto;";
			var data = this.opt.data;
			for (let i in data) {
				body.appendChild(this.createOpt(data[i]));
			}
			var msg = document.createElement("div");
			msg.innerHTML =
				"更多功能，请关注后续版本！<br>欢迎大家在“<a href='https://greasyfork.org/zh-CN/scripts/431344' target='_blank'>油叉</a>”或“<a href='https://github.com/IcedWatermelonJuice/Douyin-Video-Downloader' target='_blank'>gayhub</a>”上反馈建议。";
			msg.style = "color:red;text-decoration:none;";
			body.appendChild(msg);
			return body;
		},
		createFoot: function() {
			var foot = document.createElement("div");
			foot.id = "downloaderSettingPage-foot";
			foot.style = "width:100%;height:30px;margin-top:20px;";
			foot.appendChild(this.createBtn("reset"));
			foot.appendChild(this.createBtn("apply"));
			foot.appendChild(this.createBtn("close"));
			return foot;
		},
		createOpt: function(data) {
			var opt = document.createElement("div");
			var title = document.createElement("div");
			var content = document.createElement("div");
			opt.setAttribute("class", "downloaderSettingPage-opt");
			opt.setAttribute("opt-type", data.type);
			title.style = "width:100px;margin:0 8px 8px 0;display:inline-block";
			title.innerText = data.name;
			content.style = "width:100px;margin:0 0 8px 0;display:inline-block;";
			if (data.type === "text") {
				content.setAttribute("opt-key", data.key);
				content.innerHTML = data.value;
			} else if (data.type === "choice") {
				content.setAttribute("opt-key", data.key);
				var choice = data.value;
				var choiceValue = set.get(data.key);
				var choiceHtml =
					"<select style='width: 100%;color: var(--color-text-0-hover);border-color: var(--color-text-0-hover);background: var(--color-page-bg);'>";
				for (let i in choice) {
					choiceHtml += "<option choice-key='" + choice[i].key + "'";
					if (choiceValue === choice[i].key) {
						choiceHtml += " selected='selected'";
					}
					choiceHtml += " title='" + choice[i].description + "'>" + choice[i].name +
						"</option>";
				}
				choiceHtml += "</select>";
				content.innerHTML = choiceHtml;
			} else if (data.type === "check") {
				content.style.width = "100%";
				content.style.display = "";
				content.setAttribute("opt-key", data.key);
				var check = data.value;
				var checkValue = set.get(data.key);
				var checkHtml =
					"<form style='width: 100%;color: var(--color-text-0-hover);'>";
				for (let i in check) {
					checkHtml += "<div style='display:inline-block;margin-right:5px;' title='" + check[i]
						.description + "'><input type='checkbox' value='" + check[i].key + "'";
					if (checkValue[check[i].key]) {
						checkHtml += " checked='checked'";
					}
					checkHtml += "><span>" + check[i].name + "</span></div>";
				}
				checkHtml += "</form>";
				content.innerHTML = checkHtml;
			} else {
				return null;
			}
			opt.appendChild(title);
			opt.appendChild(content);
			return opt;
		},
		createBtn: function(type) {
			var text, fn, btn;
			switch (type) {
				case "reset":
					text = "重置数据";
					fn = set.reset;
					break;
				case "apply":
					text = "保存并应用";
					fn = set.apply;
					break;
				case "close":
					text = "关闭设置";
					fn = set.close;
					break;
				default:
					break;
			}
			if (text && fn) {
				btn = document.createElement("span");
				btn.id = "downloaderSettingPage-btn-" + type;
				btn.setAttribute("class", "downloaderSettingPage-btn");
				var box = document.createElement("div");
				box.style =
					"margin-right: 12px; padding: 0px 10px; cursor: pointer; border: thin solid var(--color-text-0-hover); border-radius: 10px;display:inline-block";
				box.innerText = text;
				box.onclick = fn;
				btn.appendChild(box);
			}
			return btn;
		}
	}

	var Timer = -1;
	var Page = "others";
	var currentPage = "others";
	var pastUA = "";
	var loginPopupFlag = true;
	var checkTimer = setInterval(function() {
		currentPage = tools.identifySite();
		main.jump();
		main.popup();
		if (Page !== currentPage) {
			if (Page !== "others") {
				console.log("页面切换(上一页为" + Page + "页)");
			}
			main.match();
		}
	}, 200);
	console.log("抖音视频下载器(URL监听与弹窗检测)启动,定时器(id:" + checkTimer + ")开启");
})();
