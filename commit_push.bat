SET mypath=%~dp0
cd %mypath%
set /P eingabe=
git add --a
git commit -m "%eingabe%"
git push --all
pause