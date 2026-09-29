import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@hope-ui/solid"
import { createSignal } from "solid-js"
import { useT } from "~/hooks"
import { MountList } from "./MountList"

/**
 * 窄屏的挂载点抽屉。
 *
 * 桌面端侧栏是网格里真实的一列（240px）；窄屏下这一列会把内容区挤没，所以整块收起。
 * 但「收起」不能等于「消失」—— 一级挂载点还得能切，否则手机上只能停在自动选中的
 * 第一个挂载点里出不去。这里把它搬进左侧抽屉，由顶栏的汉堡按钮唤起。
 *
 * 只在窄屏出现：抽屉内容是 `display:none` 之外独立 portal 到 body 的，
 * 不会参与 `.ad-app-container` 的网格排布。
 */
const [opened, setOpened] = createSignal(false)

/** 唤起挂载点抽屉（顶栏汉堡按钮调用） */
export const openMounts = () => setOpened(true)

const closeMounts = () => setOpened(false)

export const MobileMounts = () => {
  const t = useT()
  return (
    <Drawer opened={opened()} placement="left" onClose={closeMounts} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        {/* 复用遗留键：`sidebar_title` 已三语就绪（位置 / 位置 / Locations） */}
        <DrawerHeader>{t("home.theme.sidebar_title")}</DrawerHeader>
        <DrawerBody>
          {/* 点中某个挂载点后自动收起，省一次「返回」操作 */}
          <MountList onChange={closeMounts} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
