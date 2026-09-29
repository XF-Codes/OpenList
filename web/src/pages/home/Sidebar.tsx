import { Box } from "@hope-ui/solid"
import { MountList } from "./MountList"

/**
 * 侧栏 —— 常驻的一级挂载点列表。
 *
 * 对齐设计稿的 `aside.sidebar`：本身不套卡片底，条目直接浮在页面底色上。
 * 它是 `Body` 网格里真实的一列（240px），用 `sticky` 吸顶而不是 `fixed` ——
 * 后者会脱离网格、在宽屏下跑到窗口最左边，和主内容错位。
 */
export function Sidebar() {
  return (
    <Box
      as="aside"
      class="ad-sidebar"
      w="$full"
      alignSelf="start"
      pos="sticky"
      // 顶栏（py 12px + 内容 40px + 1px 描边 ≈ 65px）下方留 24px 呼吸，
      // 与 `Body` 网格的 my=24px 对齐。改顶栏高度时同步这个值。
      top="89px"
      // 高度跟随内容（挂载点少时侧栏就短，页脚不会被顶到屏幕外），
      // 但不超过视口 —— 超出时由内部的 .ad-nav-scroll 自己滚动。
      maxH="calc(100vh - 113px)"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Box class="ad-nav-scroll" flex="1" minH={0} overflow="auto">
        <MountList />
      </Box>
    </Box>
  )
}
