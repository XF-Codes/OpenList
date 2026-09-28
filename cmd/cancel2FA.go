/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"

	"github.com/OpenListTeam/OpenList/v4/internal/bootstrap"
	"github.com/OpenListTeam/OpenList/v4/internal/op"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/spf13/cobra"
)

// Cancel2FACmd represents the delete2fa command
var Cancel2FACmd = &cobra.Command{
	Use:   "cancel2fa",
	Short: "删除管理员用户的两步验证（2FA）",
	Run: func(cmd *cobra.Command, args []string) {
		bootstrap.Init()
		defer bootstrap.Release()
		admin, err := op.GetAdmin()
		if err != nil {
			utils.Log.Errorf("获取管理员用户失败: %+v", err)
		} else {
			err := op.Cancel2FAByUser(admin)
			if err != nil {
				utils.Log.Errorf("取消两步验证失败: %+v", err)
			} else {
				utils.Log.Infof("已从命令行取消两步验证")
				fmt.Println("已取消两步验证")
				DelAdminCacheOnline()
			}
		}
	},
}

func init() {
	RootCmd.AddCommand(Cancel2FACmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// cancel2FACmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// cancel2FACmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
