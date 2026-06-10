import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener(
    "DOMContentLoaded",
    loadHistory
);

document
.getElementById("searchBtn")
.addEventListener(
    "click",
    loadHistory
);

document
.getElementById("backBtn")
.addEventListener(
    "click",
    ()=>{

        location.href =
            "index.html";

    }
);

async function loadHistory(){

    const list =
        document.getElementById(
            "historyList"
        );

    list.innerHTML = "";

    const searchDate =
        document.getElementById(
            "searchDate"
        ).value;

    const searchWorker =
        document.getElementById(
            "searchWorker"
        ).value
        .toLowerCase();

    const snapshot =
        await getDocs(
            collection(
                db,
                "inspections"
            )
        );

    snapshot.forEach(doc=>{

        const data =
            doc.data();

        if(
            searchDate &&
            data.date !== searchDate
        ){

            return;

        }

        if(
            searchWorker &&
            !data.worker
             .toLowerCase()
             .includes(searchWorker)
        ){

            return;

        }

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "card";

        card.innerHTML = `

            <h3>
                ${data.date}
            </h3>

            <p>
                設備：
                ${data.machine}
            </p>

            <p>
                点検者：
                ${data.worker}
            </p>

            <button
                class="section-btn detail-btn">

                詳細表示

            </button>

            <div
                class="detail-area"
                style="display:none;">
            </div>

        `;

        const detailBtn =
            card.querySelector(
                ".detail-btn"
            );

        const detailArea =
            card.querySelector(
                ".detail-area"
            );

        detailBtn
        .addEventListener(
            "click",
            ()=>{

                if(
                    detailArea
                    .style.display
                    === "block"
                ){

                    detailArea
                    .style.display
                    = "none";

                    return;

                }

                detailArea.innerHTML =
                    createDetailHtml(
                        data
                    );

                detailArea
                .style.display
                = "block";

            }
        );

        list.appendChild(card);

    });

}

function createDetailHtml(data){

    let html = "";

    data.inspections
    .forEach(item=>{

        html += `

            <div
            class="item-row">

                <strong>
                    ${item.item}
                </strong>

                <br>

                判定：
                ${item.result}

                <br>

                コメント：
                ${item.comment || "-"}

            </div>

        `;

    });

    return html;

}

document
.getElementById("exportBtn")
?.addEventListener(
    "click",
    exportMonthlyExcel
);
async function exportMonthlyExcel(){

    const month =
        document.getElementById(
            "exportMonth"
        ).value;

    if(!month){

        alert("対象年月を選択してください");

        return;

    }

    const snapshot =
        await getDocs(
            collection(
                db,
                "inspections"
            )
        );

    const rows = [];

    snapshot.forEach(doc=>{

        const data =
            doc.data();

        if(
            !data.date ||
            !data.date.startsWith(month)
        ){

            return;

        }

        data.inspections.forEach(item=>{

            rows.push({

                日付:
                    data.date,

                設備:
                    data.machine,

                点検者:
                    data.worker,

                項目:
                    item.item,

                判定:
                    item.result,

                コメント:
                    item.comment || ""

            });

        });

    });

    if(rows.length===0){

        alert(
            "対象月のデータがありません"
        );

        return;

    }

    const ws =
        XLSX.utils.json_to_sheet(
            rows
        );

    const wb =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "設備点検一覧"
    );

    XLSX.writeFile(
        wb,
        `設備点検表_${month}.xlsx`
    );

}
