import {
    db,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "./firebase.js";

/* =========================
   点検マスタ
========================= */
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

/* =========================
   初期化
========================= */

document.addEventListener("DOMContentLoaded", () => {

   const dateInput =
    document.getElementById("inspectionDate");

if (dateInput) {

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
        today.getDate()
    ).padStart(2, "0");

    dateInput.value =
        `${yyyy}-${mm}-${dd}`;
}

    createInspectionItems();

    initializeAccordion();

    loadInspectionByDate();

    document
        .getElementById("inspectionDate")
        ?.addEventListener(
            "change",
            handleDateChange
        );

    document
        .getElementById("saveBtn")
        ?.addEventListener(
            "click",
            saveInspection
        );

    document
        .getElementById("historyBtn")
        ?.addEventListener(
            "click",
            () => {

                location.href =
                    "logs.html";

            }
        );
let operationStatus = "";

const operationBtn =
    document.getElementById(
        "operationBtn"
    );

operationBtn?.addEventListener(
    "click",
    () => {

        if (operationStatus === "") {

            operationStatus = "RUN";

            operationBtn.textContent =
                "稼働";

            operationBtn.classList.add(
                "active"
            );

        }
        else if (
            operationStatus === "RUN"
        ) {

            operationStatus = "STOP";

            operationBtn.textContent =
                "非稼働";

        }
        else {

            operationStatus = "RUN";

            operationBtn.textContent =
                "稼働";

        }

    }
);

/* =========================
   日付変更
========================= */

function handleDateChange() {

    loadInspectionByDate();

}

/* =========================
   点検項目生成
========================= */

function createInspectionItems() {

    Object.keys(inspectionData)
        .forEach(listId => {

            const container =
                document.getElementById(listId);

            if (!container) return;

            inspectionData[listId]
                .forEach(item => {

                    const row =
                        document.createElement("div");

                    row.className =
                        "item-row";

                    row.innerHTML = `
                        <div class="item-name">
                            ${item}
                        </div>

                        <div class="result-buttons">

                            <button
                                type="button"
                                class="ok-btn">
                                ✓ 正常
                            </button>

                            <button
                                type="button"
                                class="ng-btn">
                                ✕ 異常
                            </button>

                        </div>

                        <div
                            class="ng-comment"
                            style="display:none;">

                            <textarea
                                placeholder="異常内容を入力">
                            </textarea>

                        </div>
                    `;

                    const okBtn =
                        row.querySelector(".ok-btn");

                    const ngBtn =
                        row.querySelector(".ng-btn");

                    const comment =
                        row.querySelector(".ng-comment");

                   okBtn.addEventListener(
    "click",
    () => {

        if (
            okBtn.classList.contains("active")
        ) {

            okBtn.classList.remove("active");

        } else {

            okBtn.classList.add("active");

            ngBtn.classList.remove("active");

        }

        comment.style.display = "none";

        saveLocalData();

    }
);

                   ngBtn.addEventListener(
    "click",
    () => {

        if (
            ngBtn.classList.contains("active")
        ) {

            ngBtn.classList.remove("active");

            comment.style.display =
                "none";

        } else {

            ngBtn.classList.add("active");

            okBtn.classList.remove("active");

            comment.style.display =
                "block";

        }

        saveLocalData();

    }
);
                    container.appendChild(row);
                });
        });
}
/* =========================
   アコーディオン
========================= */

function initializeAccordion() {

    document
        .querySelectorAll(".inspection-content")
        .forEach(content => {

            content.style.display = "none";

        });

    document
        .querySelectorAll(".section-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const current =
                    btn.nextElementSibling;

                document
                    .querySelectorAll(".inspection-content")
                    .forEach(content => {

                        if (content !== current) {

                            content.style.display =
                                "none";

                        }

                    });

                current.style.display =
                    current.style.display === "block"
                    ? "none"
                    : "block";

            });

        });

}

/* =========================
   Firebase保存
========================= */

async function saveInspection() {

    try {

        const machine =
            document.getElementById("machine").value;

        const date =
            document.getElementById("inspectionDate").value;

        const worker =
            document.getElementById("worker").value;

        const memo =
            document.getElementById("memo").value;

        if (!worker) {

            alert("点検者を入力してください");

            return;

        }

        const inspections = [];

        document
            .querySelectorAll(".item-row")
            .forEach(row => {

                let result = "";

                if (
                    row.querySelector(".ok-btn")
                    .classList.contains("active")
                ) {

                    result = "OK";

                }

                if (
                    row.querySelector(".ng-btn")
                    .classList.contains("active")
                ) {

                    result = "NG";

                }

                inspections.push({

                    category:
                        row.closest(".inspection-content")
                        ?.previousElementSibling
                        ?.textContent
                        ?.trim() || "",

                    item:
                        row.querySelector(".item-name")
                        .textContent
                        .trim(),

                    result,

                    comment:
                        row.querySelector("textarea")
                        .value || ""

                });

            });

        const docId =
            `${machine}_${date}`;

        await setDoc(

            doc(
                db,
                "inspections",
                docId
            ),

            {
                machine,
                date,
                worker,
                memo,
                operationStatus,
                inspections,

                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );

        localStorage.removeItem(
            "inspectionDraft"
        );

        alert("保存完了");

    }
    catch (error) {

        console.error(error);

        alert(
            "保存失敗\n" +
            error.message
        );

    }

}

/* =========================
   日付読込
========================= */

async function loadInspectionByDate() {

    try {

        const machine =
            document.getElementById("machine").value;

        const date =
            document.getElementById("inspectionDate").value;

        if (!machine || !date) return;

        const docId =
            `${machine}_${date}`;

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "inspections",
                    docId
                )
            );

        clearInspectionData();

        if (!snapshot.exists()) {

            return;

        }

        const data =
            snapshot.data();

        restoreInspectionData(data);

    }
    catch (error) {

        console.error(error);

    }

