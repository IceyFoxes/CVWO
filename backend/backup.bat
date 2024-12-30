@echo off
setlocal

:: Set variables
set TIMESTAMP=%DATE:~-4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%
set BACKUP_DIR=C:\Users\zhang\CVWO\backend\autobackups
set DATABASE_PATH=C:\Users\zhang\CVWO\backend\forum.db
set BACKUP_FILE=%BACKUP_DIR%\forum_backup_%TIMESTAMP%.db

:: Ensure backup directory exists
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

:: Backup the SQLite3 database
copy "%DATABASE_PATH%" "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo Backup completed successfully: %BACKUP_FILE%
) else (
    echo Backup failed. Please check the file paths and permissions.
)

endlocal
