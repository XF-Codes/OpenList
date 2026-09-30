import { Checkbox, hope } from "@hope-ui/solid"
import { createEffect, onCleanup } from "solid-js"
import { useContextMenu } from "solid-contextmenu"
import SelectionArea from "@viselect/vanilla"
import {
  checkboxOpen,
  haveSelected,
  local,
  objStore,
  oneChecked,
  selectAll,
  selectedObjs,
  selectIndex,
} from "~/store"
import { isMobile } from "~/utils/compatibility"
import { StoreObj } from "~/types"

let selectedCache: StoreObj[] | null = null

/**
 * 主题模式表格的列宽，对齐设计稿 `.file-table` 的列比例。
 *
 * 名称列是弹性列（`flex:1`），其余固定宽度；表头（`List.tsx`）与数据行
 * （`ListItem.tsx`）共用同一组数值，所以两行的列位置天然对齐，不需要 `<table>`。
 * 放在 `helper.ts` 里是为了避免 `List ↔ ListItem` 互相 import 形成循环依赖。
 */
export const AD_COL = {
  check: "40px",
  type: "110px",
  modified: "150px",
  size: "110px",
  actions: "140px",
} as const

/**
 * 判断这次点击是否落在行尾/卡片角上的操作组（`.ad-row-actions`）里。
 *
 * 为什么需要它：操作按钮用的是 Solid 的 `onClick`，而 Solid 会把 `onClick`
 * **委托到 `document`** 上统一派发；整行/整卡片的外层却用的是原生 `on:click`
 * （`on:` 前缀不走委托，直接 `addEventListener` 挂在 `<a>`/`<div>` 上）。
 * 冒泡顺序是「按钮 → 外层 → … → document」，于是**外层先执行**：
 * 点「更多」会先触发 `to(pushHref(...))` 跳转，按钮处理器里那句
 * `stopPropagation()` 等到 document 阶段才跑，已经拦不住了。
 * 现象就是「三个点点了没反应，反而进了那个目录/文件」。
 *
 * 所以在外层点击处理的开头挡一下。注意外层仍需先 `preventDefault()` ——
 * 否则 `<a href>` 会走浏览器默认跳转。
 */
export const isFromRowActions = (e: MouseEvent) =>
  !!(e.target as Element | null)?.closest?.(".ad-row-actions")

export function useSelectWithMouse() {
  const isMouseSupported = () => !isMobile && checkboxOpen()
  const openWithDoubleClick = () =>
    isMouseSupported() && local["open_item_on_checkbox"] === "dblclick"
  const toggleWithClick = () =>
    isMouseSupported() &&
    local["open_item_on_checkbox"] === "disable_while_checked" &&
    haveSelected()

  const saveSelectionCache = () => {
    selectedCache = selectedObjs()
  }

  const restoreSelectionCache = () => {
    if (selectedCache === null) return false
    for (let i = 0; i < objStore.objs.length; ++i) {
      selectIndex(i, selectedCache.indexOf(objStore.objs[i]) >= 0)
    }
    return true
  }

  const clearSelectionCache = () => {
    selectedCache = null
  }

  const registerSelectContainer = () => {
    createEffect(() => {
      if (!isMouseSupported()) {
        const area = document.querySelector(".viselect-container")
        area?.addEventListener("mousedown", saveSelectionCache)
        onCleanup(() =>
          area?.removeEventListener("mousedown", saveSelectionCache),
        )
        return
      }
      const selection = new SelectionArea({
        selectionAreaClass: "viselect-selection-area",
        startAreas: [".viselect-container"],
        boundaries: [".viselect-container"],
        selectables: [".viselect-item"],
      })
      selection.on("beforestart", () => {
        saveSelectionCache()
        selection.clearSelection(true, true)
        selection.select(".viselect-item.selected", true)
      })
      selection.on("start", ({ event }) => {
        const ev = event as MouseEvent
        if (ev.type === "mousemove") {
          clearSelectionCache()
        }
        if (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
          selectAll(false)
          selection.clearSelection(true)
        }
      })
      selection.on(
        "move",
        ({
          store: {
            changed: { added, removed },
          },
        }) => {
          for (const el of added) {
            selectIndex(Number(el.getAttribute("data-index")), true)
          }
          for (const el of removed) {
            selectIndex(Number(el.getAttribute("data-index")), false)
          }
        },
      )
      onCleanup(() => selection.destroy())
    })
  }

  const { show } = useContextMenu({ id: 1 })

  const captureContentMenu = (e: MouseEvent) => {
    e.preventDefault()

    if (haveSelected() && !oneChecked()) {
      const $target = e.target as Element
      const $selectedItem = $target.closest(".viselect-item")
      const index = Number($selectedItem?.getAttribute("data-index"))

      const isClickOnContainer = Number.isNaN(index)
      const isClickOnSelectedItems = () => !!objStore.objs[index].selected
      if (isClickOnContainer || !isClickOnSelectedItems()) return

      e.stopPropagation()
      show(e, { props: objStore.obj })
    }
  }

  return {
    isMouseSupported,
    openWithDoubleClick,
    toggleWithClick,
    restoreSelectionCache,
    registerSelectContainer,
    captureContentMenu,
  }
}

export const ItemCheckbox = hope(Checkbox, {
  baseStyle: {
    // expand the range of click
    _before: {
      content: "",
      pos: "absolute",
      top: -10,
      right: -2,
      bottom: -10,
      left: -10,
    },
  },
})
