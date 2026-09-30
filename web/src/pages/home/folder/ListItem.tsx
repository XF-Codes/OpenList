import { Box, Center, HStack, Icon, Text } from "@hope-ui/solid"
import { Motion } from "solid-motionone"
import { useContextMenu } from "solid-contextmenu"
import { batch, Show } from "solid-js"
import { LinkWithPush } from "~/components"
import { usePath, useRouter, useT, useUtil } from "~/hooks"
import { checkboxOpen, selectIndex, OrderBy } from "~/store"
import { ObjType, StoreObj } from "~/types"
import { bus, formatDate, getFileSize, showDiskUsage, toReadableUsage } from "~/utils"
import { getIconByObj } from "~/utils/icon"
import { getCardColor } from "~/utils/card_color"
import { ext } from "~/utils/path"
import { AD_COL, isFromRowActions, ItemCheckbox, useSelectWithMouse } from "./helper"
import { RowActions } from "./RowActions"

export interface Col {
  name: OrderBy
  textAlign: "left" | "right"
  w: any
}

/**
 * 经典列宽表。
 *
 * 列表视图已经改成设计稿的 `AD_COL` 固定列宽（见 `helper.ts`），这份 `cols`
 * 保留下来是给**压缩包预览页**（`pages/home/previews/archive.tsx`）复用同一套
 * 列宽比例的，那里仍按百分比排版。
 */
export const cols: Col[] = [
  { name: "name", textAlign: "left", w: { "@initial": "76%", "@md": "50%" } },
  { name: "size", textAlign: "right", w: { "@initial": "24%", "@md": "17%" } },
  { name: "modified", textAlign: "right", w: { "@initial": 0, "@md": "33%" } },
]

/**
 * 列表行。
 *
 * 对齐设计稿 `.file-table`：
 * 复选框 / 名称（32px 彩色图标块 + 文件名）/ 类型角标 / 修改时间 / 大小 / 操作。
 * 列宽与表头共用 `AD_COL`，因此天然对齐。
 */
export const ListItem = (props: { obj: StoreObj; index: number }) => {
  const { isHide } = useUtil()
  if (isHide(props.obj)) {
    return null
  }
  const { setPathAs } = usePath()
  const { show } = useContextMenu({ id: 1 })
  const { pushHref, to } = useRouter()
  const { openWithDoubleClick, toggleWithClick, restoreSelectionCache } =
    useSelectWithMouse()
  const t = useT()
  const cardColor = () => getCardColor(props.obj.type, props.obj.name)
  /**
   * 类型角标文案（设计稿的 `.tag-badge`）。
   *
   * 设计稿里目录写「目录」，文件写**大写扩展名**（PNG / FLAC / GO / PDF / MP4），
   * 所以这里优先取扩展名；没有扩展名（或无扩展名概念）时才回落到语义分类的
   * i18n 文案，避免出现一个空白角标。
   */
  const tagLabel = () => {
    if (!props.obj.is_dir) {
      const e = ext(props.obj.name)
      if (e) return e.toUpperCase()
    }
    const k = `home.theme.tags.${cardColor().key}`
    const v = t(k)
    return v === k ? cardColor().key : v
  }

  /** 大小列：优先展示存储用量，其次文件体积；目录不显示（后端给的是 0，会误导） */
  const sizeText = () => {
    const d = props.obj.mount_details
    if (showDiskUsage(d)) return toReadableUsage(d!)
    if (props.obj.is_dir) return ""
    return getFileSize(props.obj.size)
  }

  const openMenu = (e: MouseEvent) => {
    batch(() => selectIndex(props.index, true, true))
    show(e, { props: props.obj })
  }

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%",
      }}
    >
      <HStack
        classList={{ selected: !!props.obj.selected }}
        class="list-item viselect-item"
        data-index={props.index}
        w="$full"
        p="12px 18px"
        spacing="0"
        alignItems="center"
        rounded="0"
        transition="background-color .15s"
        _hover={{ bgColor: "rgba(255,255,255,.95)" }}
        as={LinkWithPush}
        href={props.obj.name}
        cursor={
          openWithDoubleClick() || toggleWithClick() ? "default" : "pointer"
        }
        bgColor={props.obj.selected ? "rgba(255,255,255,.95)" : undefined}
        borderBottom="1px solid rgba(226,232,240,.4)"
        on:dblclick={() => {
          if (!openWithDoubleClick()) return
          selectIndex(props.index, true, true)
          to(pushHref(props.obj.name))
        }}
        on:click={(e: MouseEvent) => {
          e.preventDefault()
          // 操作组（行尾图标）自带 onClick，但 Solid 的 onClick 委托到 document，
          // 比这里挂在 <a> 上的原生 on:click 晚一拍 —— 不挡掉的话点「更多」会先跳转。
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
        <Show when={checkboxOpen()}>
          <Center w={AD_COL.check} flexShrink={0} justifyContent="flex-start">
            <ItemCheckbox
              on:mousedown={(e: MouseEvent) => e.stopPropagation()}
              on:click={(e: MouseEvent) => e.stopPropagation()}
              checked={props.obj.selected}
              onChange={(e: any) => selectIndex(props.index, e.target.checked)}
            />
          </Center>
        </Show>
        <HStack
          class="ad-name-cell"
          flex="1"
          minW={0}
          spacing="12px"
          alignItems="center"
          pr="12px"
        >
          <Center
            class="ad-list-icon"
            boxSize="32px"
            rounded="8px"
            flexShrink={0}
            style={{ background: cardColor().bg, color: cardColor().fg }}
          >
            <Icon
              boxSize="0.9rem"
              as={getIconByObj(props.obj)}
              cursor={props.obj.type !== ObjType.IMAGE ? "inherit" : "pointer"}
              on:click={(e: MouseEvent) => {
                if (props.obj.type !== ObjType.IMAGE) return
                if (e.ctrlKey || e.metaKey || e.shiftKey) return
                if (!restoreSelectionCache()) return
                bus.emit("gallery", props.obj.name)
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </Center>
          <Text
            class="ad-name-title"
            as="span"
            css={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={props.obj.name}
          >
            {props.obj.name}
          </Text>
        </HStack>
        {/* 类型列（`ad-col-optional`：≤1100px 收起，见 theme.ts） */}
        <Box as="span" w={AD_COL.type} flexShrink={0} class="ad-col-optional">
          <Box as="span" class="ad-tag-badge">
            {tagLabel()}
          </Box>
        </Box>
        <Text
          class="ad-cell ad-modified ad-col-optional"
          as="span"
          w={AD_COL.modified}
          flexShrink={0}
          css={{ whiteSpace: "nowrap" }}
        >
          {formatDate(props.obj.modified)}
        </Text>
        <Text
          class="ad-cell ad-size"
          as="span"
          w={AD_COL.size}
          flexShrink={0}
          textAlign="right"
          css={{ whiteSpace: "nowrap" }}
        >
          {sizeText()}
        </Text>
        <RowActions obj={props.obj} index={props.index} onMenu={openMenu} />
      </HStack>
    </Motion.div>
  )
}
