import {
  HStack,
  useColorModeValue,
  Image,
  Center,
  Icon,
  CenterProps,
  Box,
  Input,
  InputGroup,
  Text,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Divider,
  Avatar,
  Button,
} from "@hope-ui/solid"
import { Show, createSignal } from "solid-js"
import { getSetting, me, objStore, State } from "~/store"
import { BsSearch } from "solid-icons/bs"
import { CenterLoading, LinkWithBase } from "~/components"
import { Container } from "../Container"
import { bus } from "~/utils"
import { isMac } from "~/utils/compatibility"
import { useT, useRouter } from "~/hooks"
import { SwitchColorMode } from "~/components/SwitchColorMode"
import { SwitchLanguage } from "~/components/SwitchLanguage"
import { FiLogOut as LogOut, FiUser as UserIcon } from "solid-icons/fi"
import { IoLanguageOutline } from "solid-icons/io"

/**
 * 顶部栏。
 *
 * 复刻设计稿 `build/index.html` 的 `.nav-inner` ——
 * 左品牌（logo + 站名）、中间圆角胶囊搜索框（左放大镜 / 右 ⌘K 徽标）、
 * 右侧圆形玻璃按钮 + 头像，整条栏半透明毛玻璃 + 底部 1px 细描边。
 *
 * 设计稿的 header 是 `position: sticky; top: 0` + 毛玻璃，滚动时内容从下方穿过。
 * 这里强制开启 —— 否则顶栏会滚走，而侧栏仍按 top:89px 吸附，两者之间会露出一段空白。
 */
const STICKY_PROPS: CenterProps = {
  position: "sticky",
  zIndex: "$sticky",
  top: 0,
}

export const Header = () => {
  const logos = getSetting("logo").split("\n")
  const logo = useColorModeValue(logos[0], logos.pop())

  const t = useT()
  const [keyword, setKeyword] = createSignal("")

  /**
   * 搜索入口。
   *
   * 真正的搜索面板由 <Center /> 工具栏里的 Search 组件承载，这里只负责唤起它
   * （原版那个 Ctrl+K 徽标按钮也是这个事件）。索引未启用时后端没有搜索能力，
   * 所以公开链接也要做同样的开关判断，避免输入框点了没反应。
   */
  const searchEnabled = () => getSetting("search_index") !== "none"
  const submitSearch = () => bus.emit("tool", "search")

  /**
   * 顶栏主体 —— 对应设计稿的 `.nav-inner`。
   *
   * 最大宽度 1440px 与左右 32px 内边距由外层 `<Container>` 提供
   * （设计稿是 `.nav-inner { max-width:1440px; padding:12px 32px }`），
   * 这里只补垂直方向的 12px。
   */
  return (
    <Center {...STICKY_PROPS} bgColor="$background" class="header" w="$full">
      <Container fullWidth>
        <HStack
          py="12px"
          w="$full"
          spacing="$6"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* 左：品牌（logo + 站名），对应设计稿 .brand */}
          <HStack
            as={LinkWithBase}
            href="/"
            class="ad-brand"
            spacing="12px"
            alignItems="center"
            flexShrink={0}
            css={{ textDecoration: "none", color: "inherit" }}
          >
            <Image
              class="ad-brand-mark"
              src={logo()!}
              boxSize="34px"
              rounded="10px"
              objectFit="contain"
              flexShrink={0}
              fallback={<CenterLoading size="sm" />}
            />
            <Text
              class="ad-brand-name"
              fontSize="1.15rem"
              fontWeight="$bold"
              color="var(--ad-text-1)"
              css={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getSetting("site_title")}
            </Text>
          </HStack>

          {/*
            中：搜索框（设计稿 .search-wrapper / .search-input）。
            设计稿把它当作顶栏的固定组成，所以只要处于文件夹视图就渲染，
            不依赖 search_index —— 否则默认安装（search_index=none）下顶栏会缺一块，
            与设计稿不一致。索引未启用时输入框置灰并给出提示，避免点进去没有反应。
          */}
          <Show when={objStore.state === State.Folder}>
            <Box
              class="ad-search-wrapper"
              flex="1"
              maxW="480px"
              minW={0}
              position="relative"
              title={searchEnabled() ? undefined : t("home.theme.search_unavailable")}
            >
              <Icon
                as={BsSearch}
                class="ad-search-icon"
                position="absolute"
                left="14px"
                top="50%"
                transform="translateY(-50%)"
                color="var(--ad-text-3)"
                boxSize="0.85rem"
                pointerEvents="none"
                zIndex={1}
              />
              <InputGroup w="$full">
                <Input
                  class="ad-search-input"
                  rounded="$full"
                  pl="38px"
                  pr="46px"
                  py="9px"
                  placeholder={t("home.search.placeholder")}
                  value={keyword()}
                  disabled={!searchEnabled()}
                  onInput={(e) => setKeyword(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch()
                  }}
                  bgColor="rgba(255,255,255,.78)"
                  border="1px solid rgba(226,232,240,.8)"
                  fontSize="0.88rem"
                  color="var(--ad-text-1)"
                  _placeholder={{ color: "var(--ad-text-3)" }}
                  _focus={{
                    bgColor: "#fff",
                    borderColor: "var(--ad-accent)",
                    boxShadow: "0 0 0 3px rgba(99,102,241,.12)",
                  }}
                  _disabled={{ cursor: "not-allowed", opacity: 1 }}
                />
              </InputGroup>
              {/* 右侧快捷键徽标（设计稿 .kbd-shortcut） */}
              <Box
                as="span"
                class="ad-kbd"
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                fontSize="0.72rem"
                color="var(--ad-text-3)"
                bgColor="#f1f5f9"
                px="6px"
                py="2px"
                rounded="4px"
                border="1px solid #e2e8f0"
                pointerEvents="none"
                zIndex={1}
              >
                {isMac ? "⌘" : "Ctrl"} K
              </Box>
            </Box>
          </Show>

          {/* 右：主题、语言、用户 */}
          <HStack class="ad-nav-actions" spacing="12px" flexShrink={0}>
            <Show when={objStore.state === State.Folder}>
              <Center class="ad-nav-btn" title={t("global.switch_color_mode")}>
                <SwitchColorMode />
              </Center>
              <Center class="ad-nav-btn" title={t("global.switch_language")}>
                <SwitchLanguage
                  as={IoLanguageOutline}
                  boxSize="$5"
                  cursor="pointer"
                />
              </Center>
            </Show>
            <UserMenu />
          </HStack>
        </HStack>
      </Container>
    </Center>
  )
}

