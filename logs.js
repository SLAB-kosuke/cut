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

    const machines =
        new Set();

    snap.forEach(docSnap => {

        const data =
            docSnap.data();

        allLogs.push(data);

        if (data.machine) {

            machines.add(
                data.machine
            );

        }

    });

    allLogs.sort(
        (a, b) =>
            (b.date || "")
                .localeCompare(
                    a.date || ""
                )
    );

    const machineSelect =
        document.getElementById(
            "machineSearch"
        );

    if (machineSelect) {

        machines.forEach(machine => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                machine;

            option.textContent =
                machine;

            machineSelect.appendChild(
                option
            );

        });

    }

    renderLogs();

}

function renderLogs() {

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
        allLogs.filter(log => {

            const dateMatch =
                !dateSearch ||
                log.date ===
                dateSearch;

            const machineMatch =
                !machineSearch ||
                log.machine ===
                machineSearch;

            return (
                dateMatch &&
                machineMatch
            );

        });

    filtered.forEach(
        (data, index) => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
<td>${data.date || ""}</td>
<td>${data.machine || ""}</td>
<td>${data.worker || ""}</td>
<td>
<button
class="detail-btn"
data-index="${index}">
詳細
</button>
</td>
`;

            container.appendChild(
                row
            );

            let detailHtml = `
<div class="detail-box">

<table style="width:100%;border-collapse:collapse;">

<tr>
<th>項目</th>
<th>結果</th>
<th>コメント</th>
</tr>
`;

            (
                data.inspections || []
            ).forEach(item => {

                detailHtml += `
<tr>
<td>${item.item}</td>
<td>${item.result}</td>
<td>${item.comment || ""}</td>
</tr>
`;

            });

            detailHtml += `
</table>

<div style="margin-top:10px;">

<b>備考</b><br>
${data.memo || ""}

</div>

</div>
`;

            const detailRow =
                document.createElement(
                    "tr"
                );

            detailRow.className =
                "detail-row";

            detailRow.style.display =
                "none";

            detailRow.innerHTML = `
<td colspan="4">
${detailHtml}
</td>
`;

            container.appendChild(
                detailRow
            );

            row
                .querySelector(
                    ".detail-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        detailRow.style.display =
                            detailRow.style.display ===
                            "none"
                            ? "table-row"
                            : "none";

                    }
                );

        }
    );

}
