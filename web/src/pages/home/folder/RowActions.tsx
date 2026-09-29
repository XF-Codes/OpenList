import { Center, HStack, Icon } from "@hope-ui/solid"
import { createMemo, For } from "solid-js"
import { useCopyLink, useDownload, useRouter, useT } from "~/hooks"
import { objStore, selectIndex, userCan } from "~/store"
import { StoreObj } from "~/types"
import { bus } from "~/utils"
import { getCardColor } from "~/utils/card_color"
import {
  FaRegularCopy,
  FaRegularPenToSquare,
  FaSolidArrowDown,
  FaSolidEllipsis,
  FaSolidPlay,
  FaSolidShareNodes,
} from "solid-icons/fa"
import { AD_COL } from "./helper"

/**
 * 行/卡片的悬浮操作组，对应设计稿的 `.list-actions` / `.hover-actions`。
 *
 * 设计稿里操作图标是按类型变化的（文件夹是分享/重命名、音频是播放/下载…），
 * 这里沿用同一套编排，但把每个图标接到**真实**能力上：先选中该行，再触发对应的
 * 工具事件（与右键菜单走同一条链路），"更多" 则直接在当前坐标弹出右键菜单。
 *
 * `limit` 用于网格视图 —— 设计稿的 `.file-card` 只有两个图标位。
 */
export const RowActions = (props: {
  obj: StoreObj
  index: number
  onMenu: (e: MouseEvent) => void
  /** 最多显示几个（从尾部取，保证「更多」始终在），不传则全显示 */
  limit?: number
  /** 网格视图里操作组浮在卡片右上角，不占固定列宽 */
  floating?: boolean
}) => {
  const t = useT()
  const { to, pushHref, isShare } = useRouter()
  const { batchDownloadSelected } = useDownload()
  const { copySelectedRawLink } = useCopyLink()

  /** 选中该行（排他）后触发工具，复用右键菜单的链路 */
  const pick = (tool: string) => {
    selectIndex(props.index, true, true)
    bus.emit("tool", tool)
  }
  const selectOnly = () => selectIndex(props.index, true, true)

  const items = createMemo(() => {
    const o = props.obj
    const k = getCardColor(o.type, o.name).key
    const shareable = !isShare() && userCan("share")
    const writable = !isShare() && objStore.write
    const out: Array<{
      id: string
      icon: any
      tip: string
      run: (e: MouseEvent) => void
    }> = []

    if (o.is_dir) {
      if (shareable)
        out.push({
          id: "share",
          icon: FaSolidShareNodes,
          tip: t("home.toolbar.share"),
          run: () => pick("share"),
        })
      if (writable && userCan("rename"))
        out.push({
          id: "rename",
          icon: FaRegularPenToSquare,
          tip: t("home.toolbar.rename"),
          run: () => pick("rename"),
        })
    } else {
      if (k === "video" || k === "audio")
        out.push({
          id: "play",
          icon: FaSolidPlay,
          tip: t("home.theme.play"),
          run: () => to(pushHref(o.name)),
        })
      out.push({
        id: "download",
        icon: FaSolidArrowDown,
        tip: t("home.toolbar.download"),
        run: () => {
          selectOnly()
          batchDownloadSelected()
        },
      })
      if (k === "code" || k === "text") {
        out.push({
          id: "copy",
          icon: FaRegularCopy,
          tip: t("home.toolbar.copy_link"),
          run: () => {
            selectOnly()
            copySelectedRawLink(true)
          },
        })
      } else if (shareable) {
        out.push({
          id: "share",
          icon: FaSolidShareNodes,
          tip: t("home.toolbar.share"),
          run: () => pick("share"),
        })
      }
    }
    out.push({
      id: "more",
      icon: FaSolidEllipsis,
      tip: t("home.toolbar.more"),
      run: (e: MouseEvent) => props.onMenu(e),
    })
    // 网格视图只有两个图标位：保留最后的「更多」和它前面那个
    return props.limit && out.length > props.limit
      ? out.slice(out.length - props.limit)
      : out
  })

  return (
    <HStack
      class="ad-row-actions"
      w={props.floating ? undefined : AD_COL.actions}
      flexShrink={0}
      justifyContent="flex-end"
      // 设计稿里两处间距不同：列表行 `.list-actions { gap: 6px }`，
      // 卡片右上角 `.file-card .hover-actions { gap: 4px }`。
      spacing={props.floating ? "4px" : "6px"}
    >
      <For each={items()}>
        {(a) => (
          <Center
            as="button"
            type="button"
            class="ad-action-icon"
            title={a.tip}
            aria-label={a.tip}
            onClick={(e: MouseEvent) => {
              // 行/卡片本身是 <a>，必须阻止默认跳转与冒泡，否则点操作会进目录
              e.preventDefault()
              e.stopPropagation()
              a.run(e)
            }}
          >
            <Icon as={a.icon} />
          </Center>
        )}
      </For>
    </HStack>
  )
}
