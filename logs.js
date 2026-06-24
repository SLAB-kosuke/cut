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
      document
    .getElementById(
        "pdfExportBtn"
    )
    ?.addEventListener(
        "click",
        openPdfExportDialog
    );
        console.log("pdfBtn",
    document.getElementById("pdfExportBtn")
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

      const year = prompt("対象年を入力", new Date().getFullYear());
　　　const month = prompt("対象月を入力", new Date().getMonth() + 1);

console.log("入力値:", year, month);

if (year == null || month == null || year === "" || month === "") {
    console.log("キャンセルされました");
    return;
}
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

sheet.getCell("T5").value = Number(year);
sheet.getCell("T5").numFmt = '0"年"';
sheet.getCell("W5").value = Number(month);
sheet.getCell("W5").numFmt = '0"月"';

dailySheet.getCell("T5").value = Number(year);
dailySheet.getCell("T5").numFmt = '0"年"';
dailySheet.getCell("W5").value = Number(month);
dailySheet.getCell("W5").numFmt = '0"月"';

        console.log(
    "W5 value",
    sheet.getCell("W5").value
);

console.log(
    "W5 numFmt",
    sheet.getCell("W5").numFmt
);        
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
        const dailyWeekRowMap = {

    "ワイヤ経路の確認": 12,
    "ワイヤ量(残時間)の確認": 13,
    "加工液量(タンク)の確認": 14,
    "イオン交換樹脂の残時間を確認": 15,
    "上下電極ピンの確認": 16,
    "使用済みワイヤ量の確認": 17,
    "加工液比抵抗の確認": 18,
    "テーブル面と加工槽の確認": 19,
    "フィルタ圧の確認": 20,
    "テーブルのランニング": 21,
    "異音、振動等の異常の有無": 22,
    "油漏れ、水漏れ等の確認": 23,
    "機械各部の清掃": 24,

    "上下ノズルの確認": 27,
    "ダイスガイドの確認・清掃": 28,
    "下ガイドローラーの確認": 29,
    "ワイヤの垂直確認": 30,
    "シール板の清掃": 31,
    "ストレーナの清掃": 32,
    "比抵抗検出電極の清掃": 33,
    "テンションセンサの調節": 34,
    "昇降ドアシール部の清掃": 35,

    "フィルター交換": 37,
    "ワイヤー交換": 38

};
        targetLogs.forEach(log => {

    const day =
        Number(
            log.date.split("-")[2]
        );
            console.log(
    "day",
    day,
    log.date
);
console.log(
    "日付確認",
    log.date,
    day
);
    const dayColMap = {
    1:"G",
    2:"H",
    3:"I",
    4:"J",
    5:"K",
    6:"L",
    7:"M",
    8:"N",
    9:"O",
    10:"P",
    11:"Q",
    12:"R",
    13:"S",
    14:"T",
    15:"U",
    16:"V",
    17:"W",
    18:"X",
    19:"Y",
    20:"Z",
    21:"AA",
    22:"AB",
    23:"AC",
    24:"AD",
    25:"AE",
    26:"AF",
    27:"AG",
    28:"AH",
    29:"AI",
    30:"AJ",
    31:"AK"
};

const col =
    dayColMap[day];
            if(!col){

    console.log(
        "列取得失敗",
        day
    );

    return;
}
            if (log.operationStatus === "RUN") {

    dailySheet
        .getCell(`${col}11`)
        .value = "✓";

}
else if (
    log.operationStatus === "STOP"
) {

    dailySheet
        .getCell(`${col}11`)
        .value = "／";

}
else {

    dailySheet
        .getCell(`${col}11`)
        .value = "－";
}
console.log(
    "12行目font",
    dailySheet.getCell(`${col}12`).font
);
            
console.log(
    "col",
    col
);
    (log.inspections || []).forEach(item => {

        const row =
            dailyWeekRowMap[item.item];
console.log(
    "日常週",
    item.item,
    row,
    item.result
);
        if (!row) return;

        if (item.result === "OK") {

            dailySheet
                .getCell(`${col}${row}`)
                .value = "✓";

        }
        
console.log(
    `${col}${row}`,
    dailySheet.getCell(`${col}${row}`).font
);
        
        if (item.result === "NG") {

            dailySheet
                .getCell(`${col}${row}`)
                .value = "✕";

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

function openPdfExportDialog() {

    const machine =
        document.getElementById(
            "machineSearch"
        )?.value;

    const year = prompt(
        "対象年を入力",
        new Date().getFullYear()
    );

    const month = prompt(
        "対象月を入力",
        new Date().getMonth() + 1
    );

    if (
        year == null ||
        month == null ||
        year === "" ||
        month === ""
    ) {
        return;
    }

    const targetLogs =
        allLogs.filter(log => {

            if (
                log.machine !== machine
            ) return false;

            const logDate =
                new Date(log.date);

            return (
                logDate.getFullYear() ===
                Number(year)
                &&
                logDate.getMonth() + 1 ===
                Number(month)
            );

        });

    console.log(
    "PDF対象件数",
    targetLogs.length
);

const pdfArea =
    document.getElementById("pdfArea");

console.log(
    "pdfArea",
    pdfArea
);

pdfArea.innerHTML = `
<h1>設備点検表</h1>
<h2>日常～週</h2>
<hr>
`;

targetLogs.forEach(log => {

    pdfArea.innerHTML += `
        <div style="border:1px solid #000;padding:5px;margin-bottom:5px;">
            <div>日付：${log.date}</div>
            <div>点検者：${log.worker || ""}</div>
        </div>
    `;

});

pdfArea.style.display = "block";

html2canvas(pdfArea)
    .then(canvas => {

       const imgData =
    canvas.toDataURL("image/png");

const pdf =
    new jspdf.jsPDF(
        "p",
        "mm",
        "a4"
    );

pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    210,
    297
);

pdf.addPage();
pdf.setFontSize(20);
pdf.text(
    "月1～年1ページ",
    20,
    20
);

pdf.save(
    `設備点検表_${year}_${month}.pdf`
);
    });
    
    }  
