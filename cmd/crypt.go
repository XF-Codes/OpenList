package cmd

import (
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"

	rcCrypt "github.com/rclone/rclone/backend/crypt"
	"github.com/rclone/rclone/fs/config/configmap"
	"github.com/rclone/rclone/fs/config/obscure"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// encryption and decryption command format for Crypt driver

type options struct {
	op  string //decrypt or encrypt
	src string //source dir or file
	dst string //out destination

	pwd                string //de/encrypt password
	salt               string
	filenameEncryption string //reference drivers\crypt\meta.go Addition
	dirnameEncryption  string
	filenameEncode     string
	suffix             string
}

var opt options

// CryptCmd represents the crypt command
var CryptCmd = &cobra.Command{
	Use:     "crypt",
	Short:   "加密或解密本地文件或目录",
	Example: `openlist crypt  -s ./src/encrypt/ --op=de --pwd=123456 --salt=345678`,
	Run: func(cmd *cobra.Command, args []string) {
		opt.validate()
		opt.cryptFileDir()

	},
}

func init() {
	RootCmd.AddCommand(CryptCmd)
	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// versionCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	CryptCmd.Flags().StringVarP(&opt.src, "src", "s", "", "要加密/解密的源文件或目录")
	CryptCmd.Flags().StringVarP(&opt.dst, "dst", "d", "", "输出目标目录，未设置时输出到源目录")
	CryptCmd.Flags().StringVar(&opt.op, "op", "", "de 或 en，分别表示解密或加密")

	CryptCmd.Flags().StringVar(&opt.pwd, "pwd", "", "用于加密/解密的密码；若不含 ___Obfuscated___ 前缀，使用前会先进行混淆处理")
	CryptCmd.Flags().StringVar(&opt.salt, "salt", "", "用于加密/解密的盐值；若不含 ___Obfuscated___ 前缀，使用前会先进行混淆处理")
	CryptCmd.Flags().StringVar(&opt.filenameEncryption, "filename-encrypt", "off", "文件名加密模式：off、standard、obfuscate")
	CryptCmd.Flags().StringVar(&opt.dirnameEncryption, "dirname-encrypt", "false", "是否启用目录名加密：true、false")
	CryptCmd.Flags().StringVar(&opt.filenameEncode, "filename-encode", "base64", "文件名编码模式：base64、base32、base32768")
	CryptCmd.Flags().StringVar(&opt.suffix, "suffix", ".bin", "加密文件的后缀，默认为 .bin")
}

func (o *options) validate() {
	if o.src == "" {
		log.Fatal("src 不能为空")
	}
	if o.op != "encrypt" && o.op != "decrypt" && o.op != "en" && o.op != "de" {
		log.Fatal("op 必须是 encrypt 或 decrypt")
	}
	if o.filenameEncryption != "off" && o.filenameEncryption != "standard" && o.filenameEncryption != "obfuscate" {
		log.Fatal("filename_encryption 必须是 off、standard、obfuscate")
	}
	if o.filenameEncode != "base64" && o.filenameEncode != "base32" && o.filenameEncode != "base32768" {
		log.Fatal("filename_encode 必须是 base64、base32、base32768")
	}

}

func (o *options) cryptFileDir() {
	src, _ := filepath.Abs(o.src)
	log.Infof("源绝对路径为 %v", src)

	fileInfo, err := os.Stat(src)
	if err != nil {
		log.Fatalf("读取文件/目录 %v 失败，错误: %v", src, err)

	}
	pwd := updateObfusParm(o.pwd)
	salt := updateObfusParm(o.salt)

	//create cipher
	config := configmap.Simple{
		"password":                  pwd,
		"password2":                 salt,
		"filename_encryption":       o.filenameEncryption,
		"directory_name_encryption": o.dirnameEncryption,
		"filename_encoding":         o.filenameEncode,
		"suffix":                    o.suffix,
		"pass_bad_blocks":           "",
	}
	log.Infof("配置: %v", config)
	cipher, err := rcCrypt.NewCipher(config)
	if err != nil {
		log.Fatalf("创建加密器失败，错误: %v", err)

	}
	dst := ""
	//check and create dst dir
	if o.dst != "" {
		dst, _ = filepath.Abs(o.dst)
		checkCreateDir(dst)
	}

	// src is file
	if !fileInfo.IsDir() { //file
		if dst == "" {
			dst = filepath.Dir(src)
		}
		o.cryptFile(cipher, src, dst)
		return
	}

	// src is dir
	if dst == "" {
		//if src is dir and not set dst dir ,create ${src}_crypt dir as dst dir
		dst = path.Join(filepath.Dir(src), fileInfo.Name()+"_crypt")
	}
	log.Infof("目标路径: %v", dst)

	dirnameMap := make(map[string]string)
	pathSeparator := string(os.PathSeparator)

	filepath.Walk(src, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			log.Errorf("获取文件 %v 信息失败，错误: %v", p, err)
			return err
		}
		if p == src {
			return nil
		}
		log.Infof("当前路径 %v", p)

		// relative path
		rp := strings.ReplaceAll(p, src, "")
		log.Infof("相对路径 %v", rp)

		rpds := strings.Split(rp, pathSeparator)

		if info.IsDir() {
			// absolute dst dir for current path
			dd := ""

			if o.dirnameEncryption == "true" {
				if o.op == "encrypt" || o.op == "en" {
					for i := range rpds {
						oname := rpds[i]
						if _, ok := dirnameMap[rpds[i]]; ok {
							rpds[i] = dirnameMap[rpds[i]]
						} else {
							rpds[i] = cipher.EncryptDirName(rpds[i])
							dirnameMap[oname] = rpds[i]
						}
					}
					dd = path.Join(dst, strings.Join(rpds, pathSeparator))
				} else {
					for i := range rpds {
						oname := rpds[i]
						if _, ok := dirnameMap[rpds[i]]; ok {
							rpds[i] = dirnameMap[rpds[i]]
						} else {
							dnn, err := cipher.DecryptDirName(rpds[i])
							if err != nil {
								log.Fatalf("解密目录名 %v 失败，错误: %v", rpds[i], err)
							}
							rpds[i] = dnn
							dirnameMap[oname] = dnn
						}

					}
					dd = path.Join(dst, strings.Join(rpds, pathSeparator))
				}

			} else {
				dd = path.Join(dst, rp)
			}

			log.Infof("创建输出目录 %v", dd)
			checkCreateDir(dd)
			return nil
		}

		// file dst dir
		fdd := dst

		if o.dirnameEncryption == "true" {
			for i := range rpds {
				if i == len(rpds)-1 {
					break
				}
				fdd = path.Join(fdd, dirnameMap[rpds[i]])
			}

		} else {
			fdd = path.Join(fdd, strings.Join(rpds[:len(rpds)-1], pathSeparator))
		}

		log.Infof("文件输出目录 %v", fdd)
		o.cryptFile(cipher, p, fdd)
		return nil
	})

}

