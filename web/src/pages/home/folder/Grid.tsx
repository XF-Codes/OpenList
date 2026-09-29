import { Box, Grid, Text } from "@hope-ui/solid"
import { For, Show } from "solid-js"
import { GridItem } from "./GridItem"
import "lightgallery/css/lightgallery-bundle.css"
import { smartCountMsg, local, objStore } from "~/store"
import { useSelectWithMouse } from "./helper"

const GridLayout = () => {
  const { isMouseSupported, registerSelectContainer, captureContentMenu } =
    useSelectWithMouse()
  registerSelectContainer()
  /**
   * 列宽下限。
   *
   * 对齐设计稿的 `.file-grid`：`minmax(220px, 1fr)` + `gap:16px`。
   * 实际列宽由容器宽度反推（1088px 容器 → 4 列 → 每列 260px），220 只是下限。
   */
  const MIN_COL_WIDTH = 220
  return (
    <>
      <Show when={local["show_count_msg"] === "visible"}>
        <Box w="100%" textAlign="left" pl="$2">
          <Text size="sm" color="$neutral11">
            {smartCountMsg()}
          </Text>
        </Box>
      </Show>
      <Grid
        oncapture:contextmenu={captureContentMenu}
        class="viselect-container"
        w="$full"
        gap="16px"
        templateColumns={`repeat(auto-fill, minmax(${MIN_COL_WIDTH}px,1fr))`}
      >
        <For each={objStore.objs}>
          {(obj, i) => {
            return <GridItem obj={obj} index={i()} />
          }}
        </For>
      </Grid>
    </>
  )
}

export default GridLayout
