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
function initializeExportControls() {

    const yearSelect =
        document.getElementById(
            "yearSelect"
        );

    const monthSelect =
        document.getElementById(
            "monthSelect"
        );

    const exportMachine =
        document.getElementById(
            "exportMachine"
        );

    const year =
        new Date().getFullYear();

    for(let y = year - 2; y <= year + 1; y++){

        const option =
            document.createElement(
                "option"
            );

        option.value = y;
        option.textContent = y;

        yearSelect.appendChild(
            option
        );

    }

    yearSelect.value = year;

    for(let m = 1; m <= 12; m++){

        const option =
            document.createElement(
                "option"
            );

        option.value = m;
        option.textContent = m;

        monthSelect.appendChild(
            option
        );

    }

    monthSelect.value =
        new Date().getMonth() + 1;

    const machines =
        [...new Set(
            allLogs.map(
                x => x.machine
            )
        )];

    machines.forEach(machine => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            machine;

        option.textContent =
            machine;

        exportMachine.appendChild(
            option
        );

    });

}
function openExcelExportDialog() {

    alert(
`月次Excel出力

次のステップで

・設備選択
・年選択
・月選択

を追加します`
    );

}
