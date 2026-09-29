import { HStack, VStack } from "@hope-ui/solid"
import { useT } from "~/hooks"
import { getSetting } from "~/store"
import { Container } from "./Container"

/**
 * 页脚。
 *
 * 复刻设计稿的 `.footer-bar`：最大宽度 1440px 居中、左右 32px 内边距、
 * 两端对齐 —— 左边是「状态胶囊」（绿点 + 文案），右边是版本号。
 * 后台 / 登录入口在顶栏的用户菜单里，页脚不再重复放链接。
 */
export const Footer = () => {
  const t = useT()
  /**
   * 后端 `version` 是一长串（形如
   * `9e2b6de1-dirty (Commit: 9e2b6de1) - Frontend: 4.2.6 - Build at: ...`），
   * 直接铺在页脚上会撑爆版面。设计稿那里只放一个短版本号，所以取 `Frontend:` 段。
   */
  const shortVersion = () => {
    const v = getSetting("version")
    const m = /Frontend:\s*([^\s-]+)/.exec(v)
    if (m) return m[1]
    return v.split(" (")[0] || ""
  }
  return (
    <VStack class="footer" w="$full" py="$4">
      <Container>
        <HStack
          class="ad-footer-bar"
          w="$full"
          justifyContent="space-between"
          alignItems="center"
          fontSize="0.78rem"
          color="var(--ad-text-3)"
        >
          <HStack class="ad-status-pill" spacing="6px" alignItems="center">
            <span class="ad-dot-online" />
            <span>{t("home.theme.status_ok")}</span>
          </HStack>
          <span class="ad-footer-version">
            {getSetting("site_title") || "OpenList"} · v{shortVersion()}
          </span>
        </HStack>
      </Container>
    </VStack>
  )
}
