# three.js、ammo.js と捻り技

大昔に作った<a href="http://userweb.pep.ne.jp/tamubun/computer/sharin_sim.html">車輪シミュレーター</a>を、ブラウザアプリにして、
更に、出来る技も増やしたいと思い始めました。3Dの表示と物理シミュレーションには、
<a href="https://threejs.org/">three.js</a>が使い慣れてて良いのですが、現在の three.js には、
体操の技のシミュレーションを行う上で、捻り運動をシミュレート出来ないと言う大きな問題があります。

以下、詳しい説明。

three.js は、物理シミュレーションを行うライブラリーに、<a href="https://github.com/kripken/ammo.js">ammo.js</a>を使っています。
この ammo.js は、C++で書かれた<a href="https://pybullet.org/wordpress/">Bullet physics engine</a>を、
機械的にJavascriptに翻訳したライブラリーです。大元の Bullet physics engine は、
バージョン2.83以降(最新版は2.88)になって、<u>BT_ENABLE_GYROPSCOPIC_FORCE</u>というフラグが導入され、
捻り運動のシミュレーションが行えるようになりました。ところが、ammo.js は、バージョン2.83 が出て何年も経つのに、
いつまでも、捻りに対応してないバージョン2.82 を元にし続けています。three.jsの最新版(r108)に入っている ammo.js も同様です。

昔作った車輪シミュレーターは、蹴上り、翻転、車輪、宙返りなど、捻りに関係ない技しかシミュレート出来なかったので、
似たものを作るなら上の問題は気にしなくて良いのですが、どうせ作り直すなら捻り技も出来るようにしたいので、上の問題は深刻です。

自分で ammo.js をバージョン 2.83以降に対応させようとするのは、凄く大変そうで諦めました。
そこで、誰かがやってくれてないか、ammo.js の<a href="https://github.com/kripken/ammo.js/network/members">フォーク 264件</a>
全部調べてみました。その結果、候補になりそうなのが4件だけ見つかりました:
<ul>
  <li><a href="https://github.com/WhitestormJS/AmmoNext">2.85ベース</a>
  - 動かず。</li>
  <li><a href="https://github.com/Mwni/AmmoNext">上のやつの更に派生</a>
  - こちらは動いて、捻りがシミュレートできた。他にも幾つか派生があったが、これが一番コミットが進んでる。</li>
  <li><a href="https://github.com/dongch007/ammo.js">2.88ベース</a>
  - 動かず。</li>
  <li><a href="https://github.com/thehink/ammo.js">2.88ベース</a>
  - 捻りがシミュレートできた。</li>
</ul>

捻れたのは2件。最新の 2.88ベースの方がいいので、最後のを使おうかな、と思っています。調べた時の最新のコミットは1312393(2019/5/9)でした。

実験コードを<a href="http://userweb.pep.ne.jp/tamubun/computer/ammo_expr">ここ</a>に置いておきます。
