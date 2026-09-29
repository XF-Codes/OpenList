import { globalCss, HopeThemeConfig } from "@hope-ui/solid"
import { hoverColor } from "~/utils"

const theme: HopeThemeConfig = {
  initialColorMode: "system",
  lightTheme: {
    colors: {
      // background: "$neutral2",
      background: "#f7f8fa",
    },
  },
  components: {
    Button: {
      baseStyle: {
        root: {
          rounded: "$lg",
          _active: {
            transform: "scale(.95)",
            transition: "0.2s",
          },
          _focus: {
            boxShadow: "unset",
          },
        },
      },
      defaultProps: {
        root: {
          colorScheme: "info",
          variant: "subtle",
        },
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: "info",
        variant: "subtle",
      },
    },
    Input: {
      baseStyle: {
        input: {
          rounded: "$lg",
          _focus: {
            boxShadow: "unset",
            borderColor: "$info8",
          },
        },
      },
      defaultProps: {
        input: {
          variant: "filled",
        },
      },
    },
    Textarea: {
      baseStyle: {
        rounded: "$lg",
        _focus: {
          boxShadow: "unset",
          borderColor: "$info8",
        },
        resize: "vertical",
        wordBreak: "break-all",
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Select: {
      baseStyle: {
        trigger: {
          rounded: "$lg",
          _focus: {
            boxShadow: "unset",
            borderColor: "$info8",
          },
        },
        content: {
          border: "none",
          rounded: "$lg",
        },
        optionIndicator: {
          color: "$info10",
        },
      },
      defaultProps: {
        root: {
          variant: "filled",
        },
      },
    },
    Checkbox: {
      defaultProps: {
        root: {
          colorScheme: "info",
          variant: "filled",
        },
      },
    },
    Switch: {
      defaultProps: {
        root: {
          colorScheme: "info",
        },
      },
    },
    Menu: {
      baseStyle: {
        content: {
          rounded: "$md",
          minW: "unset",
          border: "unset",
          // py: "0",
        },
        item: {
          rounded: "$md",
          py: "$1",
          // mx: "0",
        },
      },
    },
    Notification: {
      baseStyle: {
        root: {
          rounded: "$lg",
          border: "unset",
        },
      },
    },
    Alert: {
      baseStyle: {
        root: {
          rounded: "$lg",
        },
      },
    },
    Anchor: {
      baseStyle: {
        rounded: "$lg",
        px: "$1_5",
        py: "$1",
        _hover: {
          bgColor: hoverColor(),
          textDecoration: "none",
        },
        _focus: {
          boxShadow: "unset",
        },
        _active: { transform: "scale(.95)", transition: "0.1s" },
      },
    },
    Modal: {
      baseStyle: {
        content: {
          rounded: "$lg",
        },
      },
    },
  },
}

export const globalStyles = globalCss({
  "*": {
    margin: 0,
    padding: 0,
  },
  html: {
    fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol" !important`,
  },

  // ── 外观主题（Aether Drive）──────────────────────────────────────────
  // 设计基准：build/index.html。这是**唯一外观**，没有开关也没有其它主题可选：
  // utils/theme.ts 的 applyTheme() 会无条件把 <html data-ad-theme="on"> 和
  // data-ad-orbs="on" 打上，并注入 --ad-* 变量。属性选择器保留是为了把主题
  // 规则和基础样式分层（改动主题时只碰这一层，不会波及基础样式）。
  //
  // 变量一览（都由 utils/theme.ts 赋值）：
  //   --ad-bg-base   页面底色（#f4f6fb）
  //   --ad-accent    主色 靛蓝 #6366f1
  //   --ad-accent-2  辅色 紫 #a855f7
  //   --ad-radius    卡片圆角（14px）
  //   --ad-font      字体栈
  //   --ad-text-1/2/3 三级文字色（#1e293b / #64748b / #94a3b8）
  //
  // 属性：data-ad-theme=on / data-ad-orbs=on
  'html[data-ad-theme="on"]': {
    backgroundColor: "var(--ad-bg-base, #f4f6fb)",
    fontFamily: "var(--ad-font, inherit)",
    // 设计稿只有浅色一套配色，显式声明让表单控件/滚动条也走浅色
    colorScheme: "light",
    // 设计稿的文字三级色（:root 里的 --text-*）
    "--ad-text-1": "#1e293b",
    "--ad-text-2": "#64748b",
    "--ad-text-3": "#94a3b8",
  },
  // 环境光斑。设计稿用两个大模糊球体（右上 / 左下）营造冷调氛围，
  // blur(120px) + opacity .5，固定定位、不参与布局、不挡点击。
  'html[data-ad-orbs="on"]::before': {
    content: '""',
    position: "fixed",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #e0e7ff 0%, #ddd6fe 100%)",
    top: "-200px",
    right: "-100px",
    filter: "blur(120px)",
    opacity: "0.5",
    zIndex: 0,
    pointerEvents: "none",
  },
  'html[data-ad-orbs="on"]::after': {
    content: '""',
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #fce7f3 0%, #e0f2fe 100%)",
    bottom: "-150px",
    left: "-100px",
    filter: "blur(120px)",
    opacity: "0.5",
    zIndex: 0,
    pointerEvents: "none",
  },
  // 底色铺在 html 上，body 透明才能看见
  'html[data-ad-theme="on"] body': {
    backgroundColor: "transparent",
  },
  // 设计稿是 `body { min-height:100vh; display:flex; flex-direction:column }`
  // 配合 `.footer-bar { margin: auto auto 16px }` —— 内容短时页脚也贴在视口底部。
  // 这里 `#root` 就是那个纵向 flex 容器。
  'html[data-ad-theme="on"] #root': {
    minHeight: "100vh",
  },
  'html[data-ad-theme="on"] .footer': {
    marginTop: "auto",
  },
  // ── 顶栏（设计稿 header / .nav-inner）────────────────────────────────
  // 半透明 + blur(20px)，底部 1px 细描边
  'html[data-ad-theme="on"] .header': {
    backgroundColor: "rgba(244, 246, 251, 0.85) !important",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
  },
  // 品牌区（logo + 站名），对应 .brand
  'html[data-ad-theme="on"] .ad-brand': {
    textDecoration: "none !important",
  },
  'html[data-ad-theme="on"] .ad-brand-name': {
    lineHeight: "1.2",
  },
  // 搜索框：胶囊形玻璃底 + 左放大镜 + 右 ⌘K 徽标（.search-input / .kbd-shortcut）
  'html[data-ad-theme="on"] .ad-search-input': {
    height: "40px",
  },
  // 右侧圆形玻璃按钮（.nav-btn）
  'html[data-ad-theme="on"] .ad-nav-btn': {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "50%",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    color: "var(--ad-text-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all .2s",
  },
  'html[data-ad-theme="on"] .ad-nav-btn:hover': {
    backgroundColor: "#fff",
    color: "var(--ad-text-1)",
  },
  'html[data-ad-theme="on"] .ad-nav-btn svg': {
    width: "16px",
    height: "16px",
    flexShrink: 0,
  },
  // ── 工具栏：分段式视图切换（设计稿 .view-toggle / .toggle-opt）────────
  'html[data-ad-theme="on"] .ad-toggle-opt': {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "var(--ad-text-2)",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all .2s",
  },
  'html[data-ad-theme="on"] .ad-toggle-opt[data-active="true"]': {
    background: "#ffffff",
    color: "var(--ad-text-1)",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },
  'html[data-ad-theme="on"] .ad-toggle-opt svg': {
    width: "15px",
    height: "15px",
  },
  // ── 列表视图（设计稿 .file-list-card / .file-table）───────────────────
  // 整块做成一张玻璃卡
  'html[data-ad-theme="on"] .list.viselect-container': {
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    padding: "0",
    gap: "0",
  },
  // 表头单元格：小号大写 + 字间距（.file-table th）
  'html[data-ad-theme="on"] .ad-th': {
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--ad-text-3)",
    whiteSpace: "nowrap",
  },
  // 设计稿 .file-table th.sortable:hover —— 只有可排序列悬停才加深
  'html[data-ad-theme="on"] .ad-th-sortable:hover': {
    color: "var(--ad-text-1)",
  },
  // 数据行：整行浅白悬停，去掉卡片化的圆角
  'html[data-ad-theme="on"] .list-item': {
    borderRadius: "0 !important",
    color: "var(--ad-text-2)",
  },
  'html[data-ad-theme="on"] .list-item:hover': {
    color: "var(--ad-text-1)",
  },
  // 最后一行不画分隔线（设计稿 tr:last-child td { border-bottom: none }）
  'html[data-ad-theme="on"] .list.viselect-container > div:last-child .list-item':
    {
      borderBottom: "none !important",
    },
  // 名称列：32px 彩色图标块 + 主色字文件名（.list-icon / .name-title）
  'html[data-ad-theme="on"] .ad-name-title': {
    fontWeight: "500",
    color: "var(--ad-text-1)",
    fontSize: "0.88rem",
    // 设计稿 .name-title 限宽 380px，过长文件名走省略号
    maxWidth: "380px",
  },
  // 类型角标（.tag-badge）
  'html[data-ad-theme="on"] .ad-tag-badge': {
    fontSize: "0.72rem",
    padding: "2px 8px",
    borderRadius: "99px",
    backgroundColor: "#f1f5f9",
    color: "var(--ad-text-2)",
    display: "inline-block",
    whiteSpace: "nowrap",
  },
  // 修改时间 / 大小列
  'html[data-ad-theme="on"] .ad-cell': {
    color: "var(--ad-text-2)",
    fontSize: "0.88rem",
  },
  'html[data-ad-theme="on"] .list-item:hover .ad-cell': {
    color: "var(--ad-text-1)",
  },
  // 行首复选框（设计稿 .custom-check）：16px 方角描边块，勾选后填充品牌色。
  // hope-ui 默认的 filled 变体是「灰底 + 透明描边 + 蓝色勾选」，与设计稿不符，
  // 这里按设计稿改成「透明底 + #cbd5e1 描边 + 靛蓝勾选」。用 !important 是因为
  // 尺寸/底色由 size/variant 的原子类给出，优先级高于普通选择器。
  'html[data-ad-theme="on"] .hope-checkbox__control': {
    width: "16px !important",
    height: "16px !important",
    borderRadius: "4px !important",
    border: "1.5px solid #cbd5e1 !important",
    backgroundColor: "transparent !important",
    transition: "all .15s",
  },
  'html[data-ad-theme="on"] .hope-checkbox__control[data-checked]': {
    backgroundColor: "var(--ad-accent) !important",
    borderColor: "var(--ad-accent) !important",
  },
  'html[data-ad-theme="on"] .hope-checkbox__control svg': {
    color: "#fff !important",
    width: "10px",
    height: "10px",
  },
  // 行尾操作组（.list-actions / .action-icon）：默认隐形，悬停或选中才出现
  'html[data-ad-theme="on"] .ad-row-actions': {
    opacity: "0",
    transition: "opacity .2s",
  },
  'html[data-ad-theme="on"] .list-item:hover .ad-row-actions': {
    opacity: "1",
  },
  'html[data-ad-theme="on"] .list-item.selected .ad-row-actions': {
    opacity: "1",
  },
  'html[data-ad-theme="on"] .ad-action-icon': {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    padding: "0",
    borderRadius: "6px",
    backgroundColor: "rgba(0,0,0,.04)",
    color: "var(--ad-text-2)",
    border: "none",
    cursor: "pointer",
    transition: "all .15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  'html[data-ad-theme="on"] .ad-action-icon:hover': {
    backgroundColor: "#ffffff",
    color: "var(--ad-accent)",
    boxShadow: "0 2px 6px rgba(0,0,0,.08)",
  },
  'html[data-ad-theme="on"] .ad-action-icon svg': {
    width: "0.75rem",
    height: "0.75rem",
  },
  // ── 网格视图（设计稿 .file-grid / .file-card）─────────────────────────
  // 内容卡片：玻璃白底 + 细描边 + 14px 圆角
  // 用 !important 是因为 VStack 的 rounded 会生成内联原子类，优先级高于普通选择器。
  'html[data-ad-theme="on"] .grid-item': {
    borderRadius: "var(--ad-radius, 14px) !important",
    backgroundColor: "rgba(255, 255, 255, 0.78) !important",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  'html[data-ad-theme="on"] .grid-item:hover': {
    backgroundColor: "rgba(255, 255, 255, 0.95) !important",
    borderColor: "rgba(99, 102, 241, 0.2)",
    transform: "translateY(-3px)",
    boxShadow: "0 10px 24px rgba(99, 102, 241, 0.1)",
  },
  // 选中态（viselect 选中会加 .selected）保留白底高亮，别被 hover 规则盖掉
  'html[data-ad-theme="on"] .grid-item.selected': {
    backgroundColor: "rgba(255, 255, 255, 0.95) !important",
    borderColor: "rgba(99, 102, 241, 0.45)",
  },
  // 卡片右上角的操作组（设计稿 .file-card .hover-actions）：悬停卡片才出现
  'html[data-ad-theme="on"] .grid-item .ad-row-actions': {
    marginLeft: "auto",
  },
  // 面包屑：原本是不透明底色，会挡住底色与光斑
  'html[data-ad-theme="on"] .nav': {
    backgroundColor: "transparent !important",
  },
  'html[data-ad-theme="on"] .nav::after': {
    backgroundColor: "transparent !important",
  },
  // 面包屑条目：设计稿里是纯文字链接（悬停只变色，不加底色/内边距）
  'html[data-ad-theme="on"] .nav-link': {
    padding: "0 !important",
    backgroundColor: "transparent !important",
    color: "var(--ad-text-2) !important",
    fontSize: "0.9rem",
  },
  'html[data-ad-theme="on"] .nav-link:hover': {
    color: "var(--ad-text-1) !important",
    backgroundColor: "transparent !important",
  },
  'html[data-ad-theme="on"] .nav-link[aria-current="page"]': {
    color: "var(--ad-text-1) !important",
    fontWeight: "600",
  },
  'html[data-ad-theme="on"] .nav-separator': {
    color: "var(--ad-text-3)",
    fontSize: "0.75rem",
  },
  // 主内容区：设计稿里列表/网格各自成卡，外层不再套一层玻璃卡（否则是双层卡片）
  'html[data-ad-theme="on"] .obj-box': {
    backgroundColor: "transparent !important",
    border: "none !important",
    boxShadow: "none !important",
    padding: "0 !important",
    backdropFilter: "none !important",
    WebkitBackdropFilter: "none !important",
  },
  // ── 侧栏（设计稿 aside.sidebar）───────────────────────────────────────
  // 设计稿的 aside 本身**没有卡片底**，条目直接浮在页面上。
  'html[data-ad-theme="on"] .ad-sidebar': {
    backgroundColor: "transparent !important",
    boxShadow: "none !important",
  },
  // 侧栏条目：悬停浅白；选中白底 + 主色字 + 阴影（.nav-item.active a）
  'html[data-ad-theme="on"] .ad-nav-item:hover': {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    color: "#1e293b",
  },
  'html[data-ad-theme="on"] .ad-nav-item[data-active="true"]': {
    backgroundColor: "#ffffff",
    color: "var(--ad-accent)",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  // 侧栏滚动条隐藏（设计稿里没有滚动条）
  'html[data-ad-theme="on"] .ad-nav-scroll': {
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" },
  },
  // ── 页脚（设计稿 .footer-bar / .status-pill / .dot-online）───────────
  'html[data-ad-theme="on"] .ad-dot-online': {
    width: "6px",
    height: "6px",
    background: "#10b981",
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  // ── 主操作按钮（上传）：深色实底 + 白字（.btn-primary）────────────────
  'html[data-ad-theme="on"] .ad-btn-primary': {
    background: "#1e293b !important",
    color: "#fff !important",
    border: "none !important",
    borderRadius: "8px !important",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
  },
  'html[data-ad-theme="on"] .ad-btn-primary:hover': {
    opacity: "0.9",
  },
  // ── 右下角浮动工具栏：改成与设计稿同一套玻璃语言 ─────────────────────
  // 设计稿没有这个工具栏（它是本应用的功能入口），但配色/材质要一致，
  // 否则默认的蓝色图标和靛蓝主题撞色。
  'html[data-ad-theme="on"] .toolbar-toggle': {
    backgroundColor: "rgba(255, 255, 255, 0.85) !important",
    color: "var(--ad-text-2) !important",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: "50% !important",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  'html[data-ad-theme="on"] .left-toolbar': {
    backgroundColor: "rgba(255, 255, 255, 0.85) !important",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },
  'html[data-ad-theme="on"] .left-toolbar-in > svg': {
    color: "var(--ad-text-2) !important",
  },
  'html[data-ad-theme="on"] .left-toolbar-in > svg:hover': {
    backgroundColor: "var(--ad-accent) !important",
    color: "#fff !important",
  },
  "#root": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ".hope-breadcrumb__list": {
    flexWrap: "wrap",
    rowGap: "0 !important",
  },
  ".lightgallery-container": {
    "& .lg-backdrop": {
      zIndex: "$popover",
    },
    "& .lg-outer": {
      zIndex: "calc($popover + 10)",
    },
  },
  ".viselect-selection-area": {
    background: "rgba(46, 115, 252, 0.11)",
    border: "2px solid rgba(98, 155, 255, 0.81)",
    borderRadius: "0.1em",
  },
  ".viselect-container": {
    userSelect: "none",
    "& .viselect-item": {
      "-webkit-user-drag": "none",
      "& img": {
        "-webkit-user-drag": "none",
      },
    },
  },
  // ── 响应式（设计稿的 @media (max-width: 900px)）─────────────────────────
  //   .app-container { grid-template-columns: 1fr }
  //   .sidebar       { display: none }
  //   .hide-mobile   { display: none }
  // 窄屏下侧栏会挤掉内容区，所以整块收起；列表的「类型 / 修改时间」两列同理。
  "@media (max-width: 900px)": {
    'html[data-ad-theme="on"] .ad-app-container': {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
    'html[data-ad-theme="on"] .ad-sidebar': {
      display: "none",
    },
    'html[data-ad-theme="on"] .ad-hide-mobile': {
      display: "none !important",
    },
  },
})

export { theme }
