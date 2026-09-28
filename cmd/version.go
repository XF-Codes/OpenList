/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"runtime"

	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	"github.com/spf13/cobra"
)

// VersionCmd represents the version command
var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "显示 " + appName + " 当前版本",
	Run: func(cmd *cobra.Command, args []string) {
		goVersion := fmt.Sprintf("%s %s/%s", runtime.Version(), runtime.GOOS, runtime.GOARCH)

		fmt.Printf(`构建时间: %s
Go 版本: %s
作者: %s
提交 ID: %s
版本: %s
前端版本: %s
`, conf.BuiltAt, goVersion, conf.GitAuthor, conf.GitCommit, conf.Version, conf.WebVersion)
		os.Exit(0)
	},
}

func init() {
	RootCmd.AddCommand(VersionCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// versionCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// versionCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
