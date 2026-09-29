package static

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/OpenListTeam/OpenList/v4/drivers/base"
	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	"github.com/OpenListTeam/OpenList/v4/internal/op"
	"github.com/OpenListTeam/OpenList/v4/internal/setting"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/OpenListTeam/OpenList/v4/public"
	"github.com/gin-gonic/gin"
)

type ManifestIcon struct {
	Src   string `json:"src"`
	Sizes string `json:"sizes"`
	Type  string `json:"type"`
}

type Manifest struct {
	Display  string         `json:"display"`
	Scope    string         `json:"scope"`
	StartURL string         `json:"start_url"`
	Name     string         `json:"name"`
	Icons    []ManifestIcon `json:"icons"`
}

var static fs.FS

// initializedFlag 记录「系统是否已完成初始化（已存在管理员账号）」。
// op.GetAdmin 内部对成功结果已有缓存，这里再加一层原子标志，
// 一旦确认初始化完成就完全不再访问数据库。
var initializedFlag atomic.Bool

// isInitialized 判断系统是否已完成初始化。
// 未初始化时（不存在管理员账号）返回 false，此时前端应进入安装向导。
func isInitialized() bool {
	if initializedFlag.Load() {
		return true
	}
	if _, err := op.GetAdmin(); err == nil {
		initializedFlag.Store(true)
		return true
	}
	return false
}

var (
	backendWizardOnce    sync.Once
	backendWizardEnabled bool
)

// needBackendWizard 判断「未初始化时是否由后端兜底提供安装向导页」。
//
// 正常情况不需要：前端产物自带 /@init 路由与 init_status 守卫（见
// web/src/app/App.tsx），未初始化时会自己跳进向导。
// 但若部署的是不含该向导的前端产物（如官方发布的旧 dist），页面只会停在
// 一个无法登录的登录页 —— 此时由后端兜底，保证「任何 dist 都能完成初始化」。
//
// 探测只在首次需要时执行一次（系统一旦初始化就不再走这里）。
func needBackendWizard() bool {
	backendWizardOnce.Do(func() {
		hasFrontendWizard := distContainsInitWizard()
		backendWizardEnabled = !hasFrontendWizard
		if hasFrontendWizard {
			utils.Log.Debug("前端产物自带安装向导，后端兜底向导不启用")
		} else {
			utils.Log.Warn("前端产物不含安装向导，已启用后端兜底向导（未初始化时访问 / 即可初始化）")
		}
	})
	return backendWizardEnabled
}

// distContainsInitWizard 扫描前端产物中的 JS，判断是否引用了初始化接口。
//
// 只匹配 assets 下的 .js：页面脚本、路由守卫与接口调用都被打包进 bundle，
// 出现 "init_status" 即说明该产物自带安装向导。命中即返回，避免全量读取。
func distContainsInitWizard() bool {
	entries, err := fs.ReadDir(static, "assets")
	if err != nil {
		return false
	}
	marker := []byte("init_status")
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".js") {
			continue
		}
		data, err := fs.ReadFile(static, "assets/"+entry.Name())
		if err != nil {
			continue
		}
		if bytes.Contains(data, marker) {
			return true
		}
	}
	return false
}

func initStatic() {
	utils.Log.Debug("Initializing static file system...")
	if conf.Conf.DistDir == "" {
		dist, err := fs.Sub(public.Public, "dist")
		if err != nil {
			utils.Log.Fatalf("failed to read dist dir: %v", err)
		}
		static = dist
		utils.Log.Debug("Using embedded dist directory")
		return
	}
	static = os.DirFS(conf.Conf.DistDir)
	utils.Log.Infof("Using custom dist directory: %s", conf.Conf.DistDir)
}

func replaceStrings(content string, replacements map[string]string) string {
	for old, new := range replacements {
		content = strings.Replace(content, old, new, 1)
	}
	return content
}

func initIndex(siteConfig SiteConfig) {
	utils.Log.Debug("Initializing index.html...")
	// dist_dir is empty and cdn is not empty, and web_version is empty or beta or dev or rolling
	if conf.Conf.DistDir == "" && conf.Conf.Cdn != "" && (conf.WebVersion == "" || conf.WebVersion == "beta" || conf.WebVersion == "dev" || conf.WebVersion == "rolling") {
		utils.Log.Infof("Fetching index.html from CDN: %s/index.html...", siteConfig.Cdn)
		resp, err := base.RestyClient.R().
			SetHeader("Accept", "text/html").
			Get(fmt.Sprintf("%s/index.html", siteConfig.Cdn))
		if err != nil {
			utils.Log.Fatalf("failed to fetch index.html from CDN: %v", err)
		}
		if resp.StatusCode() != http.StatusOK {
			utils.Log.Fatalf("failed to fetch index.html from CDN, status code: %d", resp.StatusCode())
		}
		conf.RawIndexHtml = string(resp.Body())
		utils.Log.Info("Successfully fetched index.html from CDN")
	} else {
		utils.Log.Debug("Reading index.html from static files system...")
		indexFile, err := static.Open("index.html")
		if err != nil {
			if errors.Is(err, fs.ErrNotExist) {
				utils.Log.Fatalf("index.html not exist, you may forget to put dist of frontend to public/dist")
			}
			utils.Log.Fatalf("failed to read index.html: %v", err)
		}
		defer func() {
			_ = indexFile.Close()
		}()
		index, err := io.ReadAll(indexFile)
		if err != nil {
			utils.Log.Fatalf("failed to read dist/index.html")
		}
		conf.RawIndexHtml = string(index)
		utils.Log.Debug("Successfully read index.html from static files system")
	}
	utils.Log.Debug("Replacing placeholders in index.html...")
	// Construct the correct manifest path based on basePath
	manifestPath := "/manifest.json"
	if siteConfig.BasePath != "/" {
		manifestPath = siteConfig.BasePath + "/manifest.json"
	}
	replaceMap := map[string]string{
		"cdn: undefined":        fmt.Sprintf("cdn: '%s'", siteConfig.Cdn),
		"base_path: undefined":  fmt.Sprintf("base_path: '%s'", siteConfig.BasePath),
		`href="/manifest.json"`: fmt.Sprintf(`href="%s"`, manifestPath),
	}
	conf.RawIndexHtml = replaceStrings(conf.RawIndexHtml, replaceMap)
	UpdateIndex()
}

