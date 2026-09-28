package cmd

import (
	"crypto/tls"
	"fmt"
	"time"

	"github.com/OpenListTeam/OpenList/v4/internal/conf"
	"github.com/OpenListTeam/OpenList/v4/internal/op"
	"github.com/OpenListTeam/OpenList/v4/internal/setting"
	"github.com/OpenListTeam/OpenList/v4/pkg/utils"
	"github.com/go-resty/resty/v2"
)

func DelAdminCacheOnline() {
	admin, err := op.GetAdmin()
	if err != nil {
		utils.Log.Errorf("[del_admin_cache] 获取管理员用户出错: %+v", err)
		return
	}
	DelUserCacheOnline(admin.Username)
}

func DelUserCacheOnline(username string) {
	client := resty.New().SetTimeout(1 * time.Second).SetTLSClientConfig(&tls.Config{InsecureSkipVerify: conf.Conf.TlsInsecureSkipVerify})
	token := setting.GetStr(conf.Token)
	port := conf.Conf.Scheme.HttpPort
	u := fmt.Sprintf("http://localhost:%d/api/admin/user/del_cache", port)
	if port == -1 {
		if conf.Conf.Scheme.HttpsPort == -1 {
			utils.Log.Warnf("[del_user_cache] 没有开放的端口")
			return
		}
		u = fmt.Sprintf("https://localhost:%d/api/admin/user/del_cache", conf.Conf.Scheme.HttpsPort)
	}
	res, err := client.R().SetHeader("Authorization", token).SetQueryParam("username", username).Post(u)
	if err != nil {
		utils.Log.Warnf("[del_user_cache_online] 请求失败: %+v", err)
		return
	}
	if res.StatusCode() != 200 {
		utils.Log.Warnf("[del_user_cache_online] 请求失败: %+v", res.String())
		return
	}
	code := utils.Json.Get(res.Body(), "code").ToInt()
	msg := utils.Json.Get(res.Body(), "message").ToString()
	if code != 200 {
		utils.Log.Errorf("[del_user_cache_online] 出错: %s", msg)
		return
	}
	utils.Log.Debugf("[del_user_cache_online] 已清除用户 [%s] 的缓存", username)
}
