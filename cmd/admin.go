/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"

	"github.com/OpenListTeam/OpenList/v4/internal/bootstrap"
	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	"github.com/OpenListTeam/OpenList/v4/internal/op"
	"github.com/OpenListTeam/OpenList/v4/internal/setting"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils/random"
	"github.com/spf13/cobra"
)

// AdminCmd represents the password command
var AdminCmd = &cobra.Command{
	Use:     "admin",
	Aliases: []string{"password"},
	Short:   "查看管理员信息，以及执行与管理员密码相关的操作",
	Run: func(cmd *cobra.Command, args []string) {
		bootstrap.Init()
		defer bootstrap.Release()
		admin, err := op.GetAdmin()
		if err != nil {
			utils.Log.Errorf("获取管理员用户失败: %+v", err)
		} else {
			utils.Log.Infof("已从命令行获取管理员用户")
			fmt.Println("管理员用户名:", admin.Username)
			fmt.Println("密码仅在首次启动时输出，之后以哈希值存储，无法还原")
			fmt.Println("可以通过执行 [openlist admin random] 将密码重置为随机字符串")
			fmt.Println("也可以通过执行 [openlist admin set 新密码] 设置新密码")
		}
	},
}

var RandomPasswordCmd = &cobra.Command{
	Use:   "random",
	Short: "将管理员密码重置为随机字符串",
	Run: func(cmd *cobra.Command, args []string) {
		utils.Log.Infof("已从命令行将管理员密码重置为随机字符串")
		newPwd := random.String(8)
		setAdminPassword(newPwd)
	},
}

var SetPasswordCmd = &cobra.Command{
	Use:   "set",
	Short: "设置管理员密码",
	RunE: func(cmd *cobra.Command, args []string) error {
		if len(args) == 0 {
			return fmt.Errorf("请输入新密码")
		}
		setAdminPassword(args[0])
		return nil
	},
}

var ShowTokenCmd = &cobra.Command{
	Use:   "token",
	Short: "显示管理员令牌",
	Run: func(cmd *cobra.Command, args []string) {
		bootstrap.Init()
		defer bootstrap.Release()
		token := setting.GetStr(conf.Token)
		utils.Log.Infof("已从命令行显示管理员令牌")
		fmt.Println("管理员令牌:", token)
	},
}

func setAdminPassword(pwd string) {
	bootstrap.Init()
	defer bootstrap.Release()
	admin, err := op.GetAdmin()
	if err != nil {
		utils.Log.Errorf("获取管理员用户失败: %+v", err)
		return
	}
	admin.SetPassword(pwd)
	if err := op.UpdateUser(admin); err != nil {
		utils.Log.Errorf("更新管理员用户失败: %+v", err)
		return
	}
	utils.Log.Infof("已从命令行更新管理员用户")
	fmt.Println("管理员用户已更新：")
	fmt.Println("用户名:", admin.Username)
	fmt.Println("密码:", pwd)
	DelAdminCacheOnline()
}

func init() {
	RootCmd.AddCommand(AdminCmd)
	AdminCmd.AddCommand(RandomPasswordCmd)
	AdminCmd.AddCommand(SetPasswordCmd)
	AdminCmd.AddCommand(ShowTokenCmd)
	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// passwordCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// passwordCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