/**
 * 右上角用户菜单（主题版专属）。
 *
 * 未登录时显示「登录」按钮 —— 首页对游客开放，不能因为没登录就什么都不显示。
 * 头像取用户名首字母/首字，避免依赖后端是否提供头像字段（不同后端字段不一致）。
 * 观感对齐设计稿的 `.avatar`：36px 圆形、浅靛蓝渐变底、主色字。
 */
const UserMenu = () => {
  const t = useT()
  const { to } = useRouter()

  const logged = () => !!me().username
  const initial = () => {
    const name = me().username || ""
    return name ? name.slice(0, 1).toUpperCase() : ""
  }

  /** 退出：清 token 并整页刷新（与侧边菜单的退出行为保持一致） */
  const logout = () => {
    localStorage.removeItem("token")
    location.reload()
  }

  return (
    <Show
      when={logged()}
      fallback={
        <Button
          size="sm"
          rounded="$full"
          colorScheme="primary"
          onClick={() => to("/@login")}
        >
          {t("login.login")}
        </Button>
      }
    >
      <Menu>
        <MenuTrigger
          as={Avatar}
          class="ad-avatar"
          size="sm"
          cursor="pointer"
          name={initial()}
          css={{
            width: "36px",
            height: "36px",
            minWidth: "36px",
            background: "linear-gradient(135deg, #e0e7ff, #fae8ff)",
            color: "var(--ad-accent)",
            fontWeight: 600,
            fontSize: "0.85rem",
            border: "1px solid rgba(255,255,255,.8)",
          }}
        />
        <MenuContent>
          <MenuItem icon={<Icon as={UserIcon} />} onSelect={() => to("/@manage")}>
            {t("manage.title")}
          </MenuItem>
          <Divider />
          <MenuItem icon={<Icon as={LogOut} />} onSelect={logout}>
            {t("global.logout")}
          </MenuItem>
        </MenuContent>
      </Menu>
    </Show>
  )
}
