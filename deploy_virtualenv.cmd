Skip to content
 
Search or jump to…

Pull requests
Issues
Marketplace
Explore
 @andresdaguilar Sign out
11
2 1 theirc/Emergency-Assessments-App Private
 Code  Issues 0  Pull requests 0  Projects 0  Wiki  Insights
Emergency-Assessments-App/deploy_virtualenv.cmd
72bcbf8  on 21 Apr
@reyrodrigues reyrodrigues Deploy.sh and Azure Settings
     
132 lines (95 sloc)  2.98 KB
@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.15
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

goto Deployment


:: Utility Functions
:: -----------------

:SelectPythonVersion

IF DEFINED KUDU_SELECT_PYTHON_VERSION_CMD (
  call %KUDU_SELECT_PYTHON_VERSION_CMD% "%DEPLOYMENT_SOURCE%" "%DEPLOYMENT_TARGET%" "%DEPLOYMENT_TEMP%"
  IF !ERRORLEVEL! NEQ 0 goto error

  SET /P PYTHON_RUNTIME=<"%DEPLOYMENT_TEMP%\__PYTHON_RUNTIME.tmp"
  IF !ERRORLEVEL! NEQ 0 goto error

  SET /P PYTHON_VER=<"%DEPLOYMENT_TEMP%\__PYTHON_VER.tmp"
  IF !ERRORLEVEL! NEQ 0 goto error

  SET /P PYTHON_EXE=<"%DEPLOYMENT_TEMP%\__PYTHON_EXE.tmp"
  IF !ERRORLEVEL! NEQ 0 goto error

  SET /P PYTHON_ENV_MODULE=<"%DEPLOYMENT_TEMP%\__PYTHON_ENV_MODULE.tmp"
  IF !ERRORLEVEL! NEQ 0 goto error
) ELSE (
  SET PYTHON_RUNTIME=python-2.7
  SET PYTHON_VER=2.7
  SET PYTHON_EXE=%SYSTEMDRIVE%\python27\python.exe
  SET PYTHON_ENV_MODULE=virtualenv
)

goto :EOF

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

:Deployment


:: 2. Select Python version
call :SelectPythonVersion

echo %PYTHON_VER% SELECTED

pushd "%DEPLOYMENT_TARGET%"

:: 3. Create virtual environment
IF NOT EXIST "%DEPLOYMENT_TARGET%\env\azure.env.%PYTHON_RUNTIME%.txt" (
  IF EXIST "%DEPLOYMENT_TARGET%\env" (
    echo Deleting incompatible virtual environment.
    rmdir /q /s "%DEPLOYMENT_TARGET%\env"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  echo Creating %PYTHON_RUNTIME% virtual environment.
  %PYTHON_EXE% -m %PYTHON_ENV_MODULE% env
  IF !ERRORLEVEL! NEQ 0 goto error

  copy /y NUL "%DEPLOYMENT_TARGET%\env\azure.env.%PYTHON_RUNTIME%.txt" >NUL
) ELSE (
  echo Found compatible virtual environment.
)

:postPython

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
© 2018 GitHub, Inc.
Terms
Privacy
Security
Status
Help
Contact GitHub
Pricing
API
Training
Blog
About
Press h to open a hovercard with more details.