## Run this script AS ADMINISTRATOR to reset the MySQL root password
## 
## HOW TO USE:
## 1. Press Win + X → "Windows Terminal (Admin)" or "PowerShell (Admin)"
## 2. Copy and paste the commands below into the Admin terminal
##
## ──────────────────────────────────────────────────────────────

$newPassword = "FitTrack123!"
$mysqlDir = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$initFile = "$env:TEMP\mysql_init.sql"

Set-Content $initFile "ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '$newPassword'; FLUSH PRIVILEGES;"

Stop-Service MySQL80 -Force; Start-Sleep 3

$p = Start-Process "$mysqlDir\mysqld.exe" "--init-file=$initFile --console" -PassThru -NoNewWindow
Start-Sleep 8

Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue; Start-Sleep 3

Start-Service MySQL80; Start-Sleep 5

& "$mysqlDir\mysql.exe" -u root "--password=$newPassword" -e "SELECT 'Password reset OK!';" 2>&1
