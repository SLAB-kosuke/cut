import {
    db,
    collection,
    getDocs
} from "./firebase.js";

let allLogs = [];

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadLogs();

        document
            .getElementById("searchBtn")
            ?.addEventListener(
                "click",
                renderLogs
            );

        document
            .getElementById("clearBtn")
            ?.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "dateSearch"
                    ).value = "";

                    document.getElementById(
                        "machineSearch"
                    ).value = "";

                    renderLogs();

                }
            );
   document
            .getElementById(
                "excelExportBtn"
            )
            ?.addEventListener(
                "click",
                openExcelExportDialog
                  );
    }
);

async function loadLogs() {

    const snap =
        await getDocs(
            collection(
                db,
                "inspections"
            )
        );

    allLogs = [];

    const machines = new Set();

    snap.forEach(docSnap => {

        const data =
            docSnap.data();

        allLogs.push(data);

        if(data.machine){

            machines.add(
                data.machine
            );

        }

    });

    allLogs.sort(
        (a,b)=>
            (b.date || "")
            .localeCompare(
                a.date || ""
            )
    );

    const select =
        document.getElementById(
            "machineSearch"
        );

    if(select){

        machines.forEach(machine=>{

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                machine;

            option.textContent =
                machine;

            select.appendChild(
                option
            );

        });

    }

    renderLogs();

}

