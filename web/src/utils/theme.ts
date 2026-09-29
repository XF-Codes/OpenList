/**
 * 整站外观主题（唯一外观，不可配置）。
 *
 * 设计基准是仓库根目录的 `build/index.html`（「Aether Drive」稿），配色 token
 * 直接照搬：
 *   --bg-base        #f4f6fb          页面底色（浅灰蓝）
 *   --accent         #6366f1          主色（靛蓝）
 *   --accent-gradient linear-gradient(135deg, #6366f1, #a855f7)   品牌渐变
 *   --text-primary   #1e293b / secondary #64748b / tertiary #94a3b8
 *   --surface-glass  rgba(255,255,255,.78)
 *   --border-subtle  rgba(226,232,240,.8)
 * 两个环境光斑（ambient glow）：右上 #e0e7ff→#ddd6fe、左下 #fce7f3→#e0f2fe。
 *
 * 实现方式：本文件把配色 token **写进 CSS 变量**挂到 `<html>` 上，组件只用
 * `var(--ad-*)` 取值。好处是不必把配置层层透传进组件。
 *
 * ⚠️ 这里**不再读取任何后端 setting**。早期版本这套主题由 `theme_*` 一组
 * setting 驱动（开关 / 渐变端点 / 圆角 / 光斑 / 网络字体 / 侧栏风格 / 标语），
 * 但那些项既互相耦合又长期无人使用（其中 6 项前端从未读取过），因此已整体
 * 移除：主题成为唯一外观，所有取值改为下面的编译期常量。
 *
 * 变量名用 `--ad-*`（Aether Drive）而不是 `--hz-*`，是为了和旧版粉紫主题的
 * 类名/属性彻底切开，避免残留样式串味。
 */

const ROOT = () => document.documentElement

/** 设计稿的配色常量 */
const ACCENT = "#6366f1"
const ACCENT_PURPLE = "#a855f7"
const BG_BASE = "#f4f6fb"
const CARD_RADIUS = "14px"

/**
 * 主题字体栈。
 *
 * 设计稿用的是 Plus Jakarta Sans（拉丁）+ Noto Sans SC（中文）——
 * 前者字形几何感强，是这套「Aether Drive」观感的重要组成。
 */
const FONT_STACK =
  "'Plus Jakarta Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const FONT_LINK_ID = "ad-theme-font"

/**
 * 注入 Google Fonts 链接。
 *
 * 用 `display=swap`，字体没下载完也不会阻塞首屏（先回落系统字体，就绪后替换）。
 * 内网 / 无外网环境下这个请求会失败，此时自动回落到 `FONT_STACK` 后面的系统字体，
 * 不影响可用性。
 */
const loadThemeFont = () => {
  if (document.getElementById(FONT_LINK_ID)) return
  const pre1 = document.createElement("link")
  pre1.rel = "preconnect"
  pre1.href = "https://fonts.gstatic.com"
  pre1.crossOrigin = "anonymous"
  const link = document.createElement("link")
  link.id = FONT_LINK_ID
  link.rel = "stylesheet"
  link.href =
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap"
  document.head.append(pre1, link)
}

const FONT_OVERRIDE_ID = "ad-theme-font-override"

/**
 * 主题字体栈的强制覆盖。
 *
 * 基础样式里有一条 `html { font-family: <系统字体栈> !important }`
 * （见 `app/theme.ts` 的 `globalStyles`，用来压住 hope-ui 自带的字体），
 * 它带 `!important`，会盖掉主题那条普通规则 —— 结果是 `--ad-font` 设了也不生效。
 *
 * 这里直接注入一条同等级别、但选择器更具体的规则（`html[data-ad-theme="on"]`），
 * 靠特异性取胜。用 `<style>` 而不是 stitches 的 globalCss，是因为要写
 * 「带 `!important` 的 `var()`」，在 stitches 的值里表达容易踩坑。
 */
const applyFontOverride = () => {
  if (typeof document === "undefined") return
  if (document.getElementById(FONT_OVERRIDE_ID)) return
  const style = document.createElement("style")
  style.id = FONT_OVERRIDE_ID
  style.textContent =
    'html[data-ad-theme="on"],html[data-ad-theme="on"] body{font-family:var(--ad-font) !important}'
  document.head.append(style)
}

/**
 * 把主题写入 CSS 变量与 `<html>` 属性。
 *
 * 幂等，可以在设置变更或路由切换后重复调用。`app/theme.ts` 里所有主题规则都挂在
 * `html[data-ad-theme="on"]` 下，所以这个属性必须始终存在。
 */
export const applyTheme = () => {
  if (typeof document === "undefined") return
  const root = ROOT()

  root.style.setProperty("--ad-bg-base", BG_BASE)
  root.style.setProperty("--ad-accent", ACCENT)
  root.style.setProperty("--ad-accent-2", ACCENT_PURPLE)
  root.style.setProperty("--ad-radius", CARD_RADIUS)
  root.style.setProperty("--ad-font", FONT_STACK)

  root.setAttribute("data-ad-theme", "on")
  root.setAttribute("data-ad-orbs", "on")

  applyFontOverride()
  loadThemeFont()
}
