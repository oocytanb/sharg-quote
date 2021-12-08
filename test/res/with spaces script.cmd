@rem SPDX-License-Identifier: MIT

@setlocal ENABLEDELAYEDEXPANSION

@set als=%~1
@set uls=%~1

@if "%~1"=="" (
  @set acnt=0
) else (
  @set acnt=1
)

@set cnt=1
@shift

:argloop

@set uls=%uls%, %~1

@if "%~1"=="" (
  @if %cnt% gtr 9 goto argend
) else (
  @set acnt=!cnt!
  @set als=!uls!
)

@shift
@set /a cnt=%cnt%+1

@goto argloop

:argend

@if %acnt% equ 0 (
  @echo __EMPTY__
) else (
  @echo [%als%]
)

@endlocal
