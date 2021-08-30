# 🎯抖音视频下载器(Douyin Video Downloader)
* 本脚本能在pc版抖音"首页"、"推荐页"、"视频详情页"、其他"频道页"添加下载按钮,点击下载无水印视频
* 
* 本脚本能展开页面左侧侧栏所有选项,屏蔽"满意度调查"弹窗
* 
* 本脚本为纯原生JS脚本,未使用特殊接口,因此原理上支持所有拥有脚本管理器的电脑或移动端浏览器,如:PC端Chrome、Edge等;移动端Kiwi、Yandex、Via等
* 
* 本脚本仅供学习交流使用,切勿商用!

# 📖使用流程
1、电脑浏览器打开抖音web版,移动端浏览器请先更改浏览器ua为电脑ua再打开网页(https://www.douyin.com)

2、不同页面，下载图标位置不同:

(1)推荐页:点击右下角三个点,选择下载

(2)频道页:每个视频作者名边上都有下载按钮,点击下载;或者也可以点击视频进入详情页,参考(3)下载

(3)详情页:视频名下方，分享按钮右侧为下载按钮

(4)直播页:暂不支持直播下载

# 💊问题解答
Q1:没有出现“下载”图标

A1:按照以下方法解决

(1)请确认本脚本已启用(尽量使用主流脚本管理器,如Tampermonkey、Violentmonkey)

(2)关闭广告拦截插件,脚本可能被广告插件误拦截

(3)多刷新下页面,有时候就很迷,油猴匹配不到脚本,需要二次刷新才能使用

(4)使用Edge浏览器与Tampermonkey

(5)如果都没用,按F12将控制台信息以及页面窗口截图通过greasyfork或github、gitee、邮箱发给我

<br>

Q2:点击下载按钮无反应

A2:非详情页和推荐页:点击视频进入详情页;详情页或推荐页:右键下载按钮的文字部分,手机用户长按文字部分(注意:是文字不是LOGO)，选择复制链接，将链接粘贴到第三方下载器下载

<br>


Q3:跳转的页面无法自动下载

A3:复制跳转后的网页的URL(xxx.douyinvod.com/xxxxx)，粘贴到第三方下载器下载

<br>


Q4:首页或频道页部分按钮鼠标移上去是禁用标志(红色圆圈与一条斜杠)、手机用户点击无反应

A4:该视频为直播间而不是视频资源，无法下载

# 🔔特别声明
1、本人业余时间开发，并非专业开发者，代码质量可能不佳。如果有大佬想帮忙优化，可以联系我QwQ

2、本脚本随缘更新。若无bug或业余时间不足,可能没时间更新脚本

3、测试用平台:Windows系统Edge浏览器Tampermonkey脚本管理器

4、再次提醒:本脚本仅供学习交流使用!切勿商用!切勿商用!切勿商用!

# 📪联系方式
* 邮箱：gem_xl@petalmail.com

# 🌎相关地址
* Greasyfork:https://greasyfork.org/scripts/431344
* Github仓库:https://github.com/IcedWatermelonJuice/Douyin-Video-Downloader
* Gitee 仓库:https://gitee.com/gem_xl/Douyin-Video-Downloader

# 🔍参考截图
* 从左往右(从上往下)依次为:推荐页、详情页、频道页
![推荐页](https://user-images.githubusercontent.com/87429695/130788855-0a08659d-bce2-412c-ae24-bff209fbb33d.png)
![详情页](https://user-images.githubusercontent.com/87429695/130788874-be412740-a314-4616-8a86-5e9fad8b9889.png)
![频道](https://user-images.githubusercontent.com/87429695/130845639-ad4afe36-f594-4d3b-9994-bd5e2881a7b8.png)