/* =========================
   画面クリア
========================= */

function clearInspectionData() {

    document
        .getElementById("worker")
        .value = "";

    document
        .getElementById("memo")
        .value = "";

    document
        .querySelectorAll(".item-row")
        .forEach(row => {

            row
                .querySelector(".ok-btn")
                .classList.remove("active");

            row
                .querySelector(".ng-btn")
                .classList.remove("active");

            row
                .querySelector("textarea")
                .value = "";

            row
                .querySelector(".ng-comment")
                .style.display = "none";

        });

}

/* =========================
   Firebase復元
========================= */

function restoreInspectionData(data) {

    document
        .getElementById("worker")
        .value =
        data.worker || "";

    document
        .getElementById("memo")
        .value =
        data.memo || "";
operationStatus =
    data.operationStatus || "";

if (operationBtn) {

    if (operationStatus === "RUN") {

        operationBtn.textContent =
            "稼働";

        operationBtn.classList.add(
            "active"
        );

    }
    else if (
        operationStatus === "STOP"
    ) {

        operationBtn.textContent =
            "非稼働";

        operationBtn.classList.add(
            "active"
        );

    }
    else {

        operationBtn.textContent =
            "稼働";

        operationBtn.classList.remove(
            "active"
        );

    }

}
    const rows =
        document.querySelectorAll(".item-row");

    (data.inspections || [])
        .forEach((saved, index) => {

            const row =
                rows[index];

            if (!row) return;

            const okBtn =
                row.querySelector(".ok-btn");

            const ngBtn =
                row.querySelector(".ng-btn");

            const comment =
                row.querySelector(".ng-comment");

            if (
                saved.result === "OK"
            ) {

                okBtn.classList.add(
                    "active"
                );

            }

            if (
                saved.result === "NG"
            ) {

                ngBtn.classList.add(
                    "active"
                );

                comment.style.display =
                    "block";

            }

            row.querySelector("textarea")
                .value =
                saved.comment || "";

        });

}
/* =========================
   ローカル保存
========================= */

function saveLocalData() {

    const data = [];

    document
        .querySelectorAll(".item-row")
        .forEach(row => {

            data.push({

                ok:
                    row.querySelector(".ok-btn")
                    .classList.contains("active"),

                ng:
                    row.querySelector(".ng-btn")
                    .classList.contains("active"),

                comment:
                    row.querySelector("textarea")
                    .value || ""

            });

        });

    localStorage.setItem(
        "inspectionDraft",
        JSON.stringify(data)
    );

}

/* =========================
   ローカル読込
========================= */

function loadLocalData() {

    const saved =
        localStorage.getItem(
            "inspectionDraft"
        );

    if (!saved) return;

    const data =
        JSON.parse(saved);

    const rows =
        document.querySelectorAll(".item-row");

    data.forEach(
        (item, index) => {

            const row =
                rows[index];

            if (!row) return;

            const okBtn =
                row.querySelector(".ok-btn");

            const ngBtn =
                row.querySelector(".ng-btn");

            const comment =
                row.querySelector(".ng-comment");

            if (item.ok) {

                okBtn.classList.add(
                    "active"
                );

            }

            if (item.ng) {

                ngBtn.classList.add(
                    "active"
                );

                comment.style.display =
                    "block";

            }

            row.querySelector("textarea")
                .value =
                item.comment || "";

        }
    );

}

/* =========================
   textarea自動保存
========================= */

document.addEventListener(
    "input",
    e => {

        if (
            e.target.tagName ===
            "TEXTAREA"
        ) {

            saveLocalData();

        }

    }
);

/* =========================
   A4印刷
========================= */

function generatePrint() {

    const machine =
        document.getElementById("machine")
        .value;

    const date =
        document.getElementById("inspectionDate")
        .value;

    const worker =
        document.getElementById("worker")
        .value;

    const memo =
        document.getElementById("memo")
        .value;

    let rowsHtml = "";

    document
        .querySelectorAll(".item-row")
        .forEach(row => {

            const item =
                row.querySelector(".item-name")
                .textContent;

            let result = "";

            if (
                row.querySelector(".ok-btn")
                .classList.contains("active")
            ) {

                result = "OK";

            }

            if (
                row.querySelector(".ng-btn")
                .classList.contains("active")
            ) {

                result = "NG";

            }

            const comment =
                row.querySelector("textarea")
                .value || "";

            rowsHtml += `
<tr>
<td>${item}</td>
<td>${result}</td>
<td>${comment}</td>
</tr>
`;

        });

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

@page{
    size:A4;
    margin:10mm;
}

body{
    font-family:sans-serif;
    font-size:12px;
}

h2{
    text-align:center;
}

table{
    width:100%;
    border-collapse:collapse;
}

th,td{
    border:1px solid #000;
    padding:5px;
}

th{
    background:#eee;
}

.info{
    margin-bottom:10px;
}

.memo{
    margin-top:15px;
    border:1px solid #000;
    padding:10px;
    min-height:60px;
}

</style>
</head>

<body>

<h2>設備点検表</h2>

<div class="info">
設備：${machine}<br>
日付：${date}<br>
点検者：${worker}
</div>

<table>

<tr>
<th>点検項目</th>
<th>結果</th>
<th>コメント</th>
</tr>

${rowsHtml}

</table>

<div class="memo">

<b>備考</b><br>
${memo}

</div>

</body>
</html>
`;

    const win =
        window.open(
            "",
            "_blank"
        );

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();

}
