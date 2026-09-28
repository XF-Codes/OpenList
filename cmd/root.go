package cmd

import (
	"fmt"
	"os"

	"github.com/OpenListTeam/OpenList/v4/cmd/flags"
	_ "github.com/OpenListTeam/OpenList/v4/drivers"
	_ "github.com/OpenListTeam/OpenList/v4/internal/archive"
	"github.com/OpenListTeam/OpenList/v4/internal/bootstrap"
	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	_ "github.com/OpenListTeam/OpenList/v4/internal/offline_download"
	"github.com/spf13/cobra"
)

// appName 是程序名，取自 conf.AppName（默认 openlist，可由构建脚本通过 ldflags 注入）。
// 命令行帮助、示例、提示里的命令名统一引用它，改构建名即可整站生效。
var appName = conf.AppName

var RootCmd = &cobra.Command{
	Use:   appName,
	Short: "一个支持多种存储的文件列表程序。",
	Long: `一个支持多种存储的文件列表程序，
由 OpenListTeam 用爱构建。
完整文档请访问 https://doc.oplist.org/`,
}

func Execute() {
	// 所有命令注册完成后，统一汉化 cobra 自动生成的帮助信息
	localizeCobra()
	// 关闭 cobra 默认的英文错误前缀（Error:），由下方统一输出中文提示
	RootCmd.SilenceErrors = true
	// 非 server 子命令（admin / storage / cancel2fa 等）把日志同时输出到控制台，
	// 否则在 log.enable=true 时反馈只进日志文件，命令行看起来像卡住
	RootCmd.PersistentPreRun = func(cmd *cobra.Command, args []string) {
		if cmd.Name() != "server" {
			bootstrap.CLIMode = true
		}
	}
	if err := RootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, "错误:", localizeError(err))
		os.Exit(1)
	}
}

func init() {
	RootCmd.PersistentFlags().StringVar(&flags.DataDir, "data", "data", "数据目录（相对路径基于当前工作目录解析）")
	RootCmd.PersistentFlags().StringVar(&flags.ConfigPath, "config", "", "config.json 的路径（相对于当前工作目录；默认为 [数据目录]/config.json，[数据目录] 由 --data 指定）")
	RootCmd.PersistentFlags().BoolVar(&flags.Debug, "debug", false, "以调试模式启动")
	RootCmd.PersistentFlags().BoolVar(&flags.NoPrefix, "no-prefix", false, "禁用环境变量前缀")
	RootCmd.PersistentFlags().BoolVar(&flags.Dev, "dev", false, "以开发模式启动")
	RootCmd.PersistentFlags().BoolVar(&flags.ForceBinDir, "force-bin-dir", false, "强制使用可执行文件所在目录作为数据目录")
	RootCmd.PersistentFlags().BoolVar(&flags.LogStd, "log-std", false, "强制将日志输出到标准输出")
}
