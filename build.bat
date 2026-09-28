@echo off
setlocal

rem ============================================================
rem  OpenList - Windows build script (with cross-compilation)
rem
rem  Usage:
rem    build.bat                         cross-build all default targets into build\
rem    build.bat windows/amd64 linux/arm64
rem                                      cross-build only the listed targets
rem    build.bat help                    show this help
rem
rem  Environment variables:
rem    APP_NAME      base name of the output binaries        (default: openlist)
rem    OUT_DIR       output directory                        (default: build)
rem    BUILD_TAGS    extra `go build -tags` values           (default: jsoniter)
rem    TARGETS       space separated GOOS/GOARCH list        (default: see below)
rem    GITHUB_TOKEN  avoids GitHub API rate limits when
rem                  resolving the frontend version
rem
rem  Cross targets are built with CGO_ENABLED=0 (pure Go), so no
rem  extra toolchain is required. The sqlite driver is pure Go
rem  (github.com/glebarez/sqlite), so this is safe.
rem ============================================================

cd /d "%~dp0"

rem ---------- defaults ----------
if not defined APP_NAME set "APP_NAME=XFPAN"
if not defined OUT_DIR set "OUT_DIR=build"
if not defined BUILD_TAGS set "BUILD_TAGS=jsoniter"
@REM set "DEFAULT_TARGETS=windows/amd64 windows/arm64 linux/amd64 linux/arm64 darwin/amd64 darwin/arm64"

set "DEFAULT_TARGETS=windows/amd64 linux/amd64"
set "PKG=github.com/OpenListTeam/OpenList/v4/internal/conf"
set "FRONTEND_REPO=OpenListTeam/OpenList-Frontend"

rem ---------- parse arguments (shift based: safe with quotes) ----------
rem NOTE: do NOT chain `set ... & goto ...` on an `if` line -- the `&`
rem       would make the goto run unconditionally. Set a flag, then test it.
rem NOTE: accumulate into CLI_TARGETS instead of TARGETS, so that a
rem       TARGETS value coming from the environment is not clobbered.
set "CLI_TARGETS="
set "PARSE_HELP="
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="help"   set "PARSE_HELP=1"
if /i "%~1"=="-h"     set "PARSE_HELP=1"
if /i "%~1"=="--help" set "PARSE_HELP=1"
if /i "%~1"=="/?"     set "PARSE_HELP=1"
if defined PARSE_HELP goto :args_done
set "CLI_TARGETS=%CLI_TARGETS% %~1"
shift
goto :parse_args
:args_done

if defined PARSE_HELP goto :usage

rem command line wins over the TARGETS environment variable
if not defined CLI_TARGETS goto :targets_ready
set "CLI_TARGETS=%CLI_TARGETS:~1%"
set "TARGETS=%CLI_TARGETS%"
:targets_ready
if not defined TARGETS set "TARGETS=%DEFAULT_TARGETS%"

rem ---------- 1/5 build time (yyyy-MM-dd HH:mm:ss +0800) ----------
set "BUILT_AT="
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'"`) do set "BUILT_AT=%%i"
if not defined BUILT_AT (
    set "BUILT_AT=%date% %time%"
    goto :time_ready
)
rem normalize +08:00 -> +0800, same as bash "date +%z"
set "TZ_TAIL=%BUILT_AT:~-6%"
set "TZ_TAIL=%TZ_TAIL::=%"
set "BUILT_AT=%BUILT_AT:~0,-6%%TZ_TAIL%"
:time_ready

rem ---------- 2/5 go version ----------
where go >nul 2>&1
if errorlevel 1 (
    echo [ERROR] "go" was not found in PATH.
    exit /b 1
)
set "GO_VERSION="
for /f "usebackq tokens=3" %%i in (`go version`) do set "GO_VERSION=%%i"
if not defined GO_VERSION set "GO_VERSION=unknown"

rem ---------- 3/5 git metadata ----------
rem NOTE: %x20=space %x3c="<" %x3e=">" -- hex escapes keep the
rem       angle brackets away from cmd, which would treat them
rem       as redirection operators inside "for /f".
set "GIT_AUTHOR="
set "GIT_COMMIT="
set "APP_VERSION="
for /f "usebackq tokens=*" %%i in (`git log -1 --pretty^=format:%%aN%%x20%%x3c%%ae%%x3e`) do set "GIT_AUTHOR=%%i"
for /f "usebackq tokens=*" %%i in (`git log -1 --pretty^=format:%%h`) do set "GIT_COMMIT=%%i"
for /f "usebackq tokens=*" %%i in (`git describe --long --tags --dirty --always`) do set "APP_VERSION=%%i"
if not defined GIT_AUTHOR set "GIT_AUTHOR=unknown"
if not defined GIT_COMMIT set "GIT_COMMIT=unknown"
if not defined APP_VERSION set "APP_VERSION=dev"

