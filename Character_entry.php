<?php ob_start(); ?>
<!DOCTYPE html>
<html lang="jp">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>アニメキャラクター登録画面</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <?php
    //if (!isset($_POST['推し活診断']) || !isset($_POST['プロフィールからの登録'])) {
    //    exit('不正なアクセスです。');
    //}
    ?>
    <main>
        <h1>推し活×SNS</h1>
        <?php
        if (isset($_GET['SUB2'])) { ?>
            <h2>推し診断結果</h2>
        <?php
        } elseif (isset($_GET['SUB1'])) { ?>
            <h2>推し追加</h2>
        <?php
        }
        if (isset($_POST['charcterName'])) {
            $charcterName = $_POST['charcterName'];
            $animeName = $_POST['animeName'];
            $charcterImage = $_POST['charcterImage'];
        } else {
            $charcterName = "";
            $animeName = "";
            $charcterImage = "";
        }
        ?>

        <!-- AJAX リクエストの場合のみ resultArea 断片を返す -->
        <?php if (isset($_POST['ajax']) && $_POST['ajax'] == '1'):
            // Clear any output buffering so we return only the fragment.
            while (ob_get_level()) {
                ob_end_clean();
            }
        ?>
            <div id="resultArea">
                <div class="aaa">
                    <div class="name">
                        <h3>キャラ名</h3>
                        <?php echo '<h4>' . htmlspecialchars($charcterName, ENT_QUOTES) . '</h4>'; ?>
                        <form id="searchForm" method="post">
                            <input type="text" id="searchInput" name="search" value="<?php echo htmlspecialchars($charcterName ?? '', ENT_QUOTES); ?>" class="abc">
                            <br>
                            <button type="submit" id="searchBtn">検索</button>
                        </form>
                        <h3>アニメ名</h3>
                        <?php echo '<h4>' . htmlspecialchars($animeName, ENT_QUOTES) . '</h4>'; ?>
                    </div>
                    <div class="bbb">
                        <h3>キャラクター画像</h3>
                        <img src="<?php echo htmlspecialchars($charcterImage, ENT_QUOTES); ?>" alt="<?php echo htmlspecialchars($charcterName, ENT_QUOTES); ?>" width="200">
                    </div>
                </div>
                <hr>
                <p>この推し（推しキャラ）を登録しますか？</p>
                <?php
                // Decide form action based on GET flags, but always render a registration form
                $action_file = '';
                if (isset($_GET['SUB1'])) {
                    $action_file = 'profile.php';
                } elseif (isset($_GET['SUB2'])) {
                    $action_file = 'aaa.php';
                }
                if ($action_file !== '') {
                ?>
                    <form action="<?php echo htmlspecialchars($action_file, ENT_QUOTES); ?>" method="post">
                        <input type="hidden" name="charcterName" value="<?php echo htmlspecialchars($charcterName, ENT_QUOTES); ?>">
                        <input type="hidden" name="animeName" value="<?php echo htmlspecialchars($animeName, ENT_QUOTES); ?>">
                        <input type="hidden" name="charcterImage" value="<?php echo htmlspecialchars($charcterImage, ENT_QUOTES); ?>">
                        <button type="submit" name="登録完了">登録する</button>
                    </form>
                <?php
                } else {
                    // どちらの条件も満たされない場合は、登録ボタンは表示しない方が安全です。
                    echo '<p>登録先が設定されていません。</p>';
                }
                ?>
            </div>

        <?php exit;
        endif; ?>

        <!-- 通常のページ表示 -->
        <div id="resultArea">
            <div class="aaa">
                <div class="name">
                    <h3>キャラ名</h3>
                    <form id="searchForm" method="post">
                        <input type="text" id="searchInput" name="search" class="abc" placeholder="キャラ名を入力">
                        <br>
                        <button type="submit">検索</button>
                    </form>
                    <h3>アニメ名</h3>
                    <?php echo '<h4>' . htmlspecialchars($animeName, ENT_QUOTES) . '</h4>'; ?>
                </div>
                <div class="bbb">
                    <h3>キャラクター画像</h3>
                    <?php if ($charcterImage): ?>
                        <img src="<?php echo htmlspecialchars($charcterImage, ENT_QUOTES); ?>" alt="<?php echo htmlspecialchars($charcterName, ENT_QUOTES); ?>" width="200">
                    <?php else: ?>
                        <p>画像がまだ選択されていません</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <?php
        if (isset($_GET['SUB1'])) {
        ?>
            <br><a href="Character_entry.php?SUB1=1">別のキャラを検索</a>
            <p><a href="Account_display.php">アカウント画面へ戻る</a></p>
        <?php
        } elseif (isset($_GET['SUB2'])) {
        ?>
            <p><a href="diagnosis.php">診断画面へ戻る</a></p>
        <?php
        }
        ?>
    </main>
    <script>
        // サーバー側で送信されたsearch値をJSで使えるようにする
        window.serverSearch = <?php echo json_encode($_POST['search'] ?? ''); ?>;
    </script>
    <script src="aaaa.js"></script>
</body>

</html>