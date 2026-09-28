import {
  Center,
  ElementType,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  MenuTriggerProps,
  Spinner,
  useColorModeValue,
} from "@hope-ui/solid"
import { createSignal, For, Show } from "solid-js"
import { Lang, languages, setCurrentLang } from "~/app/i18n"
// import { TbLanguageHiragana } from "solid-icons/tb";
import { IoLanguageOutline } from "solid-icons/io"
import { Portal } from "solid-js/web"

const [fetchingLang, setFetchingLang] = createSignal(false)

export const SwitchLanguage = <C extends ElementType = "button">(
  props: MenuTriggerProps<C>,
) => {
  const switchLang = async (lang: Lang) => {
    setCurrentLang(lang)
    localStorage.setItem("lang", lang)
  }

  // 默认简体中文（不跟随浏览器语言）。只在用户从未手动切换过时写入，
  // 之后一律以 localStorage.lang 为准。
  if (!localStorage.getItem("lang")) {
    switchLang("zh-CN")
  }

  return (
    <>
      <Menu>
        <MenuTrigger cursor="pointer" {...props} />
        <MenuContent>
          <For each={languages}>
            {(lang, i) => (
              <MenuItem
                onSelect={() => {
                  switchLang(lang.code)
                }}
              >
                {lang.lang}
              </MenuItem>
            )}
          </For>
        </MenuContent>
      </Menu>
      <Show when={fetchingLang()}>
        <Portal>
          <Center
            h="$full"
            w="$full"
            pos="fixed"
            top={0}
            bg={useColorModeValue("$blackAlpha4", "$whiteAlpha4")()}
            zIndex="$notification"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="$neutral4"
              color="$info10"
              size="xl"
            />
          </Center>
        </Portal>
      </Show>
    </>
  )
}

export const SwitchLanguageWhite = () => (
  <SwitchLanguage as={IoLanguageOutline} boxSize="$8" />
)
