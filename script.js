// =========================
// 初期設定
// =========================

const inspectionData = {

    dailyList: [

        "ワイヤ経路の確認",
        "ワイヤ量(残時間)の確認",
        "加工液量(タンク)の確認",
        "イオン交換樹脂の残時間を確認",
        "上下電極ピンの確認",
        "使用済みワイヤ量の確認",
        "加工液比抵抗の確認",
        "テーブル面と加工槽の確認",
        "フィルタ圧の確認",
        "テーブルのランニング",
        "異音、振動等の異常の有無",
        "油漏れ、水漏れ等の確認",
        "機械各部の清掃"

    ],

    weeklyList: [

        "上下ノズルの確認",
        "ダイスガイドの確認・清掃",
        "下ガイドローラーの確認",
        "ワイヤの垂直確認",
        "シール板の清掃",
        "ストレーナの清掃",
        "比抵抗検出電極の清掃",
        "テンションセンサの調節",
        "昇降ドアシール部の清掃"

    ],

    otherList: [

        "フィルター交換",
        "ワイヤー交換"

    ],

    monthlyList: [

        "ブレーキシューの確認",
        "フィルタ清掃(制御部ロッカー)",
        "フィルタ清掃(クーラー部)",
        "AWFチャック部の確認",
        "AWF上パイプ部の確認",
        "AWFディテクト部の確認",
        "フィードドレインホース",
        "上下ガイド周りの清掃"

    ],

    threeMonthList: [

        "加工液の交換",
        "汚水槽水位検出子の清掃",
        "ガイド部(上下)の平行確認 20μm以下/20mm",
        "ワイヤーの垂直調整",
        "フィード部の確認",
        "シール板の清掃",
        "プレシールジャバラの清掃",
        "クーラ内部の配管清掃"

    ],

    sixMonthList: [

        "グリスアップ（リニアガイド）",
        "グリスアップ（ボールネジ）",
        "グリスアップ（ドレイン軸）"

    ],

    yearlyList: [

        "フェルトパッドの交換"

    ]

};

// =========================
// 今日の日付
// =========================

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("inspectionDate").value =
        new Date().toISOString().split("T")[0];

    createInspectionItems();

    initializeAccordion();

    loadLocalData();

});

// =========================
// 項目生成
// =========================

function createInspectionItems() {

    Object.keys(inspectionData).forEach(listId => {

        const container = document.getElementById(listId);

        if (!container) return;

        inspectionData[listId].forEach(item => {

            const row = document.createElement("div");
            row.className = "item-row";

            row.innerHTML = `

                <div class="item-name">
                    ${item}
                </div>

                <div class="result-buttons">

                    <button
                        class="ok-btn"
                        onclick="selectResult(this,'OK')">
                        ✓ 正常
                    </button>

                    <button
                        class="ng-btn"
                        onclick="selectResult(this,'NG')">
                        ✕ 異常
                    </button>

                </div>

                <div class="ng-comment">

                    <textarea
                        placeholder="異常内容を入力"></textarea>

                </div>

            `;

            container.appendChild(row);

        });

    });

}

// =========================
// 判定選択
// =========================

function selectResult(button,result){

    const row =
        button.closest(".item-row");

    const okBtn =
        row.querySelector(".ok-btn");

    const ngBtn =
        row.querySelector(".ng-btn");

    const comment =
        row.querySelector(".ng-comment");

    okBtn.classList.remove("active");
    ngBtn.classList.remove("active");

    button.classList.add("active");

    if(result==="NG"){

        comment.style.display="block";

    }else{

        comment.style.display="none";

    }

    saveLocalData();

}
// =========================
// 開閉
// =========================

document.querySelectorAll(".section-btn")
.forEach(btn => {

    btn.addEventListener("click", () => {

        const content =
            btn.nextElementSibling;

        if(
            content.style.display === "none" ||
            content.style.display === ""
        ){

            content.style.display = "block";

        }else{

            content.style.display = "none";

        }

    });

});

// =========================
// 保存ボタン
// =========================

document
.getElementById("saveBtn")
.addEventListener("click", () => {

    alert("保存機能は次工程(Firebase版)で実装");

});

// =========================
// 履歴ボタン
// =========================

document
.getElementById("historyBtn")
.addEventListener("click", () => {

    alert("履歴機能は次工程で実装");

});

// =========================
// Excelボタン
// =========================

document
.getElementById("excelBtn")
.addEventListener("click", () => {

    alert("Excel出力機能は次工程で実装");

});

// =========================
// アコーディオン
// =========================

function initializeAccordion(){

    document
    .querySelectorAll(".inspection-content")
    .forEach(content=>{

        content.style.display="none";

    });

    document
    .querySelectorAll(".section-btn")
    .forEach(btn=>{

        btn.addEventListener("click",()=>{

            const current =
                btn.nextElementSibling;

            document
            .querySelectorAll(".inspection-content")
            .forEach(content=>{

                if(content!==current){

                    content.style.display="none";

                }

            });

            if(current.style.display==="block"){

                current.style.display="none";

            }else{

                current.style.display="block";

            }

        });

    });

}

// =========================
// LocalStorage保存
// =========================

function loadLocalData(){

    const saved=
        localStorage.getItem(
            "inspectionDraft"
        );

    if(!saved) return;

    const data=
        JSON.parse(saved);

    const rows=
        document.querySelectorAll(
            ".item-row"
        );

    data.forEach((item,index)=>{

        if(!rows[index]) return;

        const row=rows[index];

        const okBtn=
            row.querySelector(".ok-btn");

        const ngBtn=
            row.querySelector(".ng-btn");

        const textarea=
            row.querySelector("textarea");

        const comment=
            row.querySelector(".ng-comment");

        if(item.ok){

            okBtn.classList.add("active");

        }

        if(item.ng){

            ngBtn.classList.add("active");

            comment.style.display="block";

        }

        textarea.value=
            item.comment || "";

    });

}
    localStorage.setItem(
        "inspectionDraft",
        JSON.stringify(data)
    );

}

document.addEventListener("input",e=>{

    if(
        e.target.tagName==="TEXTAREA"
    ){

        saveLocalData();

    }

});
