import { Center, HStack, Icon, VStack, Text } from "@hope-ui/solid"
import { batch, createEffect, createSignal, For, Show, onMount } from "solid-js"
import { BsArrowDownShort, BsArrowUpShort } from "solid-icons/bs"
import { useT, useRouter } from "~/hooks"
import {
  allChecked,
  checkboxOpen,
  countMsg,
  isIndeterminate,
  local,
  objStore,
  OrderBy,
  selectAll,
  selectedMsg,
  sortObjs,
} from "~/store"
import { ListItem } from "./ListItem"
import { AD_COL, ItemCheckbox, useSelectWithMouse } from "./helper"
import { bus } from "~/utils"

export interface SortState {
  orderBy: string
  reverse: boolean
}

const SORT_KEY_PREFIX = "dir_sort_"

export function saveSortState(dir: string, state: SortState) {
  try {
    localStorage.setItem(`${SORT_KEY_PREFIX}${dir}`, JSON.stringify(state))
  } catch (err) {
    console.warn("failed to save sort config:", err)
  }
}

export function loadSortState(dir: string): SortState | null {
  try {
    const item = localStorage.getItem(`${SORT_KEY_PREFIX}${dir}`)
    if (!item) return null
    return JSON.parse(item) as SortState
  } catch (err) {
    console.warn("failed to read sort config:", err)
    return null
  }
}

export const ListTitle = (props: {
  sortCallback: (orderBy: OrderBy, reverse?: boolean) => void
  disableCheckbox?: boolean
  initialOrder?: OrderBy
  initialReverse?: boolean
}) => {
  const t = useT()
  const { pathname } = useRouter()

  const [orderBy, setOrderBy] = createSignal<OrderBy | undefined>(
    props.initialOrder,
  )
  const [reverse, setReverse] = createSignal(props.initialReverse ?? false)

  createEffect(() => {
    if (props.initialOrder !== undefined) {
      setOrderBy(props.initialOrder)
      setReverse(props.initialReverse ?? false)
    }
  })

  createEffect(() => {
    if (orderBy()) {
      saveSortState(pathname(), { orderBy: orderBy()!, reverse: reverse() })
      props.sortCallback(orderBy()!, reverse())
    }
  })

  const toggleSort = (name: OrderBy) => {
    if (name === orderBy()) {
      setReverse(!reverse())
    } else {
      batch(() => {
        setOrderBy(name)
        setReverse(false)
      })
    }
  }

  /**
   * 表头单元格：小号大写 + 字间距，对齐设计稿 `.file-table th`。
   *
   * `hideMobile` 给「类型 / 修改时间」两列加上 `ad-col-optional` ——
   * 这两列在 ≤1100px 就收起（不是等到 900px，否则 901px 时名称列只剩 17px，
   * 实测过），详见 theme.ts。
   * 可排序列额外带 `.ad-th-sortable`，用于复刻设计稿的 `th.sortable:hover`。
   */
  const thProps = (
    name?: OrderBy,
    align: "left" | "right" = "left",
    hideMobile = false,
  ) => ({
    class: [
      "ad-th",
      name ? "ad-th-sortable" : "",
      hideMobile ? "ad-col-optional" : "",
    ]
      .filter(Boolean)
      .join(" "),
    fontWeight: "600",
    textAlign: align as any,
    cursor: name ? "pointer" : "default",
    userSelect: "none" as const,
    onClick: name ? () => toggleSort(name) : undefined,
  })

  // 表头：复选框 / 名称 / 类型 / 修改时间 / 大小 / 操作
  return (
    <HStack
      class="title ad-table-head"
      w="$full"
      px="18px"
      py="12px"
      spacing="0"
      alignItems="center"
      borderBottom="1px solid rgba(226,232,240,.8)"
    >
      <Show when={!props.disableCheckbox && checkboxOpen()}>
        <Center w={AD_COL.check} flexShrink={0} justifyContent="flex-start">
          <ItemCheckbox
            checked={allChecked()}
            indeterminate={isIndeterminate()}
            onChange={(e: any) => {
              selectAll(e.target.checked as boolean)
            }}
          />
        </Center>
      </Show>
      <HStack flex="1" minW={0} pr="12px">
        <Text {...thProps("name")}>
          {selectedMsg() ? selectedMsg() : t("home.obj.name")}
          {/*
            设计稿在「名称」后跟一个排序指示箭头（`.file-table th i`）。
            未排序时压暗成中性提示，排序中则按 reverse 显示上/下箭头。
          */}
          <Show when={!selectedMsg()}>
            <Icon
              class="ad-sort-icon"
              as={reverse() ? BsArrowDownShort : BsArrowUpShort}
              boxSize="0.7rem"
              ml="4px"
              verticalAlign="middle"
              opacity={orderBy() === "name" ? 1 : 0.45}
            />
          </Show>
        </Text>
      </HStack>
      <Text {...thProps(undefined, "left", true)} w={AD_COL.type} flexShrink={0}>
        {t("home.obj.type")}
      </Text>
      <Text
        {...thProps("modified", "left", true)}
        w={AD_COL.modified}
        flexShrink={0}
      >
        {t("home.obj.modified")}
      </Text>
      {/* `ad-th-size` / `ad-th-actions` 供窄屏媒体查询把列宽收窄
          （大小 110→58，操作 140→32），否则表头会比数据行宽、两行错位。
          注意「大小」是可排序列，覆盖 class 时必须保留 `ad-th-sortable`。 */}
      <Text
        {...thProps("size", "right")}
        class="ad-th ad-th-sortable ad-th-size"
        w={AD_COL.size}
        flexShrink={0}
      >
        {t("home.obj.size")}
      </Text>
      <Text
        {...thProps(undefined, "right")}
        class="ad-th ad-th-actions"
        w={AD_COL.actions}
        flexShrink={0}
      >
        {t("home.obj.actions")}
      </Text>
    </HStack>
  )
}

const ListLayout = () => {
  const { pathname } = useRouter()

  const [initialOrder, setInitialOrder] = createSignal<OrderBy>()
  const [initialReverse, setInitialReverse] = createSignal(false)

  const { registerSelectContainer, captureContentMenu } = useSelectWithMouse()
  registerSelectContainer()

  onMount(() => {
    const saved = loadSortState(pathname())
    if (saved) {
      setInitialOrder(saved.orderBy as OrderBy)
      setInitialReverse(saved.reverse)
      sortObjs(saved.orderBy as OrderBy, saved.reverse)
    }
  })

  const onDragOver = (e: DragEvent) => {
    const items = Array.from(e.dataTransfer?.items ?? [])
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === "file") {
        bus.emit("tool", "upload")
        e.preventDefault()
        break
      }
    }
  }

  return (
    <VStack
      onDragOver={onDragOver}
      oncapture:contextmenu={captureContentMenu}
      class="list viselect-container"
      w="$full"
      spacing="$1"
    >
      <ListTitle
        sortCallback={sortObjs}
        initialOrder={initialOrder()}
        initialReverse={initialReverse()}
      />
      <For each={objStore.objs}>
        {(obj, i) => {
          return <ListItem obj={obj} index={i()} />
        }}
      </For>
      <Show when={local["show_count_msg"] === "visible"}>
        <Text size="sm" color="$neutral11">
          {countMsg()}
        </Text>
      </Show>
    </VStack>
  )
}

export default ListLayout
