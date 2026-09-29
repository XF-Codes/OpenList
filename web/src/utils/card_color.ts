import { ObjType } from "~/types"
import { ext } from "./path"
import { isArchive } from "~/store/archive"

/**
 * 文件类型 → 图标底色。
 *
 * 设计稿（`build/index.html`）的类型色是「极浅底色 + 同色系饱和前景」：
 *   .type-folder { background:#eff6ff; color:#3b82f6 }   蓝
 *   .type-image  { background:#faf5ff; color:#a855f7 }   紫
 *   .type-media  { background:#fff1f2; color:#f43f5e }   玫红
 *   .type-code   { background:#ecfdf5; color:#10b981 }   绿
 *   .type-doc    { background:#fff7ed; color:#ea580c }   橙
 *
 * 这里沿用这套「浅底深字」的逻辑，并细分出文档/表格/演示/PDF/压缩包等类型，
 * 底层用纯色（不是渐变）—— 渐变叠在小色块上会显脏，纯色更接近设计稿观感。
 *
 * 取色原则：
 *  - 与设计稿一致的类型直接照搬（文件夹=蓝、图片=紫、媒体=玫红、代码=绿、文档=橙）；
 *  - 其余类型按语义就近归类，避免"花了十几秒才分清哪个是文档"。
 */
export type CardColor = {
  /** 语义分类键（同时用作角标文案的 i18n 键后缀） */
  key: string
  /** 底色（纯色，直接用于 background） */
  bg: string
  /** 图标前景色 */
  fg: string
}

const COLORS: Record<string, CardColor> = {
  folder: { key: "folder", bg: "#eff6ff", fg: "#3b82f6" },
  image: { key: "image", bg: "#faf5ff", fg: "#a855f7" },
  video: { key: "video", bg: "#fff1f2", fg: "#f43f5e" },
  audio: { key: "audio", bg: "#fdf2f8", fg: "#db2777" },
  code: { key: "code", bg: "#ecfdf5", fg: "#10b981" },
  text: { key: "text", bg: "#f0fdfa", fg: "#0d9488" },
  doc: { key: "doc", bg: "#fff7ed", fg: "#ea580c" },
  sheet: { key: "sheet", bg: "#f0fdf4", fg: "#16a34a" },
  slide: { key: "slide", bg: "#fff7ed", fg: "#f97316" },
  pdf: { key: "pdf", bg: "#fef2f2", fg: "#dc2626" },
  archive: { key: "archive", bg: "#fffbeb", fg: "#d97706" },
  app: { key: "app", bg: "#f8fafc", fg: "#475569" },
  disk: { key: "disk", bg: "#f5f3ff", fg: "#7c3aed" },
  link: { key: "link", bg: "#f0f9ff", fg: "#0284c7" },
  other: { key: "other", bg: "#f8fafc", fg: "#64748b" },
}

/** 扩展名 → 语义分类（用于文档/表格/压缩包等细分） */
const EXT_GROUPS: Array<[string, string]> = [
  ["doc,docx,rtf,odt", "doc"],
  ["xls,xlsx,csv,ods", "sheet"],
  ["ppt,pptx,odp", "slide"],
  ["pdf", "pdf"],
  ["zip,7z,rar,tar,gz,bz2,xz", "archive"],
  [
    "js,ts,jsx,tsx,json,go,py,java,c,cpp,h,hpp,rs,rb,php,sh,bat,ps1,sql,yml,yaml,toml,ini,conf,xml,html,css,scss",
    "code",
  ],
  ["exe,msi,apk,dmg,ipa,deb,rpm,appx", "app"],
  // iso/dmg 之类是"镜像"，归到 disk 更贴切；上面 archive 组不再重复列 iso
  ["iso,img,vhd,vmdk", "disk"],
  ["url,m3u8,torrent", "link"],
]

/**
 * 按对象取配色。
 *
 * 文件夹优先于按扩展名判断 —— 目录名里也可能带 `.`（例如 `v1.2.3`），
 * 若先按扩展名匹配会把文件夹误判成某类文件。
 */
export const getCardColor = (type: number, name: string): CardColor => {
  if (type === ObjType.FOLDER) return COLORS.folder
  const e = ext(name).toLowerCase()
  if (e) {
    for (const [exts, key] of EXT_GROUPS) {
      if (exts.split(",").includes(e)) return COLORS[key]
    }
  }
  if (isArchive(name)) return COLORS.archive
  switch (type) {
    case ObjType.VIDEO:
      return COLORS.video
    case ObjType.AUDIO:
      return COLORS.audio
    case ObjType.IMAGE:
      return COLORS.image
    case ObjType.TEXT:
      return COLORS.text
    default:
      return COLORS.other
  }
}
