@echo off

:: Set timestamp for unique backup filenames
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value ^| find "="') do set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%

:: Define paths and credentials
set ENV_FILE=.\.env
set BACKUP_DIR=.\backups
set BACKUP_FILE=backup_%timestamp%.dump

:: Load environment variables from .env file
if not exist %ENV_FILE% (
    echo ERROR: .env file not found!
    exit /b 1
)

for /f "tokens=1,2 delims==" %%I in (%ENV_FILE%) do (
    set %%I=%%J
)

:: Ensure backup directory exists
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

:: Set the password for pg_dump
set PGPASSWORD=%PG_PASSWORD%

:: Perform the backup
echo Backing up database from %PG_HOST%...
pg_dump -U %PG_USER% -h %PG_HOST% -p %PG_PORT% -d %PG_DB% -F c -b -v -f "%BACKUP_DIR%\%BACKUP_FILE%"

:: Check if the backup was successful
if %errorlevel% neq 0 (
    echo Backup failed!
    exit /b %errorlevel%
) else (
    echo Backup completed successfully: %BACKUP_DIR%\%BACKUP_FILE%
)

:: Clean up the password variable for security
set PGPASSWORD=

pause
