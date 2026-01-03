Set oShell = CreateObject ("Wscript.Shell") 
Dim strArgs
strArgs = "cmd /c cd /d D:\xampp\htdocs\finance-arg\server && npx tsx src/index.ts"
oShell.Run strArgs, 0, false
