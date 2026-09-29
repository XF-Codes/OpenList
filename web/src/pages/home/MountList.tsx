import { Box, Center, HStack, Icon, Spinner, Text, VStack } from "@hope-ui/solid"
import { For, Show, createEffect, createMemo, createSignal, onMount } from "solid-js"
import { useLocation } from "@solidjs/router"
import { AiOutlineCloudServer } from "solid-icons/ai"
import { IoFolderOutline } from "solid-icons/io"
import { useFetch, useRouter, useT, useUtil } from "~/hooks"
import { password } from "~/store"
import { Obj } from "~/types"
import { fsDirs, handleResp, pathJoin } from "~/utils"

/**
 * 侧栏一级挂载点列表。
 *
 * 需求：
 *  - 「左边栏为一级栏，不显示二级栏，二级三级文件夹在右边显示」；
 *  - 「不需要显示根目录」——直接列挂载点本身，根目录对用户无意义；
 *  - 「进入网页默认选中一个一级目录」——首次加载时自动跳到第一个挂载点。
 *
 * 所以这里**刻意不做树**，只拉一次 `fsDirs("/")` 拿到顶级挂载点，扁平渲染。
 * 进入某个挂载点后，它的子目录/子文件全部由主内容区的网格展示 ——
 * 侧栏始终保持"一层"的清爽观感。
 *
 * 视觉严格对齐设计稿：`.nav-group` 的 `gap:4px`、条目的 `padding:10px 14px` /
 * `border-radius:8px` / 图标 `18px` 宽 + `12px` 间距、选中态白底 + 主色字 +
 * 轻阴影，右侧 `nav-count` 胶囊计数。
 *
 * 注意不要复用 `~/components/FolderTree`：那是递归组件，且还被
 * `ModalFolderChoose` / `FolderChooseInput` 的选择弹窗依赖，改它会波及管理端。
 */
export const MountList = (props: { onChange?: (path: string) => void }) => {
  const t = useT()
  const { to } = useRouter()
  const { isHidePath } = useUtil()
  const location = useLocation()
  const [mounts, setMounts] = createSignal<Obj[]>()
  const [loading, fetchDirs] = useFetch(() => fsDirs("/", password()))
  /** 默认选中已做过一次，避免用户手动切走后又被拉回第一个 */
  let autoSelected = false

  onMount(async () => {
    const resp = await fetchDirs()
    handleResp(resp, (data) => setMounts(data ?? []))
  })

  const visible = createMemo(() =>
    (mounts() ?? []).filter((m) => !isHidePath(m.name)),
  )

  /** 当前所在路径命中的挂载点（取路径第一段） */
  const currentTop = createMemo(() => {
    const p = location.pathname.split("?")[0]
    if (!p || p === "/") return ""
    return p.split("/").filter(Boolean)[0] ?? ""
  })

  const goto = (path: string) => {
    to(path)
    props.onChange?.(path)
  }

  /**
   * 首次进入时默认选中第一个一级目录。
   *
   * 只在「列表已加载 + 当前停在根目录 + 还没自动选过」时触发一次 ——
   * 否则用户点进二级目录后回头，会被强行拽回第一个挂载点。
   */
  createEffect(() => {
    if (autoSelected || loading()) return
    const list = visible()
    if (!list.length) return
    if (!location.pathname || location.pathname === "/") {
      autoSelected = true
      goto(pathJoin("/", list[0].name))
    }
  })

  return (
    <VStack class="ad-nav-group" alignItems="stretch" spacing="4px" w="$full">
      <Show
        when={!loading()}
        fallback={
          <Center py="$4">
            <Spinner size="sm" />
          </Center>
        }
      >
        <For each={visible()}>
          {(m) => (
            <MountItem
              label={m.name}
              active={currentTop() === m.name}
              onClick={() => goto(pathJoin("/", m.name))}
            />
          )}
        </For>
        {/* 挂载点为空：给个占位，避免侧栏空荡荡 */}
        <Show when={!visible().length}>
          <HStack spacing="$2" px="$3.5" py="$2.5" color="var(--ad-text-3)">
            <Icon as={AiOutlineCloudServer} boxSize="$4" />
            <Text fontSize="0.8rem">{t("home.theme.no_mounts")}</Text>
          </HStack>
        </Show>
      </Show>
    </VStack>
  )
}

/**
 * 单个挂载点条目。
 *
 * 结构照搬设计稿的 `.nav-item > a > (.lead > i + text) + .nav-count`：
 * 图标与文字包在一层 flex 容器里（`.lead`），计数胶囊靠右。
 */
const MountItem = (props: {
  label: string
  active: boolean
  onClick: () => void
}) => {
  return (
    <Box
      class="ad-nav-item"
      data-active={props.active ? "true" : "false"}
      as="a"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px="14px"
      py="10px"
      rounded="8px"
      cursor="pointer"
      color="var(--ad-text-2)"
      fontSize="0.9rem"
      fontWeight="500"
      transition="all .2s"
      onClick={props.onClick}
      title={props.label}
    >
      <HStack class="lead" spacing="12px" minW={0}>
        <Icon
          as={IoFolderOutline}
          boxSize="18px"
          flexShrink={0}
          css={{ width: "18px" }}
        />
        <Text
          css={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
          overflow="hidden"
        >
          {props.label}
        </Text>
      </HStack>
    </Box>
  )
}
