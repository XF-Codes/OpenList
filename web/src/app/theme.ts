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
    // 列位置写死：侧栏固定占第 1 列。配合下面主舞台的 `2 / -1`，
    // 任一方被隐藏时另一方都不会掉进 240px 的窄列（否则主内容会被压成一条）。
    gridColumn: "1",
  },
  // `2 / -1` = 从第 2 列一直到最后一列。侧栏不在时 `1fr` 会吃满整行，
  // 主内容自动变宽，不会出现「面包屑被压成每行一个字」那种塌陷。
  'html[data-ad-theme="on"] .ad-main-stage': {
    gridColumn: "2 / -1",
  },
  // 仅窄屏出现的元素（汉堡按钮 / 搜索图标）。!important 用来压过 .ad-nav-btn 的 display:flex。
  'html[data-ad-theme="on"] .ad-mobile-only': {
    display: "none !important",
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
  // ── 页脚避让右下角浮动按钮 ────────────────────────────────────────────
  // `toolbar/Right.tsx` 的「更多」按钮是 `position:fixed; right:20px; bottom:20px`（32px 宽），
  // 页脚版本号又右对齐在容器右缘 —— 只要容器贴到视口边就必然被压住。
  // 容器 max-width 1376、居中，实测 1000/1200/1440 全部重叠、1912 不重叠；
  // 解方程 `v-52 < v/2+688` 得 v < 1480，即 1480px 以下都需要给按钮留出 56px。
  "@media (max-width: 1480px)": {
    'html[data-ad-theme="on"] .ad-footer-bar': {
      paddingRight: "56px",
    },
  },

  // ── 响应式 ────────────────────────────────────────────────────────────
  // 分两档，都是实测出来的阈值：
  //   ① ≤1100px —— 6 列排不下了。桌面 6 列固定宽是「类型 110 + 修改时间 150 +
  //      大小 110 + 操作 140」，加上勾选框与内边距共约 574px，而侧栏还要吃掉
  //      240px + 32px 间距。实测 901px 视口下名称列只剩 **17px**（文件夹名完全
  //      看不见，只剩省略号）。所以这两列必须在 1100px 就收起，而不是等到 900px。
  //      侧栏在这一档保留。
  //   ② ≤900px —— 手机/竖屏平板。侧栏整块收进抽屉（抽屉由 `MobileMounts` 提供，
  //      顶栏的汉堡按钮唤起），列表再进一步压缩。
  //
  // 除了「收起」，还有三处手机上必须的压缩：
  //   1. 胶囊搜索框在 390px 下被 flex 压到 26px，⌘K 徽标直接压在输入框上
  //      → 换成图标按钮，唤起的是同一个搜索弹窗；
  //   2. 名称列只剩 29px（「大小 110 + 操作 140」把行吃光了）
  //      → 收窄两列，且操作只留「更多」（触屏没有 hover，原本那组图标既看不见也点不到）；
  //   3. 页脚版本号被右下角固定的「更多」按钮盖住 → 页脚改竖排。
  "@media (max-width: 1100px)": {
    // 只收起「类型 / 修改时间」。这一档仍有鼠标，操作列保持原样（hover 才显形），
    // 不提前降级成「只留更多」。
    'html[data-ad-theme="on"] .ad-col-optional': {
      display: "none !important",
    },
  },

  "@media (max-width: 900px)": {
    'html[data-ad-theme="on"] .ad-app-container': {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
    'html[data-ad-theme="on"] .ad-sidebar': {
      display: "none",
    },
    // 单列下横跨整行；即使列数没被覆盖（仍是 240px + 1fr）也会占满两列。
    'html[data-ad-theme="on"] .ad-main-stage': {
      gridColumn: "1 / -1",
    },
    // 窄屏隐藏开关。注意列表的「类型 / 修改时间」**不**用这个类 ——
    // 它们在 ≤1100px 就该收起（`.ad-col-optional`）。这里现在只作用于
    // 顶栏的配色模式按钮（主题已固定为唯一外观，窄屏不再留入口）。
    'html[data-ad-theme="on"] .ad-hide-mobile': {
      display: "none !important",
    },
    'html[data-ad-theme="on"] .ad-mobile-only': {
      display: "flex !important",
    },

    // ── 顶栏 ───────────────────────────────────────────────────────────
    'html[data-ad-theme="on"] .ad-search-wrapper': {
      display: "none",
    },
    // 品牌组在窄屏变成弹性项：站名超长时走省略号，而不是把右侧按钮挤出屏幕
    'html[data-ad-theme="on"] .ad-brand-group': {
      flex: "1 1 auto",
      minWidth: "0",
    },
    'html[data-ad-theme="on"] .ad-brand-name': {
      fontSize: "1rem",
    },
    'html[data-ad-theme="on"] .ad-nav-inner': {
      gap: "12px",
    },
    'html[data-ad-theme="on"] .ad-nav-btn': {
      width: "32px",
      height: "32px",
      minWidth: "32px",
    },
    'html[data-ad-theme="on"] .ad-nav-actions': {
      gap: "8px",
    },

    // ── 列表 ───────────────────────────────────────────────────────────
    // 表头与数据行必须用同一组列宽，否则两行会错位（名称列是 flex:1，会替另一方吃掉差额）。
    // 所以 `.ad-size`（单元格）与 `.ad-th-size`（表头）要成对出现，操作列同理。
    'html[data-ad-theme="on"] .ad-size': {
      width: "58px",
    },
    'html[data-ad-theme="on"] .ad-th-size': {
      width: "58px",
    },
    'html[data-ad-theme="on"] .ad-th-actions': {
      width: "32px",
    },
    'html[data-ad-theme="on"] .ad-row-actions': {
      width: "32px",
      // 触屏没有 hover，操作组必须常显，否则等于不存在
      opacity: "1",
    },
    // 只保留最后那个「更多」，其余图标在手机上既挤又点不到
    'html[data-ad-theme="on"] .ad-row-actions .ad-action-icon:not(:last-child)': {
      display: "none",
    },
    'html[data-ad-theme="on"] .ad-name-title': {
      maxWidth: "none",
    },
    'html[data-ad-theme="on"] .ad-list-icon': {
      width: "34px",
      height: "34px",
    },
    'html[data-ad-theme="on"] .ad-table-head': {
      padding: "10px 12px",
    },
    'html[data-ad-theme="on"] .list-item': {
      padding: "10px 12px",
    },

    // ── 工具栏行：上传只留图标，视图切换收紧，把宽度让给面包屑 ──────────
    'html[data-ad-theme="on"] .ad-btn-label': {
      display: "none",
    },
    'html[data-ad-theme="on"] .ad-toggle-opt': {
      padding: "6px 8px",
    },

    // ── 页脚：竖排，避开右下角固定的「更多」按钮 ────────────────────────
    'html[data-ad-theme="on"] .ad-footer-bar': {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
    },
  },
})

export { theme }