function renderLogs(){

    const container =
        document.getElementById(
            "logContainer"
        );

    container.innerHTML = "";

    const dateSearch =
        document.getElementById(
            "dateSearch"
        )?.value || "";

    const machineSearch =
        document.getElementById(
            "machineSearch"
        )?.value || "";

    const filtered =
        allLogs.filter(log=>{

            const dateMatch =
                !dateSearch ||
                log.date === dateSearch;

            const machineMatch =
                !machineSearch ||
                log.machine === machineSearch;

            return (
                dateMatch &&
                machineMatch
            );

        });

    filtered.forEach(data=>{

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "log-card";

        const grouped = {};

        (data.inspections || [])
        .forEach(item=>{

            const category =
                item.category ||
                "その他";

            if(
                !grouped[category]
            ){

                grouped[category] = [];

            }

            grouped[category]
                .push(item);

        });

        let detailHtml = "";

        Object.keys(grouped)
        .forEach(category=>{

            let rows = "";

            grouped[category]
            .forEach(item=>{

                rows += `
<div class="item-line">

${item.item}

【${item.result || "-"}】

${item.comment || ""}

</div>
`;

            });

            detailHtml += `
<div class="category">

<div class="category-title">
${category}
</div>

<div class="category-content">
${rows}
</div>

</div>
`;

        });

        card.innerHTML = `

<div class="log-date">
${data.date}
</div>

<div class="log-info">
設備：${data.machine}
</div>

<div class="log-info">
作業者：${data.worker}
</div>

<button
class="detail-btn">

詳細

</button>

<div class="detail-area">

${detailHtml}

<div class="memo-box">

<b>備考</b><br>

${data.memo || ""}

</div>

</div>

`;

        container.appendChild(
            card
        );

        const detailBtn =
            card.querySelector(
                ".detail-btn"
            );

        const detailArea =
            card.querySelector(
                ".detail-area"
            );

        detailBtn.addEventListener(
            "click",
            ()=>{

                detailArea.style.display =
                    detailArea.style.display ===
                    "block"
                    ? "none"
                    : "block";

            }
        );

        card
            .querySelectorAll(
                ".category-title"
            )
            .forEach(title=>{

                title.addEventListener(
                    "click",
                    ()=>{

                        const content =
                            title.nextElementSibling;

                        content.style.display =
                            content.style.display ===
                            "block"
                            ? "none"
                            : "block";

                    }
                );

            });

    });

}
async function openExcelExportDialog() {

    try {

        console.log("step1 OK");

        const machine =
            document.getElementById("machineSearch")?.value;

        console.log("step2 OK");

        const year =
            prompt("対象年を入力", new Date().getFullYear());

        const month =
            prompt("対象月を入力", new Date().getMonth() + 1);

        console.log("step3 OK");

        const targetLogs =
            allLogs.filter(log => {

                if (log.machine !== machine) return false;

                const logDate = new Date(log.date);

                return (
                    logDate.getFullYear() === Number(year) &&
                    logDate.getMonth() + 1 === Number(month)
                );

            });

        console.log("step4 OK");
        console.log("対象件数", targetLogs.length);

        console.log("step5 OK - Excel開始");

        console.log("ExcelJS:", window.ExcelJS);

        const workbook = new ExcelJS.Workbook();

        const response = await fetch("設備点検表.xlsx");

        const arrayBuffer = await response.arrayBuffer();

        await workbook.xlsx.load(arrayBuffer);
　　　　workbook.eachSheet((sheet) => {
    console.log("シート名:", sheet.name);
});
        console.log("sheet取得前");
        
        const sheet = workbook.getWorksheet("月1～年1 ");
        const dailySheet =
    workbook.getWorksheet("日常～週");
for(let col = 1; col <= 40; col++){

    const value =
        dailySheet.getRow(10)
        .getCell(col).value;

    if(value){

        console.log(
            "row10",
            col,
            value
        );

    }

}
        for(let row = 1; row <= 15; row++){

    let values = [];

    for(let col = 1; col <= 40; col++){

        values.push(
            dailySheet
                .getRow(row)
                .getCell(col)
                .value
        );

    }

    console.log(
        "ROW",
        row,
        values
    );

}
        for(let col = 6; col <= 37; col++){

    console.log(
        "DATE",
        col,
        dailySheet.getRow(9).getCell(col).value
    );

}
        for(let col = 7; col <= 12; col++){

    const cell =
        dailySheet
            .getRow(9)
            .getCell(col)
            .value;

    console.log(
        "DAY",
        col,
        cell?.result || cell
    );

}
console.log("dailySheet=", dailySheet);
        sheet.eachRow((row, rowNumber) => {

    const value =
        row.getCell(2).value;

    if (value) {

        console.log(
            rowNumber,
            value
        );

    }

});
        dailySheet.eachRow((row,rowNumber)=>{

    const value =
        row.getCell(2).value;

    if(value){

        console.log(
            "日常週",
            rowNumber,
            value
        );

    }

});
　　　　console.log("sheet=", sheet);
        if (!sheet) {
            alert("シートが見つかりません");
            return;
        }

        console.log("step6 OK - sheet取得");
const monthColMap = {
    4: "G",
    5: "H",
    6: "I",
    7: "J",
    8: "K",
    9: "L",
    10: "M",
    11: "N",
    12: "O",
    1: "P",
    2: "Q",
    3: "R"
};

const rowMap = {
    // 月次

    "ブレーキシューの確認": 12,
    "フィルタ清掃(制御部ロッカー)": 13,
    "フィルタ清掃(クーラー部)": 14,
    "AWFチャック部の確認": 15,
    "AWF上パイプ部の確認": 16,
    "AWFディテクト部の確認": 17,
    "フィードドレインホース": 18,
    "上下ガイド周りの清掃": 19,

    // 3ヶ月

    "加工液の交換": 21,
    "汚水槽水位検出子の清掃": 22,
    "ガイド部(上下)の平行確認 20μm以下/20mm": 23,
    "ワイヤーの垂直調整": 24,
    "フィード部の確認": 25,
    "シール板の清掃": 26,
    "プレシールジャバラの清掃": 27,
    "クーラ内部の配管清掃": 28,

    // 6ヶ月

    "グリスアップ（リニアガイド）": 31,
    "グリスアップ（ボールネジ）": 32,
    "グリスアップ（ドレイン軸）": 33,

    // 年次

    "フェルトパッドの交換": 35
};

targetLogs.forEach(log => {

    const logMonth =
        new Date(log.date).getMonth() + 1;

    const col =
        monthColMap[logMonth];

    if (!col) return;

    (log.inspections || []).forEach(item => {

        const row =
            rowMap[item.item];

        if (!row) return;

        if (item.result === "OK") {

            sheet.getCell(
                `${col}${row}`
            ).value = "✓";

        }

        if (item.result === "NG") {

            sheet.getCell(
                `${col}${row}`
            ).value = "✕";

        }

    });

});
        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = `${machine}_${year}年${month}月.xlsx`;

        a.click();

        URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert("Excel出力エラー");
    }
}
