/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"strconv"

	"github.com/OpenListTeam/OpenList/v4/internal/bootstrap"
	"github.com/OpenListTeam/OpenList/v4/internal/db"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/charmbracelet/bubbles/table"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
)

// storageCmd represents the storage command
var storageCmd = &cobra.Command{
	Use:   "storage",
	Short: "管理存储",
}

var disableStorageCmd = &cobra.Command{
	Use:   "disable [挂载路径]",
	Short: "根据挂载路径禁用某个存储",
	RunE: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("必须提供挂载路径")
		}
		mountPath := args[0]
		bootstrap.Init()
		defer bootstrap.Release()
		storage, err := db.GetStorageByMountPath(mountPath)
		if err != nil {
			return fmt.Errorf("查询存储失败: %+v", err)
		}
		storage.Disabled = true
		err = db.UpdateStorage(storage)
		if err != nil {
			return fmt.Errorf("更新存储失败: %+v", err)
		}
		utils.Log.Infof("已从命令行禁用挂载路径为 [%s] 的存储", mountPath)
		fmt.Printf("挂载路径为 [%s] 的存储已禁用\n", mountPath)
		return nil
	},
}

var deleteStorageCmd = &cobra.Command{
	Use:   "delete [id]",
	Short: "根据 id 删除某个存储",
	RunE: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return fmt.Errorf("必须提供 id")
		}
		id, err := strconv.Atoi(args[0])
		if err != nil {
			return fmt.Errorf("id 必须是数字")
		}

		if force, _ := cmd.Flags().GetBool("force"); force {
			fmt.Printf("确定要删除 id 为 [%d] 的存储吗？[y/N]: ", id)
			var confirm string
			fmt.Scanln(&confirm)
			if confirm != "y" && confirm != "Y" {
				fmt.Println("已取消删除操作。")
				return nil
			}
		}

		bootstrap.Init()
		defer bootstrap.Release()
		err = db.DeleteStorageById(uint(id))
		if err != nil {
			return fmt.Errorf("根据 id 删除存储失败: %+v", err)
		}
		utils.Log.Infof("已从命令行删除 id 为 [%d] 的存储", id)
		fmt.Printf("id 为 [%d] 的存储已删除\n", id)
		return nil
	},
}

var baseStyle = lipgloss.NewStyle().
	BorderStyle(lipgloss.NormalBorder()).
	BorderForeground(lipgloss.Color("240"))

type model struct {
	table table.Model
}

func (m model) Init() tea.Cmd { return nil }

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			if m.table.Focused() {
				m.table.Blur()
			} else {
				m.table.Focus()
			}
		case "q", "ctrl+c":
			return m, tea.Quit
			//case "enter":
			//	return m, tea.Batch(
			//		tea.Printf("Let's go to %s!", m.table.SelectedRow()[1]),
			//	)
		}
	}
	m.table, cmd = m.table.Update(msg)
	return m, cmd
}

func (m model) View() string {
	return baseStyle.Render(m.table.View()) + "\n"
}

var storageTableHeight int
var listStorageCmd = &cobra.Command{
	Use:   "list",
	Short: "列出所有存储",
	RunE: func(cmd *cobra.Command, args []string) error {
		bootstrap.Init()
		defer bootstrap.Release()
		storages, _, err := db.GetStorages(1, -1)
		if err != nil {
			return fmt.Errorf("查询存储列表失败: %+v", err)
		} else {
			fmt.Printf("共找到 %d 个存储\n", len(storages))
			columns := []table.Column{
				{Title: "ID", Width: 4},
				{Title: "驱动", Width: 16},
				{Title: "挂载路径", Width: 30},
				{Title: "已启用", Width: 7},
			}

			var rows []table.Row
			for i := range storages {
				storage := storages[i]
				enabled := "是"
				if storage.Disabled {
					enabled = "否"
				}
				rows = append(rows, table.Row{
					strconv.Itoa(int(storage.ID)),
					storage.Driver,
					storage.MountPath,
					enabled,
				})
			}
			t := table.New(
				table.WithColumns(columns),
				table.WithRows(rows),
				table.WithFocused(true),
				table.WithHeight(storageTableHeight),
			)

			s := table.DefaultStyles()
			s.Header = s.Header.
				BorderStyle(lipgloss.NormalBorder()).
				BorderForeground(lipgloss.Color("240")).
				BorderBottom(true).
				Bold(false)
			s.Selected = s.Selected.
				Foreground(lipgloss.Color("229")).
				Background(lipgloss.Color("57")).
				Bold(false)
			t.SetStyles(s)

			m := model{t}
			if _, err := tea.NewProgram(m).Run(); err != nil {
				fmt.Printf("运行程序失败: %+v\n", err)
				os.Exit(1)
			}
		}
		return nil
	},
}

func init() {

	RootCmd.AddCommand(storageCmd)
	storageCmd.AddCommand(disableStorageCmd)
	storageCmd.AddCommand(listStorageCmd)
	storageCmd.PersistentFlags().IntVarP(&storageTableHeight, "height", "H", 10, "表格高度")
	storageCmd.AddCommand(deleteStorageCmd)
	deleteStorageCmd.Flags().BoolP("force", "f", false, "强制删除，无需确认")
	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// storageCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// storageCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
