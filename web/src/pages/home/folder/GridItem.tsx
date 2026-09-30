import { Center, VStack, Icon, Text, Box, HStack } from "@hope-ui/solid"
import { Motion } from "solid-motionone"
import { useContextMenu } from "solid-contextmenu"
import { batch, Show, createMemo } from "solid-js"
import { CenterLoading, LinkWithPush, ImageWithError } from "~/components"
import { usePath, useRouter, useUtil } from "~/hooks"
import { checkboxOpen, selectIndex } from "~/store"
import { ObjType, StoreObj } from "~/types"
import { bus, formatDate, getFileSize } from "~/utils"
import { getIconByObj } from "~/utils/icon"
import { getCardColor } from "~/utils/card_color"
import { isFromRowActions, ItemCheckbox, useSelectWithMouse } from "./helper"
import { RowActions } from "./RowActions"

/**
 * 网格卡片。
 *
 * 对齐设计稿 `.file-card` 的结构：
 *   .card-top    → 图标色块（44×44 / 12px 圆角），左对齐
 *   .file-title  → 文件名（0.9rem / 600 / 单行省略）
 *   .file-info   → 大小 • 时间（0.78rem / #94a3b8）
 *
 * 网格视图不渲染类型角标 —— 图标色块已经表达了类型，再叠一个角标反而杂乱
 * （角标只在列表视图由 `ListItem` 负责）。
 */
export const GridItem = (props: { obj: StoreObj; index: number }) => {
  const { isHide } = useUtil()
  if (isHide(props.obj)) {
    return null
  }
  const { setPathAs } = usePath()
  const cardColor = createMemo(() =>
    getCardColor(props.obj.type, props.obj.name),
  )
  /** 图标尺寸：设计稿 `.file-card .type-icon` 是 44×44 的色块、字号 1.15rem */
  const ICON_SIZE = "1.15rem"
  /** 图标块尺寸：设计稿固定 44px 方 */
  const BLOCK_SIZE = 44

  const objIcon = (
    <Icon color={cardColor().fg} boxSize={ICON_SIZE} as={getIconByObj(props.obj)} />
  )
  const { show } = useContextMenu({ id: 1 })
  const { pushHref, to } = useRouter()
  const { openWithDoubleClick, toggleWithClick, restoreSelectionCache } =
    useSelectWithMouse()

  /** 选中该卡片后在当前坐标弹出右键菜单（与列表行的行为一致） */
  const openMenu = (e: MouseEvent) => {
    batch(() => selectIndex(props.index, true, true))
    show(e, { props: props.obj })
  }

  /** 点缩略图打开图库（仅图片类型，且不在多选拖拽中） */
  const handleImageClick = (e: MouseEvent) => {
    if (props.obj.type !== ObjType.IMAGE) return
    if (e.ctrlKey || e.metaKey || e.shiftKey) return
    if (!restoreSelectionCache()) return
    bus.emit("gallery", props.obj.name)
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%",
      }}
    >
      <VStack
        classList={{ selected: !!props.obj.selected }}
        class="grid-item viselect-item"
        data-index={props.index}
        w="$full"
        p="16px"
        spacing="12px"
        rounded="14px"
        transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        as={LinkWithPush}
        href={props.obj.name}
        cursor={
          openWithDoubleClick() || toggleWithClick() ? "default" : "pointer"
        }
        alignItems="flex-start"
        on:dblclick={() => {
          if (!openWithDoubleClick()) return
          selectIndex(props.index, true, true)
          to(pushHref(props.obj.name))
        }}
        on:click={(e: MouseEvent) => {
          e.preventDefault()
          // 同 ListItem：卡片右上角的操作组走 Solid 委托的 onClick，
          // 比这里的原生 on:click 晚，必须挡掉，否则点图标会直接进目录。
          if (isFromRowActions(e)) return
          if (openWithDoubleClick()) return
          if (e.ctrlKey || e.metaKey || e.shiftKey) return
          if (!restoreSelectionCache()) return
          if (toggleWithClick())
            return selectIndex(props.index, !props.obj.selected)
          to(pushHref(props.obj.name))
        }}
        onMouseEnter={() => {
          setPathAs(props.obj.name, props.obj.is_dir, true)
        }}
        onContextMenu={(e: MouseEvent) => {
          e.preventDefault()
          openMenu(e)
        }}
      >
        <Box
          class="card-top ad-card-top"
          w="$full"
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Show
            when={props.obj.thumb}
            fallback={
              <Center
                class="ad-type-icon"
                boxSize={`${BLOCK_SIZE}px`}
                rounded="12px"
                // 设计稿的色块是「极浅底 + 饱和前景」，不是渐变。
                style={{ background: cardColor().bg, color: cardColor().fg }}
                flexShrink={0}
              >
                {objIcon}
              </Center>
            }
          >
            {(thumb) => (
              <Box
                class="ad-thumb"
                boxSize={`${BLOCK_SIZE}px`}
                rounded="12px"
                overflow="hidden"
                cursor={props.obj.type === ObjType.IMAGE ? "pointer" : "inherit"}
                on:click={handleImageClick}
              >
                <ImageWithError
                  maxH="$full"
                  maxW="$full"
                  rounded="12px"
                  fallback={<CenterLoading size="sm" />}
                  fallbackErr={objIcon}
                  src={thumb()}
                  loading="lazy"
                />
              </Box>
            )}
          </Show>
          {/* 右上角：多选模式下是复选框，否则是悬停才出现的操作组（设计稿 .hover-actions） */}
          <Show
            when={checkboxOpen()}
            fallback={
              <RowActions
                obj={props.obj}
                index={props.index}
                onMenu={openMenu}
                limit={2}
                floating
              />
            }
          >
            <ItemCheckbox
              on:mousedown={(e: MouseEvent) => e.stopPropagation()}
              on:click={(e: MouseEvent) => e.stopPropagation()}
              checked={props.obj.selected}
              onChange={(e: any) => selectIndex(props.index, e.target.checked)}
            />
          </Show>
        </Box>

        {/* 文件名 */}
        <Text
          class="file-title"
          w="$full"
          fontSize="0.9rem"
          fontWeight="$semibold"
          color="#1e293b"
          css={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={props.obj.name}
        >
          {props.obj.name}
        </Text>

        {/* 大小 • 时间 */}
        <HStack
          class="file-info"
          w="$full"
          fontSize="0.78rem"
          color="#94a3b8"
          spacing="6px"
          css={{ whiteSpace: "nowrap" }}
          overflow="hidden"
        >
          {/* 文件夹不显示大小（后端给的是 0，显示出来是误导） */}
          <Show when={!props.obj.is_dir}>
            <Text as="span">{getFileSize(props.obj.size)}</Text>
            <Text as="span" color="#cbd5e1">
              •
            </Text>
          </Show>
          <Text
            as="span"
            overflow="hidden"
            css={{ textOverflow: "ellipsis" }}
            title={props.obj.modified}
          >
            {formatDate(props.obj.modified)}
          </Text>
        </HStack>
      </VStack>
    </Motion.div>
  )
}
