@echo off
setlocal 

:: Definir las rutas comunes donde MongoDB podría estar instalado
set "USER_PATH=%LOCALAPPDATA%\MongoDB\bin\mongod.exe"
set "SYSTEM_PATH=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
set "DB_PATH=C:\data\db"



if not exist "%DB_PATH%" (
    mkdir "%DB_PATH%"
)

:: Verificar si MongoDB está instalado a nivel de usuario
if exist "%USER_PATH%" (
    echo MongoDB encontrado en la ruta de usuario.
    set MONGODB_PATH=%USER_PATH%
    goto RUN_MONGODB
)


:: Verificar si MongoDB está instalado a nivel de sistema

if exist "%SYSTEM_PATH%" (
    echo MongoDB encontrado en la ruta del sistema.
    set MONGODB_PATH=%SYSTEM_PATH%
    goto RUN_MONGODB
)


:: Si no se encuentra MongoDB, mostrar un mensaje y salir
echo MongoDB no esta instalado o no se pudo encontrar.
@REM echo  "%MONGODB_PATH%" "%USER_PATH%" "%SYSTEM_PATH%" ""
goto :EOF

:RUN_MONGODB
echo Ejecutando MongoDB desde: %MONGODB_PATH%
echo "%MONGODB_PATH%"
echo. 
start "" "%MONGODB_PATH%"

:: Pausa para ver el resultado
@REM pause