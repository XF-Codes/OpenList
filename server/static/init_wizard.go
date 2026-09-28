package static

import (
	"encoding/json"
	"html"
	"strings"

	"github.com/OpenListTeam/OpenList/v4/internal/conf"
)

// initWizardTemplate 是内嵌的安装向导页面模板。
//
// 为什么放在后端而不是前端：public/dist 是前端构建产物（.gitignore 已忽略），
// 换一个前端版本就会被整体覆盖；而后端要求「系统未初始化时必须先创建管理员」，
// 所以这个入口必须由后端自身保证存在。
//
// 模板占位符：
//
//	{{BASE_PATH}} — 站点根路径的 JSON 字面量，如 "" 或 "/openlist"
//	{{APP_NAME}}  — 程序名，用作站点名称输入框的默认值
const initWizardTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>安装向导 - {{APP_NAME}}</title>
<style>
  :root {
    --bg: #f4f5f7;
    --card: #ffffff;
    --text: #1f2329;
    --sub: #6b7280;
    --border: #e2e4e8;
    --primary: #3b82f6;
    --primary-hover: #2f6fdd;
    --danger: #dc2626;
    --ok: #16a34a;
    --input-bg: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #16171a;
      --card: #202226;
      --text: #e8eaed;
      --sub: #9aa0a6;
      --border: #34363c;
      --primary: #4f8ef7;
      --primary-hover: #6ba0f8;
      --danger: #f87171;
      --ok: #4ade80;
      --input-bg: #1a1b1f;
    }
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .card {
    width: 100%;
    max-width: 440px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 28px 26px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, .08);
  }
  h1 { font-size: 20px; line-height: 1.4; margin: 0 0 8px; }
  .desc { color: var(--sub); font-size: 13px; line-height: 1.7; margin: 0 0 24px; }
  .field { margin-bottom: 16px; }
  label { display: block; font-size: 13px; margin-bottom: 6px; }
  input[type=text], input[type=password] {
    width: 100%;
    height: 38px;
    padding: 0 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text);
    font-size: 14px;
    outline: none;
    transition: border-color .15s;
  }
  input:focus { border-color: var(--primary); }
  button {
    width: 100%;
    height: 40px;
    margin-top: 10px;
    border: none;
    border-radius: 8px;
    background: var(--primary);
    color: #fff;
    font-size: 15px;
    cursor: pointer;
    transition: background .15s;
  }
  button:hover:not(:disabled) { background: var(--primary-hover); }
  button:disabled { opacity: .6; cursor: not-allowed; }
  .msg { margin-top: 14px; font-size: 13px; line-height: 1.7; min-height: 20px; }
  .msg.error { color: var(--danger); }
  .msg.ok { color: var(--ok); }
</style>
</head>
<body>
<div class="card">
  <h1>安装向导</h1>
  <p class="desc">检测到系统尚未初始化。请创建管理员账号，完成后即可登录后台。</p>
  <form id="f" autocomplete="off">
    <div class="field">
      <label for="site">站点名称</label>
      <input id="site" type="text" value="{{APP_NAME}}" />
    </div>
    <div class="field">
      <label for="user">管理员用户名</label>
      <input id="user" type="text" placeholder="admin" />
    </div>
    <div class="field">
      <label for="pwd">管理员密码</label>
      <input id="pwd" type="password" placeholder="至少 4 位" />
    </div>
    <div class="field">
      <label for="pwd2">确认密码</label>
      <input id="pwd2" type="password" placeholder="再次输入密码" />
    </div>
    <button id="submit" type="submit">开始安装</button>
    <div id="msg" class="msg"></div>
  </form>
</div>
<script>
(function () {
  var BASE = {{BASE_PATH}};
  var msg = document.getElementById("msg");
  var btn = document.getElementById("submit");

  function setMsg(text, type) {
    msg.textContent = text || "";
    msg.className = "msg" + (type ? " " + type : "");
  }

  function api(url, body) {
    return fetch(BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () {
        throw new Error("服务端返回异常（HTTP " + r.status + "）");
      });
    });
  }

  document.getElementById("f").addEventListener("submit", function (e) {
    e.preventDefault();

    var site = document.getElementById("site").value.trim();
    var user = document.getElementById("user").value.trim();
    var pwd = document.getElementById("pwd").value;
    var pwd2 = document.getElementById("pwd2").value;

    if (!user) { setMsg("请输入管理员用户名", "error"); return; }
    if (pwd.length < 4) { setMsg("密码长度至少 4 位", "error"); return; }
    if (pwd !== pwd2) { setMsg("两次输入的密码不一致", "error"); return; }

    btn.disabled = true;
    setMsg("正在安装，请稍候…");

    api("/api/public/init/setup", {
      username: user,
      password: pwd,
      site_title: site
    }).then(function (res) {
      if (!res || res.code !== 200) {
        throw new Error((res && res.message) || "安装失败");
      }
      setMsg("安装成功，正在登录…", "ok");
      return api("/api/auth/login", { username: user, password: pwd });
    }).then(function (res) {
      if (res && res.code === 200 && res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", user);
      }
      setMsg("安装完成，正在进入首页…", "ok");
      setTimeout(function () {
        location.replace(BASE + "/");
      }, 400);
    }).catch(function (err) {
      btn.disabled = false;
      setMsg((err && err.message) || "安装失败，请重试", "error");
    });
  });
})();
</script>
</body>
</html>
`

// InitWizardPage 渲染安装向导页面。basePath 形如 "/" 或 "/openlist"。
func InitWizardPage(basePath string) string {
	base := strings.TrimSuffix(basePath, "/")
	baseJSON, err := json.Marshal(base)
	if err != nil {
		baseJSON = []byte(`""`)
	}
	page := strings.ReplaceAll(initWizardTemplate, "{{BASE_PATH}}", string(baseJSON))
	return strings.ReplaceAll(page, "{{APP_NAME}}", html.EscapeString(conf.AppName))
}