func (o *options) cryptFile(cipher *rcCrypt.Cipher, src string, dst string) {
	fileInfo, err := os.Stat(src)
	if err != nil {
		log.Fatalf("获取文件 %v 信息失败，错误: %v", src, err)

	}
	fd, err := os.OpenFile(src, os.O_RDWR, 0666)
	if err != nil {
		log.Fatalf("打开文件 %v 失败，错误: %v", src, err)

	}
	defer fd.Close()

	var cryptSrcReader io.Reader
	var outFile string
	if o.op == "encrypt" || o.op == "en" {
		filename := fileInfo.Name()
		if o.filenameEncryption != "off" {
			filename = cipher.EncryptFileName(fileInfo.Name())
			log.Infof("加密文件名 %v 为 %v", fileInfo.Name(), filename)
		} else {
			filename = fileInfo.Name() + o.suffix
		}
		cryptSrcReader, err = cipher.EncryptData(fd)
		if err != nil {
			log.Fatalf("加密文件 %v 失败，错误: %v", src, err)

		}
		outFile = path.Join(dst, filename)
	} else {
		filename := fileInfo.Name()
		if o.filenameEncryption != "off" {
			filename, err = cipher.DecryptFileName(filename)
			if err != nil {
				log.Fatalf("解密文件名 %v 失败，错误: %v", src, err)
			}
			log.Infof("解密文件名 %v 为 %v, ", fileInfo.Name(), filename)
		} else {
			filename = strings.TrimSuffix(filename, o.suffix)
		}

		cryptSrcReader, err = cipher.DecryptData(fd)
		if err != nil {
			log.Fatalf("解密文件 %v 失败，错误: %v", src, err)

		}
		outFile = path.Join(dst, filename)
	}
	//write new file
	wr, err := os.OpenFile(outFile, os.O_CREATE|os.O_WRONLY, 0755)
	if err != nil {
		log.Fatalf("创建文件 %v 失败，错误: %v", outFile, err)

	}
	defer wr.Close()

	_, err = io.Copy(wr, cryptSrcReader)
	if err != nil {
		log.Fatalf("写入文件 %v 失败，错误: %v", outFile, err)
	}

}

// check dir exist ,if not ,create
func checkCreateDir(dir string) {
	_, err := os.Stat(dir)

	if os.IsNotExist(err) {
		err := os.MkdirAll(dir, 0755)
		if err != nil {
			log.Fatalf("创建目录 %v 失败，错误: %v", dir, err)
		}
		return
	} else if err != nil {
		log.Fatalf("读取目录 %v 出错: %v", dir, err)
	}

}

func updateObfusParm(str string) string {
	obfuscatedPrefix := "___Obfuscated___"
	if !strings.HasPrefix(str, obfuscatedPrefix) {
		str, err := obscure.Obscure(str)
		if err != nil {
			log.Fatalf("更新混淆参数失败，错误: %v", str)
		}
	} else {
		str, _ = strings.CutPrefix(str, obfuscatedPrefix)
	}
	return str
}
