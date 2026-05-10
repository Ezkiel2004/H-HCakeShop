$target = "d:\Downloads\velvra-ecommerce.html"
$mainJsPath = "c:\xampp\htdocs\cake-saas\velvra\js\main.js"
$indexPath = "c:\xampp\htdocs\cake-saas\velvra\index.html"

$content = Get-Content -Path $target -Encoding UTF8

$content[928..2486] | Set-Content -Path $mainJsPath -Encoding UTF8

$part1 = $content[0..8]
$part2 = "  <link rel=`"stylesheet`" href=`"css/style.css`">"
$part3 = $content[441..926]
$part4 = "  <script src=`"js/main.js`"></script>"
$part5 = $content[2488..($content.Length - 1)]

Set-Content -Path $indexPath -Value $part1 -Encoding UTF8
Add-Content -Path $indexPath -Value $part2 -Encoding UTF8
Add-Content -Path $indexPath -Value $part3 -Encoding UTF8
Add-Content -Path $indexPath -Value $part4 -Encoding UTF8
Add-Content -Path $indexPath -Value $part5 -Encoding UTF8
