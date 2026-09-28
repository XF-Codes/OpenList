import * as i18n from "@solid-primitives/i18n"
import { createResource, createSignal } from "solid-js"
export { i18n }

// glob search by Vite
const langs = import.meta.glob("~/lang/*/index.json", {
  eager: true,
  import: "lang",
})

// all available languages
export const languages = Object.keys(langs).map((langPath) => {
  const langCode = langPath.split("/")[3]
  const langName = langs[langPath] as string
  return { code: langCode, lang: langName }
})

// 默认语言固定为简体中文：本项目面向中文部署，不跟随浏览器语言。
// 用户仍可用右上角语言菜单切换，选择结果会写入 localStorage.lang 并优先于这里。
const DEFAULT_LANG = "zh-CN"
const defaultLang = languages.some((lang) => lang.code === DEFAULT_LANG)
  ? DEFAULT_LANG
  : "en"

// Get initial language from localStorage or fallback to defaultLang
export let initialLang = localStorage.getItem("lang") ?? defaultLang

if (!languages.some((lang) => lang.code === initialLang)) {
  initialLang = defaultLang
}

// Type imports
// use `type` to not include the actual dictionary in the bundle
import type * as en from "~/lang/en/entry"

export type Lang = keyof typeof langs
export type RawDictionary = typeof en.dict
export type Dictionary = i18n.Flatten<RawDictionary>

// English dictionary cache for fallback
let enDictCache: Dictionary | null = null

const fetchEnDict = async (): Promise<Dictionary> => {
  if (!enDictCache) {
    const dict: RawDictionary = (await import("~/lang/en/entry")).dict
    enDictCache = i18n.flatten(dict)
  }
  return enDictCache
}

// Fetch and flatten the dictionary, with English fallback
const fetchDictionary = async (locale: Lang): Promise<Dictionary> => {
  try {
    const dict: RawDictionary = (await import(`~/lang/${locale}/entry.ts`)).dict
    const flatDict = i18n.flatten(dict)

    // If not English, merge with English as fallback (English keys underneath, locale on top)
    if (locale !== "en") {
      const enDict = await fetchEnDict()
      return { ...enDict, ...flatDict } as Dictionary
    }

    return flatDict
  } catch (err) {
    console.error(`Error loading dictionary for locale: ${locale}`, err)
    // Fallback to English if the requested locale fails to load
    if (locale !== "en") {
      return await fetchEnDict()
    }
    throw new Error(`Failed to load dictionary for ${locale}`)
  }
}

// Signals to track current language and dictionary state
export const [currentLang, setCurrentLang] = createSignal<Lang>(initialLang)

export const [dict] = createResource(currentLang, fetchDictionary)
