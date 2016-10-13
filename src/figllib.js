/**
 * WebGL コンテキストをリサイズする
 *
 * 新しい WebGL コンテキストのビューポートの解像度は、コンテキストを取得した瞬間の 
 * canvas 要素の、CSS を適用しない状態の高さおよび幅が設定されます。
 * canvas 要素のスタイルを変更すると表示サイズが変化しますが、レンダリング解像度は変化しません。
 * コンテキストを生成した後に canvas 要素の width および height 属性を変更した場合も、描画するピクセル数は変化しません。
 * ドキュメント全体が canvas であるウィンドウをユーザがリサイズしたときや、アプリ内で調節可能なグラフィックス設定を提供したい場合など、WebGL の描画解像度を変更するには、変更を知らせるために WebGL コンテキストの viewport() 関数を呼び出さなければならないでしょう。
 * 前出の例で使用した変数 gl および canvas の WebGL コンテキストで描画解像度を変更する方法は以下のとおりです
 */
function set_csssize_viewport(gl, canvas) {
	gl.viewport(0, 0, canvas.width, canvs.height);
}