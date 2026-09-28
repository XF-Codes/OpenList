//go:build !windows

package cmd

import (
	"os"
	"syscall"

	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// StopCmd represents the stop command
var StopCmd = &cobra.Command{
	Use:   "stop",
	Short: "根据 daemon/pid 文件停止 openlist 服务",
	Run: func(cmd *cobra.Command, args []string) {
		stop()
	},
}

func stop() {
	initDaemon()
	if pid == -1 {
		log.Info("似乎尚未启动。请尝试使用 `openlist start` 启动服务。")
		return
	}
	process, err := os.FindProcess(pid)
	if err != nil {
		log.Errorf("根据 pid 查找进程失败: %d, 原因: %v", pid, process)
		return
	}
	err = process.Signal(syscall.SIGTERM)
	if err != nil {
		log.Errorf("终止进程 %d 失败: %v", pid, err)
	} else {
		log.Info("已终止进程: ", pid)
	}
	err = os.Remove(pidFile)
	if err != nil {
		log.Errorf("删除 pid 文件失败")
	}
	pid = -1
}

func init() {
	RootCmd.AddCommand(StopCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// stopCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// stopCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
