import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbProps,
  BreadcrumbSeparator,
  HStack,
  Button,
  Icon,
} from "@hope-ui/solid"
import { Link } from "@solidjs/router"
import { createMemo, For, Show } from "solid-js"
import { usePath, useRouter, useT } from "~/hooks"
import { getSetting, local, objStore, State, userCan } from "~/store"
import { encodePath, hoverColor, joinBase, bus } from "~/utils"
import { AiOutlineCloudUpload } from "solid-icons/ai"
import { ViewToggle } from "./header/layout"

export const Nav = () => {
  const { pathname, isShare } = useRouter()
  const paths = createMemo(() => {
    if (!isShare()) {
      return ["", ...pathname().split("/").filter(Boolean)]
    } else {
      const p = pathname().split("/").filter(Boolean)
      return [`@s/${p[1] ?? ""}`, ...p.slice(2)]
    }
  })
  const t = useT()
  const { setPathAs } = usePath()

  const stickyProps = createMemo<BreadcrumbProps>(() => {
    const mask: BreadcrumbProps = {
      _after: {
        content: "",
        backgroundColor: "$background",
        position: "absolute",
        height: "100%",
        width: "99vw",
        zIndex: -1,
        transform: "translateX(-50%)",
        left: "50%",
        top: 0,
      },
    }

    switch (local["position_of_header_navbar"]) {
      case "only_navbar_sticky":
        return { ...mask, position: "sticky", zIndex: "$sticky", top: 0 }
      case "sticky":
        return { ...mask, position: "sticky", zIndex: "$sticky", top: 60 }
      default:
        return {
          _after: undefined,
          position: undefined,
          zIndex: undefined,
          top: undefined,
        }
    }
  })

  /** 是否可以上传（与右下角工具栏的判断保持一致） */
  const canUpload = createMemo(
    () =>
      !isShare() &&
      objStore.state === State.Folder &&
      !!objStore.write &&
      (userCan("write_content") || objStore.write_content_bypass),
  )

  const breadcrumb = (
    <Breadcrumb
      {...stickyProps}
      class="nav"
      w="$full"
      flex="1"
      fontSize="0.9rem"
    >
      <For each={paths()}>
        {(name, i) => {
          const isLast = createMemo(() => i() === paths().length - 1)
          const path = paths()
            .slice(0, i() + 1)
            .join("/")
          const href = encodePath(path)
          let text = () => name
          if (!isShare() && text() === "") {
            text = () => getSetting("home_icon") + t("manage.sidemenu.home")
          } else if (isShare() && i() === 0) {
            text = () => getSetting("share_icon") + t("manage.sidemenu.shares")
          }
          return (
            <BreadcrumbItem class="nav-item">
              <BreadcrumbLink
                class="nav-link"
                css={{
                  wordBreak: "break-all",
                }}
                color="unset"
                _hover={{ backgroundColor: hoverColor(), color: "unset" }}
                _active={{ transform: "scale(.95)", transition: "0.1s" }}
                cursor="pointer"
                p="$1"
                rounded="$lg"
                currentPage={isLast()}
                as={isLast() ? undefined : Link}
                href={joinBase(href)}
                onMouseEnter={() => setPathAs(path)}
              >
                {text()}
              </BreadcrumbLink>
              <Show when={!isLast()}>
                <BreadcrumbSeparator class="nav-separator" />
              </Show>
            </BreadcrumbItem>
          )
        }}
      </For>
    </Breadcrumb>
  )

  // 单行「面包屑 + 视图切换 + 上传」。
  // 视图切换用分段控件（设计稿的 `.view-toggle`），而不是下拉菜单。
  //
  // 布局切换按钮只在**这里**渲染一份 —— 顶部栏已移除，避免两处重复。
  return (
    <HStack w="$full" spacing="$3" alignItems="center" justifyContent="space-between">
      {breadcrumb}
      <HStack spacing="$3" flexShrink={0} alignItems="center">
        <ViewToggle />
        <Show when={canUpload()}>
          <Button
            class="ad-btn-primary"
            rounded="8px"
            size="sm"
            leftIcon={<Icon as={AiOutlineCloudUpload} />}
            onClick={() => bus.emit("tool", "upload")}
            transition="all .2s"
          >
            {t("home.theme.upload")}
          </Button>
        </Show>
      </HStack>
    </HStack>
  )
}
