@echo off
setlocal

rem ============================================================
rem  OpenList - Windows build script
rem
rem  Batch equivalent of the shell build target:
rem    go build -ldflags="-w -s -X ..." .
rem
rem  Put this file in the repository root and run it from there.
rem  Requires: go, git, curl (curl ships with Windows 10 1803+).
rem
rem  Optional: set GITHUB_TOKEN to avoid GitHub API rate limits
rem            when resolving the frontend version.
rem ============================================================

cd /d "%~dp0"

set "PKG=github.com/OpenListTeam/OpenList/v4/internal/conf"
set "FRONTEND_REPO=OpenListTeam/OpenList-Frontend"

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
set "LDFLAGS=%LDFLAGS% -X '%PKG%.BuiltAt=%BUILT_AT%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GoVersion=%GO_VERSION%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GitAuthor=%GIT_AUTHOR%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.GitCommit=%GIT_COMMIT%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.Version=%APP_VERSION%'"
set "LDFLAGS=%LDFLAGS% -X '%PKG%.WebVersion=%WEB_VERSION%'"

echo.
echo   BuiltAt    : %BUILT_AT%
echo   GoVersion  : %GO_VERSION%
echo   GitAuthor  : "%GIT_AUTHOR%"
echo   GitCommit  : %GIT_COMMIT%
echo   Version    : %APP_VERSION%
echo   WebVersion : %WEB_VERSION%
echo.
echo Building...

go build -ldflags "%LDFLAGS%" .
if errorlevel 1 (
    echo.
    echo Build FAILED.
    exit /b 1
)

echo.
echo Build OK.
endlocal
