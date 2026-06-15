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

    const machine =
        document.getElementById("machineSearch")?.value;

    if (!machine) {
        alert("設備を選択");
        return;
    }

    const year =
        prompt("対象年を入力", new Date().getFullYear());

    if (!year) return;

    const month =
        prompt("対象月を入力", new Date().getMonth() + 1);

    if (!month) return;

    const targetLogs =
        allLogs.filter(log => {

            if (log.machine !== machine) return false;

            const logDate = new Date(log.date);

            return (
                logDate.getFullYear() === Number(year) &&
                logDate.getMonth() + 1 === Number(month)
            );

        });

    console.log("対象件数", targetLogs.length);

    alert(`${targetLogs.length}件のデータが見つかりました`);

    // =========================
    // Excel出力処理
    // =========================

    const workbook = new ExcelJS.Workbook();

    const response = await fetch("設備点検表.xlsx");

    const arrayBuffer = await response.arrayBuffer();

    await workbook.xlsx.load(arrayBuffer);

    const sheet = workbook.getWorksheet("月1～年1");

    if (!sheet) {
        alert("シート『月1～年1』が見つかりません");
        return;
    }

    // ★ここはまだ転記しない（次ステップ）

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
}
