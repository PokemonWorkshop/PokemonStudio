<#
.SYNOPSIS
Boot a PSDK project, capture its console, then close it.

.DESCRIPTION
psdk.bat runs the game through ruby.exe, so everything PSDK prints -- including
the "[Tiled2Rxdata] Processing Map ..." lines that say whether a map was
reconverted -- lands on stdout. This launches it, captures that output, waits
long enough to boot and convert, then kills it.

Booting is all that is needed to trigger the .tmx -> .rxdata conversion, so this
is the "launch the game" half of verifying a map change with nobody at the
keyboard. Pair it with tools/inspect_map.py to check what the conversion made.

Deliberately free of backtick escapes and line continuations: those are the
easiest thing to mangle when a file is rewritten, and a parser error here looks
exactly like a broken test.

.PARAMETER Project
Path to the PSDK project (the folder holding psdk.bat and Game.rb).

.PARAMETER Seconds
How long to let it run before killing it. Default 25; boot plus conversion is
normally a few seconds, the rest is slack for a cold start.

.EXAMPLE
powershell -File tools/run_game.ps1 -Project "C:\...\Forked Studio Project"
#>
param(
    [Parameter(Mandatory = $true)][string]$Project,
    [int]$Seconds = 25,
    # A file of Ruby lines fed to PSDK's interactive console on stdin. The boot
    # log ends at a "Command:" prompt, so the game will execute whatever is
    # piped in — which is how we ask the running game what it actually thinks,
    # rather than inferring behaviour from the data files.
    [string]$CommandsFile = '',
    # Passed through to psdk.bat. "debug skip_title" is what debug_fast.bat
    # uses: Scene_Title jumps straight to :action_play_game, so the probe lands
    # in a loaded game instead of sitting on the title with no $game_map.
    [string]$GameArgs = 'debug skip_title'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path (Join-Path $Project 'psdk.bat'))) {
    throw "No psdk.bat in '$Project' - is that a PSDK project folder?"
}

# Resolve to a real Windows path: a forward-slash relative path is fine for
# PowerShell but cmd.exe will not find the batch file from it.
$Project = (Resolve-Path $Project).Path
$batch = Join-Path $Project 'psdk.bat'

# Write a tiny wrapper .bat rather than fighting cmd.exe's /c quoting rules,
# which mangle two space-containing paths plus a redirect.
$wrapper = Join-Path $env:TEMP ('psdk_wrap_' + (Get-Random) + '.bat')
$lines = @('@echo off', ('cd /d "' + $Project + '"'))
if ($CommandsFile) {
    $CommandsFile = (Resolve-Path $CommandsFile).Path
    $lines += ('"' + $batch + '" ' + $GameArgs + ' < "' + $CommandsFile + '"')
} else {
    $lines += ('"' + $batch + '" ' + $GameArgs)
}
Set-Content -Path $wrapper -Value $lines -Encoding ASCII

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$log = Join-Path $env:TEMP ('psdk_run_' + $stamp + '.log')
$errLog = $log + '.err'
Write-Host ('Booting PSDK; console -> ' + $log)

$startArgs = @{
    FilePath               = 'cmd.exe'
    ArgumentList           = @('/c', $wrapper)
    WorkingDirectory       = $Project
    RedirectStandardOutput = $log
    RedirectStandardError  = $errLog
    NoNewWindow            = $true
    PassThru               = $true
}
$proc = Start-Process @startArgs

$deadline = (Get-Date).AddSeconds($Seconds)
while ((-not $proc.HasExited) -and ((Get-Date) -lt $deadline)) {
    Start-Sleep -Milliseconds 250
}

if (-not $proc.HasExited) {
    Write-Host ('Ran ' + $Seconds + 's, stopping.')
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}

# ruby.exe is spawned by psdk.bat and outlives cmd.exe, so clear it out too or
# the next run fights a game still holding the data files open.
Get-Process -Name 'ruby' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host '--- console ---'
if (Test-Path $log) { Get-Content $log }
if ((Test-Path $errLog) -and ((Get-Item $errLog).Length -gt 0)) {
    Write-Host ''
    Write-Host '--- stderr ---'
    Get-Content $errLog
}
Write-Host ''
Write-Host ('log: ' + $log)