func UpdateIndex() {
	utils.Log.Debug("Updating index.html with settings...")
	favicon := setting.GetStr(conf.Favicon)
	logo := strings.Split(setting.GetStr(conf.Logo), "\n")[0]
	title := setting.GetStr(conf.SiteTitle)
	customizeHead := setting.GetStr(conf.CustomizeHead)
	customizeBody := setting.GetStr(conf.CustomizeBody)
	mainColor := setting.GetStr(conf.MainColor)
	utils.Log.Debug("Applying replacements for default pages...")
	replaceMap1 := map[string]string{
		"https://img.remit.ee/i/IquuGRbwcW4h":  favicon,
		"https://res.oplist.org/logo/logo.png": logo,
		"Loading...":                           title,
		"main_color: undefined":                fmt.Sprintf("main_color: '%s'", mainColor),
	}
	conf.ManageHtml = replaceStrings(conf.RawIndexHtml, replaceMap1)
	utils.Log.Debug("Applying replacements for manage pages...")
	replaceMap2 := map[string]string{
		"<!-- customize head -->": customizeHead,
		"<!-- customize body -->": customizeBody,
	}
	conf.IndexHtml = replaceStrings(conf.ManageHtml, replaceMap2)
	utils.Log.Debug("Index.html update completed")
}

func ManifestJSON(c *gin.Context) {
	// Get site configuration to ensure consistent base path handling
	siteConfig := getSiteConfig()

	// Get site title from settings
	siteTitle := setting.GetStr(conf.SiteTitle)

	// Get logo from settings, use the first line (light theme logo)
	logoSetting := setting.GetStr(conf.Logo)
	logoUrl := strings.Split(logoSetting, "\n")[0]

	// Use base path from site config for consistency
	basePath := siteConfig.BasePath

	// Determine scope and start_url
	// PWA scope and start_url should always point to our application's base path
	// regardless of whether static resources come from CDN or local server
	scope := basePath
	startURL := basePath

	manifest := Manifest{
		Display:  "standalone",
		Scope:    scope,
		StartURL: startURL,
		Name:     siteTitle,
		Icons: []ManifestIcon{
			{
				Src:   logoUrl,
				Sizes: "512x512",
				Type:  "image/png",
			},
		},
	}

	c.Header("Content-Type", "application/json")
	c.Header("Cache-Control", "public, max-age=3600") // cache for 1 hour

	if err := json.NewEncoder(c.Writer).Encode(manifest); err != nil {
		utils.Log.Errorf("Failed to encode manifest.json: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate manifest"})
		return
	}
}

func Static(r *gin.RouterGroup, noRoute func(handlers ...gin.HandlerFunc)) {
	utils.Log.Debug("Setting up static routes...")
	siteConfig := getSiteConfig()
	initStatic()
	initIndex(siteConfig)
	folders := []string{"assets", "images", "streamer", "static"}

	if conf.Conf.Cdn == "" {
		utils.Log.Debug("Setting up static file serving...")
		r.Use(func(c *gin.Context) {
			for _, folder := range folders {
				if strings.HasPrefix(c.Request.RequestURI, fmt.Sprintf("/%s/", folder)) {
					c.Header("Cache-Control", "public, max-age=15552000")
				}
			}
		})
		for _, folder := range folders {
			sub, err := fs.Sub(static, folder)
			if err != nil {
				utils.Log.Fatalf("can't find folder: %s", folder)
			}
			utils.Log.Debugf("Setting up route for folder: %s", folder)
			r.StaticFS(fmt.Sprintf("/%s/", folder), http.FS(sub))
		}
	} else {
		// Ensure static file redirected to CDN
		for _, folder := range folders {
			r.GET(fmt.Sprintf("/%s/*filepath", folder), func(c *gin.Context) {
				filepath := c.Param("filepath")
				c.Redirect(http.StatusFound, fmt.Sprintf("%s/%s%s", siteConfig.Cdn, folder, filepath))
			})
		}
	}

	utils.Log.Debug("Setting up catch-all route...")
	noRoute(func(c *gin.Context) {
		if c.Request.Method != "GET" && c.Request.Method != "POST" {
			c.Status(405)
			return
		}
		// 系统尚未初始化时统一进入安装向导，避免用户看到一个无法登录的登录页。
		// 仅在前端产物不自带向导时兜底（见 needBackendWizard）。
		if !isInitialized() && needBackendWizard() {
			c.Header("Content-Type", "text/html; charset=utf-8")
			c.Header("Cache-Control", "no-store")
			c.Status(200)
			_, _ = c.Writer.WriteString(InitWizardPage(siteConfig.BasePath))
			c.Writer.Flush()
			c.Writer.WriteHeaderNow()
			return
		}
		c.Header("Content-Type", "text/html")
		c.Status(200)
		if strings.HasPrefix(c.Request.URL.Path, "/@manage") {
			_, _ = c.Writer.WriteString(conf.ManageHtml)
		} else {
			_, _ = c.Writer.WriteString(conf.IndexHtml)
		}
		c.Writer.Flush()
		c.Writer.WriteHeaderNow()
	})
}
