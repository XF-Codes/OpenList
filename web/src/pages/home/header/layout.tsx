import {
  Center,
  HStack,
  IconButton,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@hope-ui/solid"
import { changeColor } from "seemly"
import { BsGridFill, BsCardImage } from "solid-icons/bs"
import { FaSolidListUl } from "solid-icons/fa"
import { Switch, Match, For } from "solid-js"
import { Dynamic } from "solid-js/web"
import { useT } from "~/hooks"
import { getMainColor, LayoutType, layout, setLayout } from "~/store"

const layouts = {
  list: FaSolidListUl,
  grid: BsGridFill,
  image: BsCardImage,
} as const

export const Layout = () => {
  const t = useT()
  return (
    <Menu>
      <MenuTrigger
        as={IconButton}
        color={getMainColor()}
        bgColor={changeColor(getMainColor(), { alpha: 0.15 })}
        _hover={{
          bgColor: changeColor(getMainColor(), { alpha: 0.2 }),
        }}
        aria-label={t("global.switch_layout")}
        compact
        size="lg"
        icon={
          <Switch>
            <Match when={layout() === "list"}>
              <FaSolidListUl />
            </Match>
            <Match when={layout() === "grid"}>
              <BsGridFill />
            </Match>
            <Match when={layout() === "image"}>
              <BsCardImage />
            </Match>
          </Switch>
        }
      ></MenuTrigger>
      <MenuContent>
        <For each={Object.entries(layouts)}>
          {(item) => (
            <MenuItem
              icon={<Dynamic component={item[1]} />}
              onSelect={() => {
                setLayout(item[0] as LayoutType)
              }}
            >
              {t(`home.layouts.${item[0]}`)}
            </MenuItem>
          )}
        </For>
      </MenuContent>
    </Menu>
  )
}

/**
 * 主题模式的分段式视图切换，对应设计稿的 `.view-toggle`。
 *
 * 设计稿只有「网格 / 列表」两档，本应用多一个「图片」布局，所以直接按
 * `layouts` 的键渲染三档 —— 结构与观感一致，只是多一个选项。
 * 经典模式仍用上面的下拉菜单（`Layout`），避免改变老用户的交互习惯。
 */
export const ViewToggle = () => {
  const t = useT()
  return (
    <HStack
      class="ad-view-toggle"
      spacing="0"
      p="2px"
      rounded="8px"
      bgColor="rgba(255,255,255,.78)"
      border="1px solid rgba(226,232,240,.8)"
      flexShrink={0}
    >
      <For each={Object.entries(layouts)}>
        {(item) => (
          <Center
            as="button"
            type="button"
            class="ad-toggle-opt"
            data-active={layout() === item[0] ? "true" : "false"}
            title={t(`home.layouts.${item[0]}`)}
            aria-label={t(`home.layouts.${item[0]}`)}
            onClick={() => setLayout(item[0] as LayoutType)}
          >
            <Dynamic component={item[1]} />
          </Center>
        )}
      </For>
    </HStack>
  )
}
