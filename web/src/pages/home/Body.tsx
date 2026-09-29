import { Box, VStack } from "@hope-ui/solid"
import { Nav } from "./Nav"
import { Obj } from "./Obj"
import { Readme } from "./Readme"
import { Container } from "./Container"
import { Sidebar } from "./Sidebar"

/**
 * 主舞台。
 *
 * 不撑高：内容多高页面就多高，页脚才会紧跟在内容后面
 * （设计稿里主舞台也是内容高度，靠 body 的 min-height 把页脚推到视口底部）。
 */
const MainStage = () => (
  <VStack
    class="body ad-main-stage"
    mt="0"
    py="0"
    px="0"
    w="$full"
    gap="20px"
    alignItems="stretch"
    minW={0}
  >
    <Readme files={["header.md", "top.md", "index.md"]} fromMeta="header" />
    <Nav />
    <Obj />
    <Readme
      files={["readme.md", "footer.md", "bottom.md"]}
      fromMeta="readme"
    />
  </VStack>
)

/**
 * 页面骨架：左侧 240px 侧栏 + 右侧主舞台。
 *
 * 侧栏是真实的一列（网格占位），不是 `fixed` 浮层 —— 这样顶栏、侧栏、主内容和
 * 页脚能落在同一条视觉基线上。
 */
export const Body = () => {
  return (
    <Container>
      <Box
        class="ad-app-container"
        w="$full"
        my="24px"
        display="grid"
        gridTemplateColumns="240px minmax(0, 1fr)"
        gap="32px"
        alignItems="stretch"
      >
        <Sidebar />
        <MainStage />
      </Box>
    </Container>
  )
}
