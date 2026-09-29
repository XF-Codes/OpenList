import { JSXElement } from "solid-js"
import { Box } from "@hope-ui/solid"

/**
 * 主内容容器。
 *
 * 复刻参考稿的 `.nav-inner` / `.app-container`：最大宽度 1440px、两侧 32px
 * 内边距并居中。侧栏在 `Body` 的网格里真实占位，不再用 fixed + 人工左边距模拟，
 * 这样顶栏、侧栏、主内容和页脚能落在同一条视觉基线上。
 *
 * `fullWidth` 由顶栏传入（顶栏自带毛玻璃底、要铺满整宽），当前布局下与默认一致，
 * 保留该 prop 是为了不改调用方签名。
 */
export const Container = (props: { children: JSXElement; fullWidth?: boolean }) => {
  return (
    <Box w="$full" maxW="1440px" mx="auto" px="32px">
      {props.children}
    </Box>
  )
}
