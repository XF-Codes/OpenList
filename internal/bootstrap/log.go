package bootstrap

import (
	"io"
	"log"
	"os"

	"github.com/OpenListTeam/OpenList/v4/cmd/flags"
	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/natefinch/lumberjack"
	"github.com/sirupsen/logrus"
)

func init() {
	formatter := logrus.TextFormatter{
		ForceColors:               true,
		EnvironmentOverrideColors: true,
		TimestampFormat:           "2006-01-02 15:04:05",
		FullTimestamp:             true,
	}
	logrus.SetFormatter(&formatter)
	utils.Log.SetFormatter(&formatter)
	// logrus.SetLevel(logrus.DebugLevel)
}

func setLog(l *logrus.Logger) {
	if flags.Debug || flags.Dev {
		l.SetLevel(logrus.DebugLevel)
		l.SetReportCaller(true)
	} else {
		l.SetLevel(logrus.InfoLevel)
		l.SetReportCaller(false)
	}
}

// CLIMode 由 cmd 包在运行非 server 子命令（admin / storage / cancel2fa 等）时置为 true。
// 开启后日志会同时写到控制台，避免命令行反馈只进日志文件、控制台看起来像卡住。
var CLIMode bool

func Log() {
	setLog(logrus.StandardLogger())
	setLog(utils.Log)
	logConfig := conf.Conf.Log
	if logConfig.Enable {
		var w io.Writer = &lumberjack.Logger{
			Filename:   logConfig.Name,
			MaxSize:    logConfig.MaxSize, // megabytes
			MaxBackups: logConfig.MaxBackups,
			MaxAge:     logConfig.MaxAge,   //days
			Compress:   logConfig.Compress, // disabled by default
		}
		if flags.Debug || flags.Dev || flags.LogStd || CLIMode {
			w = io.MultiWriter(os.Stdout, w)
		}
		logrus.SetOutput(w)
	}
	log.SetOutput(logrus.StandardLogger().Out)
	utils.Log.Infof("init logrus...")
	utils.Log = logrus.StandardLogger()
}