rem ---------- 4/5 frontend version ----------
set "CURL_AUTH="
if defined GITHUB_TOKEN set CURL_AUTH=-H "Authorization: Bearer %GITHUB_TOKEN%"
set "WEB_LINE="
for /f "usebackq tokens=*" %%i in (`curl -sL --max-time 8 %CURL_AUTH% "https://api.github.com/repos/%FRONTEND_REPO%/releases/latest" ^| findstr /c:"tag_name"`) do set "WEB_LINE=%%i"
rem for /f strips leading whitespace from piped output, so token
rem positions shift -- strip quotes first, then split on ":".
set "WEB_VERSION="
if not defined WEB_LINE goto :web_ready
set "WEB_LINE=%WEB_LINE:"=%"
for /f "tokens=2 delims=:" %%j in ("%WEB_LINE%") do set "WEB_VERSION=%%j"
set "WEB_VERSION=%WEB_VERSION: =%"
set "WEB_VERSION=%WEB_VERSION:,=%"
:web_ready
if not defined WEB_VERSION set "WEB_VERSION=0.0.0"
if "%WEB_VERSION:~0,1%"=="v" set "WEB_VERSION=%WEB_VERSION:~1%"

rem ---------- 5/5 build ----------
rem Single quotes, NOT doubled double quotes: go.exe parses its own
rem command line with CommandLineToArgvW, which treats "" as two
rem quote toggles and swallows them, splitting the value on spaces.
rem Go's own -ldflags parser accepts '...' and strips it.
set "LDFLAGS=-w -s"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.AppName=%APP_NAME%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.BuiltAt=%BUILT_AT%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GoVersion=%GO_VERSION%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GitAuthor=%GIT_AUTHOR%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GitCommit=%GIT_COMMIT%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.Version=%APP_VERSION%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.WebVersion=%WEB_VERSION%'"

echo.
echo   AppName    : %APP_NAME%
echo   OutDir     : %OUT_DIR%
echo   BuildTags  : %BUILD_TAGS%
echo   BuiltAt    : %BUILT_AT%
echo   GoVersion  : %GO_VERSION%
echo   GitAuthor  : "%GIT_AUTHOR%"
echo   GitCommit  : %GIT_COMMIT%
echo   Version    : %APP_VERSION%
echo   WebVersion : %WEB_VERSION%
echo   Targets    : %TARGETS%
echo.

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

set "BUILD_FAILED="
for %%t in (%TARGETS%) do (
    call :BuildTarget "%%t"
    if errorlevel 1 set "BUILD_FAILED=1"
)

echo.
if defined BUILD_FAILED (
    echo Build FAILED.
    endlocal
    exit /b 1
)
echo Build OK. Output is in "%OUT_DIR%".
endlocal
exit /b 0

rem ============================================================
rem  :BuildTarget <GOOS>/<GOARCH>
rem  Builds a single cross target into %OUT_DIR%.
rem  setlocal keeps GOOS/GOARCH/CGO_ENABLED from leaking between
rem  iterations, so the caller's environment stays untouched.
rem ============================================================
:BuildTarget
setlocal
set "T_TARGET=%~1"
for /f "tokens=1,2 delims=/" %%a in ("%T_TARGET%") do (
    set "T_OS=%%a"
    set "T_ARCH=%%b"
)
if not defined T_OS (
    echo [FAIL] bad target "%~1" -- expected GOOS/GOARCH, e.g. linux/amd64
    endlocal & exit /b 1
)
if not defined T_ARCH (
    echo [FAIL] bad target "%~1" -- expected GOOS/GOARCH, e.g. linux/amd64
    endlocal & exit /b 1
)

set "T_NAME=%APP_NAME%-%T_OS%-%T_ARCH%"
if /i "%T_OS%"=="windows" set "T_NAME=%T_NAME%.exe"

echo [build] %T_OS%/%T_ARCH%  to  %OUT_DIR%\%T_NAME%
set "GOOS=%T_OS%"
set "GOARCH=%T_ARCH%"
set "CGO_ENABLED=0"

go build -o "%OUT_DIR%\%T_NAME%" -ldflags "%LDFLAGS%" -tags "%BUILD_TAGS%" .
if errorlevel 1 (
    echo [FAIL] %T_OS%/%T_ARCH%
    endlocal & exit /b 1
)
echo [ OK ] %T_OS%/%T_ARCH%
endlocal & exit /b 0

:usage
echo Usage:
echo   build.bat                            cross-build all default targets into build\
echo   build.bat windows/amd64 linux/arm64  cross-build only the listed targets
echo   build.bat help                       show this help
echo.
echo Default targets:
echo   %DEFAULT_TARGETS%
echo.
echo Environment variables:
echo   APP_NAME      base name of the output binaries        default: openlist
echo   OUT_DIR       output directory                        default: build
echo   BUILD_TAGS    extra "go build -tags" values           default: jsoniter
echo   TARGETS       space separated GOOS/GOARCH list
echo   GITHUB_TOKEN  avoids GitHub API rate limits
echo.
echo Examples:
echo   build.bat
echo   build.bat windows/amd64
echo   set APP_NAME=mylist ^&^& build.bat linux/amd64 darwin/arm64
exit /b 0
