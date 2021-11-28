<!DOCTYPE html>
<html>
	<head>
		<script src="js/lib/jquery.js"></script>
	</head>
	<body>
		<input type="text" id="value" />
		<span id="btn">解析</span>
		<span id="btn2">清屏</span>
		<div id="display"></div>
		<script>
			function getUrl() {
				var url = $("#value").val();
				url = url.replace(/\s+/g, "");
				if (/^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*$/i.test(url)) {
					console.log("待解析地址:" + url);
					url = url.replace(/http:\/\/|https:\/\//, "");
					url = url.split("/")[0];
					return url;
				}
				return false;
			}
			function dnsParse(name, type) {
				var dns = "http://dns.alidns.com/resolve?name=" + name + ".&type=" + type;
				console.log(dns);
				var data = [];
				$.ajax({
					url: dns,
					type: "get",
					dataType: "json",
					async: false,
					success: function(res) {
						res = res.Answer;
						if (!res) {
							return null;
						}
						for (let i in res) {
							if (res[i].type === parseInt(type)) {
								data.push(res[i].data)
							}
						}
					},
				})
				return data;
			}
			function displayResult(data) {
				var htmlData = "<ul>";
				for (let i in data) {
					htmlData += "<li><span>" + data[i].description + "</span><span> : </span><span><ol>";
					for (let j in data[i].result) {
						htmlData += "<li>" + data[i].result[j] + "</li>";
					}
					htmlData += "</ol></span></li>";
				}
				htmlData += "</ul>";
				$("#display").html(htmlData);
			}
			$("#btn").click(function() {
				var inputUrl = getUrl();
				if (!inputUrl) {
					alert("url错误");
					return false;
				}
				var data = [{
						"id": "1",
						"type": "A",
						"description": "IPv4 地址",
						"result": null
					},
					{
						"id": "2",
						"type": "NS",
						"description": "NS 记录",
						"result": null
					},
					{
						"id": "5",
						"type": "CNAME",
						"description": "域名 CNAME 记录",
						"result": null
					},
					{
						"id": "6",
						"type": "SOA",
						"description": "ZONE 的 SOA 记录",
						"result": null
					},
					{
						"id": "16",
						"type": "TXT",
						"description": "TXT 记录",
						"result": null
					},
					{
						"id": "28",
						"type": "AAAA",
						"description": "IPv6 地址",
						"result": null
					}
				];
				for (let i in data) {
					data[i].result = dnsParse(inputUrl, data[i].id);
				}
				console.log(data);
				displayResult(data);
			})
			$("#btn2").click(function() {
				$("#value").val("");
				$("#display").html("");
			})
		</script>
	</body>
</html>
