/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// StartCmd represents the start command
var StartCmd = &cobra.Command{
	Use:   "start",
	Short: "以 `--force-bin-dir` 静默启动 openlist 服务",
	Run: func(cmd *cobra.Command, args []string) {
		start()
	},
}

func start() {
	initDaemon()
	if pid != -1 {
		_, err := os.FindProcess(pid)
		if err == nil {
			log.Info("openlist 已启动，pid ", pid)
			return
		}
	}
	exe, err := os.Executable()
	if err != nil {
		log.Fatal("解析可执行文件路径失败: ", err)
	}
	childArgs := append([]string{"server"}, os.Args[2:]...)
	hasForceBinDir := false
	for _, arg := range childArgs {
		if arg == "--force-bin-dir" || strings.HasPrefix(arg, "--force-bin-dir=") {
			hasForceBinDir = true
			break
		}
	}
	if !hasForceBinDir {
		childArgs = append(childArgs, "--force-bin-dir")
	}
	cmd := exec.Command(exe, childArgs...)
	cmd.Env = os.Environ()
	stdout, err := os.OpenFile(filepath.Join(filepath.Dir(pidFile), "start.log"), os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0666)
	if err != nil {
		log.Fatal(os.Getpid(), ": 打开启动日志文件失败:", err)
	}
	cmd.Stderr = stdout
	cmd.Stdout = stdout
	err = cmd.Start()
	if err != nil {
		log.Fatal("启动子进程失败: ", err)
	}
	log.Infof("启动成功，pid: %d", cmd.Process.Pid)
	err = os.WriteFile(pidFile, []byte(strconv.Itoa(cmd.Process.Pid)), 0666)
	if err != nil {
		log.Warn("记录 pid 失败，你可能无法通过 `./openlist stop` 停止程序")
	}
}

func init() {
	RootCmd.AddCommand(StartCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// startCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// startCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
