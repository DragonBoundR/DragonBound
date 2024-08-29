@echo off
REM Navigate to the legacy directory and run the web development server in a new command prompt window
cd /d "C:\DragonBound-Refactored\legacy"
start cmd /k "npm run start:web"

REM Navigate to the src directory and run the game development server in a new command prompt window
cd /d "C:\DragonBound-Refactored\src"
start cmd /k "npm run start:game"

REM Navigate to the src directory and run the scheduler in a new command prompt window
cd /d "C:\DragonBound-Refactored\src"
start cmd /k "npm run start:scheduler"