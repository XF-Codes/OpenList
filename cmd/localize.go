package cmd

import (
	"regexp"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

func init() {
	// 将 pflag 自动生成的 "(default ...)" 汉化为 "(默认 ...)"
	cobra.AddTemplateFunc("localizedFlagUsages", func(f *pflag.FlagSet) string {
		return strings.ReplaceAll(f.FlagUsages(), " (default ", " (默认 ")
	})
}

// errorTranslations 用于汉化 cobra/pflag 内部产生的英文错误提示。
var errorTranslations = []struct {
	re   *regexp.Regexp
	repl string
}{
	{regexp.MustCompile(`(?m)^Did you mean this\?$`), "你是不是想输入："},
	{regexp.MustCompile(`^unknown command "(.+)" for "(.+)"`), `未知命令 "$1"（属于 "$2"）`},
	{regexp.MustCompile(`^unknown shorthand flag: '(.+)' in (.+)$`), `未知短选项: '$1'（出现在 $2 中）`},
	{regexp.MustCompile(`^unknown flag: (.+)$`), "未知选项: $1"},
	{regexp.MustCompile(`^flag needs an argument: (.+)$`), "选项缺少参数: $1"},
	{regexp.MustCompile(`^required flag\(s\) (.+) not set`), "必需选项 $1 未设置"},
	{regexp.MustCompile(`^invalid argument "(.+)" for "(.+)" flag: (.+)$`), `选项 "$2" 的参数 "$1" 无效: $3`},
	{regexp.MustCompile(`^accepts (\d+) arg\(s\), received (\d+)$`), "最多接受 $1 个参数，实际收到 $2 个"},
}

// localizeError 把 cobra/pflag 产生的英文错误提示替换为中文。
func localizeError(err error) string {
	if err == nil {
		return ""
	}
	msg := err.Error()
	for _, t := range errorTranslations {
		msg = t.re.ReplaceAllString(msg, t.repl)
	}
	return msg
}

// helpTemplate 是汉化后的帮助模板（对应 cobra 默认帮助模板）。
const helpTemplate = `{{with (or .Long .Short)}}{{. | trimTrailingWhitespaces}}

{{end}}{{if or .Runnable .HasSubCommands}}{{.UsageString}}{{end}}`

// usageTemplate 是汉化后的用法模板（对应 cobra 默认用法模板）。
const usageTemplate = `用法：{{if .Runnable}}
  {{.UseLine}}{{end}}{{if .HasAvailableSubCommands}}
  {{.CommandPath}} [命令]{{end}}{{if gt (len .Aliases) 0}}

别名：
  {{.NameAndAliases}}{{end}}{{if .HasExample}}

示例：
{{.Example}}{{end}}{{if .HasAvailableSubCommands}}{{$cmds := .Commands}}{{if eq (len .Groups) 0}}

可用命令：{{range $cmds}}{{if (or .IsAvailableCommand (eq .Name "help"))}}
  {{rpad .Name .NamePadding }} {{.Short}}{{end}}{{end}}{{else}}{{range $group := .Groups}}

{{.Title}}{{range $cmds}}{{if (and (eq .GroupID $group.ID) (or .IsAvailableCommand (eq .Name "help")))}}
  {{rpad .Name .NamePadding }} {{.Short}}{{end}}{{end}}{{end}}{{if not .AllChildCommandsHaveGroup}}

附加命令：{{range $cmds}}{{if (and (eq .GroupID "") (or .IsAvailableCommand (eq .Name "help")))}}
  {{rpad .Name .NamePadding }} {{.Short}}{{end}}{{end}}{{end}}{{end}}{{end}}{{if .HasAvailableLocalFlags}}

选项：
{{localizedFlagUsages .LocalFlags | trimTrailingWhitespaces}}{{end}}{{if .HasAvailableInheritedFlags}}

全局选项：
{{localizedFlagUsages .InheritedFlags | trimTrailingWhitespaces}}{{end}}{{if .HasHelpSubCommands}}

附加帮助主题：{{range .Commands}}{{if .IsAdditionalHelpTopicCommand}}
  {{rpad .CommandPath .CommandPathPadding}} {{.Short}}{{end}}{{end}}{{end}}{{if .HasAvailableSubCommands}}

使用 "{{.CommandPath}} [命令] --help" 查看关于某个命令的更多信息。{{end}}
`

// localizeCobra 汉化 cobra 自动生成的帮助/用法模板、help 命令、completion 命令以及各命令的 --help 选项说明。
// 需要在所有命令注册完成后再调用（即 Execute 中）。
func localizeCobra() {
	RootCmd.SetHelpTemplate(helpTemplate)
	RootCmd.SetUsageTemplate(usageTemplate)

	// 生成自动命令（help / completion），以便随后汉化它们的说明
	RootCmd.InitDefaultHelpCmd()
	RootCmd.InitDefaultCompletionCmd()

	localizeHelpFlags(RootCmd)
	localizeHelpCmd()
	localizeCompletionCmd()
}

// localizeHelpFlags 递归地为每个命令初始化并汉化 --help 选项说明。
func localizeHelpFlags(c *cobra.Command) {
	c.InitDefaultHelpFlag()
	if f := c.Flags().Lookup("help"); f != nil {
		if c == RootCmd {
			f.Usage = "查看 " + RootCmd.Name() + " 的帮助信息"
		} else {
			f.Usage = "查看 " + c.Name() + " 命令的帮助信息"
		}
	}
	for _, sub := range c.Commands() {
		localizeHelpFlags(sub)
	}
}

// localizeHelpCmd 汉化 cobra 自动生成的 help 命令。
func localizeHelpCmd() {
	helpCmd := findSubCmd(RootCmd, "help")
	if helpCmd == nil {
		return
	}
	helpCmd.Use = "help [命令]"
	helpCmd.Short = "查看任意命令的帮助信息"
	helpCmd.Long = `查看任意命令的帮助信息。
直接输入 ` + RootCmd.Name() + ` help [命令路径] 即可查看完整说明。`
}

// localizeCompletionCmd 汉化 cobra 自动生成的 completion 命令及其子命令。
func localizeCompletionCmd() {
	compCmd := findSubCmd(RootCmd, "completion")
	if compCmd == nil {
		return
	}
	name := RootCmd.Name()
	compCmd.Short = "为指定的 shell 生成自动补全脚本"
	compCmd.Long = `为 ` + name + ` 生成指定 shell 的自动补全脚本。
使用各子命令的 --help 可查看生成脚本的详细用法。`

	for _, sub := range compCmd.Commands() {
		switch sub.Name() {
		case "bash":
			sub.Short = "为 bash 生成自动补全脚本"
			sub.Long = `为 bash 生成自动补全脚本。

该脚本依赖 'bash-completion' 包，若尚未安装，可通过系统的包管理器安装。

在当前 shell 会话中加载补全：

	source <(` + name + ` completion bash)

为每个新会话自动加载，执行一次：

#### Linux：

	` + name + ` completion bash > /etc/bash_completion.d/` + name + `

#### macOS：

	` + name + ` completion bash > $(brew --prefix)/etc/bash_completion.d/` + name + `

需要重新打开 shell 才会生效。`
		case "zsh":
			sub.Short = "为 zsh 生成自动补全脚本"
			sub.Long = `为 zsh 生成自动补全脚本。

如果当前环境尚未启用 shell 补全，需要先启用，可执行一次：

	echo "autoload -U compinit; compinit" >> ~/.zshrc

在当前 shell 会话中加载补全：

	source <(` + name + ` completion zsh)

为每个新会话自动加载，执行一次：

#### Linux：

	` + name + ` completion zsh > "${fpath[1]}/_` + name + `"

#### macOS：

	` + name + ` completion zsh > $(brew --prefix)/share/zsh/site-functions/_` + name + `

需要重新打开 shell 才会生效。`
		case "fish":
			sub.Short = "为 fish 生成自动补全脚本"
			sub.Long = `为 fish 生成自动补全脚本。

在当前 shell 会话中加载补全：

	` + name + ` completion fish | source

为每个新会话自动加载，执行一次：

	` + name + ` completion fish > ~/.config/fish/completions/` + name + `.fish

需要重新打开 shell 才会生效。`
		case "powershell":
			sub.Short = "为 powershell 生成自动补全脚本"
			sub.Long = `为 powershell 生成自动补全脚本。

在当前 shell 会话中加载补全：

	` + name + ` completion powershell | Out-String | Invoke-Expression

为每个新会话自动加载，请将上述命令的输出添加到 powershell 配置文件中。`
		}
		// 汉化 --no-descriptions 选项
		if f := sub.Flags().Lookup("no-descriptions"); f != nil {
			f.Usage = "禁用补全描述"
		}
	}
}

// findSubCmd 在给定命令的直接子命令中按名称查找命令。
func findSubCmd(parent *cobra.Command, name string) *cobra.Command {
	for _, c := range parent.Commands() {
		if c.Name() == name || c.HasAlias(name) {
			return c
		}
	}
	return nil
}
