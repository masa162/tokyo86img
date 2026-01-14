# 2026 1月14日unbelongの開発をすすめましょう

/Users/nakayamamasayuki/Documents/GitHub/unbelong/docs/IMAGE_MANAGEMENT_LOGIC.md
大体このあたりを実装したい、
作業する前にplanモードみたいのはgemini on antigravityだとどういうふうに定義したり、指示すればいいの？



前回の対話を一応共有しておきます
/Users/nakayamamasayuki/Documents/GitHub/unbelong/temp/IMPLEMENTATION_PLAN_20260114.md

この
tempのフォルダを一応、gitignoreに含めておいてください

で、箱バッチで100枚とかuploadするときと、
単品でなるべくなんにも考えずに、ぱっとuploadしたいとき
これは、両立できる？
単品のときは、ランダム英数字6文字とかslug自動生成で


/Users/nakayamamasayuki/Documents/GitHub/unbelong/temp/memo_unbelong260113.md
ごめん、まちがえた共有したいのはこっちだった、入れ替えた


https://unbelong-hono-admin.pages.dev/
まったく管理画面変わってないよ

dreamcatcher

OK,一括uploadできました。
![](https://img.unbelong.xyz/3m6gx4/001.webp)
![](https://img.unbelong.xyz/3m6gx4/002.webp)
![](https://img.unbelong.xyz/3m6gx4/003.webp)
![](https://img.unbelong.xyz/3m6gx4/004.webp)


いいですね、

そのまえに1点、
https://unbelong-hono-admin.pages.dev/

最近のアップロード（ギャラリー）
の一覧で、ID→c424ed47-fd5d-4cf0-bcf8-5bf464139600
などが取得できますが、
さらに直感的に
https://img.unbelong.xyz/3m6gx4/001.webp
など、URLコピーもできるようにしたい



このあたり、cloudflare imagesの仕様について教えて下さい
元画像、jpegとかpngとかでも、webP？とかに最適化されて表示されるのかな？

素晴らしい

ID→c424ed47-fd5d-4cf0-bcf8-5bf464139600
URL→https://img.unbelong.xyz/3m6gx4/004.webp

https://imagedelivery.net/wdR9enbrkaPsEgUtgFORrw/c424ed47-fd5d-4cf0-bcf8-5bf464139600/public
URLを叩くと、表示されるのは↑になる、
リダイレクトされてるってこと？
API？

視聴者が、リツイートとか、引用とかリポストとかしてくれる際に、
このあたりはどのようになるのか？
どっちがいいとか？、注意することとか、あったら教えて下さい


https://imagedelivery.net/wdR9enbrkaPsEgUtgFORrw/1534c857-b4a9-4063-0235-c8a5912d9800/public


basic認証で入れなくなった、さっき、ダッシュボードでデプロイコマンドとか変えたからかな？

OK,basic認証は入れた、
https://imagedelivery.net/wdR9enbrkaPsEgUtgFORrw/1534c857-b4a9-4063-0235-c8a5912d9800/public
っていう
縦長のwebtoon想定の画像1000_4000ptをアップロードしてみたけど、
PCでも、スマホでも、縦がまるまるおさまるかたちに最適化されて、表示されてしまう
スクロールしてもらえる前提で
webtoon想定の画像1000_4000ptを作ってるんだが、
解決策ある？
もしくは、制作のフローを変えたほうが解決しやすいだろうか？



cloudflare imagesも賢くて、出し先によって、サイズ最適化を図ろうとするし、
視聴者のブラウザによっても、サイズ最適化を図ろうとするんだね、

だとするなら、ある程度こっちで意図した、伝え方をしようとは頑張るけど、コントロール仕切るのはむずいよね、
2000年代WEBのブラウザ表示問題とかのジレンマはいつまでたっても、
こういうところであるよね、

そして、そのことを気にしだすと、きりがないので、
ある程度一般的な方法をその時その時でとっておくしかない、
それ以上やるのは、手で水をすくおうとするようなもので、効率よくない、経験的にしってる。

2000_2000ptのスクエアに１枚ずつ分割して、
webtoonはさきほどの一括バッチuploadするかたちで、
運用するのが良さそうですね

2000_2000ptのスクエアなら、
環境によって、縦か、横か、
PCなら縦が飽和するかたちで、
スマホなら横が飽和するかたちで、

かつ連続して表示されていく

webtoonのテストをしましょう、
![](https://img.unbelong.xyz/5szfba/001.webp)
![](https://img.unbelong.xyz/5szfba/002.webp)
![](https://img.unbelong.xyz/5szfba/003.webp)

https://unbelong-hono-admin.pages.dev/batches/new

管理画面からバッチ箱をuploadしました。
改善希望

バッチ箱
の単位で、ギャラリーしたい、可視化したい、
![](https://img.unbelong.xyz/5szfba/001.webp)
![](https://img.unbelong.xyz/5szfba/002.webp)
![](https://img.unbelong.xyz/5szfba/003.webp)
などのMD出力がコピペしたい、
欲をいえばCRUDできるといい、


ダッシュボードルート
https://unbelong-hono-admin.pages.dev/

最近のアップロード（ギャラリー）
でも、個々の画像をCRUD、（主に削除）したい、
間違いを恐れずに、気軽にupして、
ちょっと、間違ってた、とか、ちがうファイルupしてた、
とかをどんどん削除したい、
チェックボッスクで、複数選択して、まとめて削除したい

このときの（削除）はD1からも、cloudflare imagesからも完全に削除

バッチ（箱）一覧
https://unbelong-hono-admin.pages.dev/batches
ここでも（削除）はD1からも、cloudflare imagesからも完全に削除したい


フィードバックします、
ダッシュボードルート
https://unbelong-hono-admin.pages.dev/

バッチ（箱）一覧
https://unbelong-hono-admin.pages.dev/batches

削除しようとすると
どちらも、失敗します、
デバッグお願いします
wrangler使用許可します


フィードバックします、
ダッシュボードルート
https://unbelong-hono-admin.pages.dev/


バッチ（箱）一覧
https://unbelong-hono-admin.pages.dev/batches


どちらも削除できた

OK,解決できた
ありがとうございます


では、一度m休憩しましょう、
ここまでの進捗を含め実装したことを
/Users/nakayamamasayuki/Documents/GitHub/unbelong/docs/PRD.md
/Users/nakayamamasayuki/Documents/GitHub/unbelong/docs/SYSTEM_ARCHITECTURE.md
に更新しておいてください


260114
unbelong開発をすすめましょう


では、箱バッチでuploadした画像をもとに、
webtoon展開する方向ですすめましょう、

管理画面
作品・マンガ管理
https://unbelong-hono-admin.pages.dev/works

今まだ、モックアップ程度になっているので、
新規作成
CRUDできるようにする

フロント
https://comic.unbelong.xyz/
で表示できるようにする、

docs/IMPLEMENTATION_PLAN_20260114.md を作成してください


https://unbelong-hono-admin.pages.dev/works/new
新規作成しようとしました。
失敗します、

wrangler使用許可します
debugお願いします

フィードバックします、
エピソード作成しました
https://unbelong-hono-admin.pages.dev/episodes/c07aaec5-ab53-4ff6-a703-669d5ec037e7/edit

エピソード詳細編集、
published,draft
切り替えられるようにしたい、
デフォルトで、publishedで作成されるようにしたい

https://unbelong-hono-admin.pages.dev/episodes/c07aaec5-ab53-4ff6-a703-669d5ec037e7/edit

https://comic.unbelong.xyz/viewer/z9qj

![](https://img.unbelong.xyz/5szfba/001.webp)
![](https://img.unbelong.xyz/5szfba/002.webp)
![](https://img.unbelong.xyz/5szfba/003.webp)

