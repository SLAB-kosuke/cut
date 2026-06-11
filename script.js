import {
    db,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
}
from "./firebase.js";

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

document.addEventListener("DOMContentLoaded", () => {

    const dateInput =
        document.getElementById("inspectionDate");

    if(dateInput){

        dateInput.value =
            new Date().toISOString().split("T")[0];

    }
loadInspectionByDate();
    createInspectionItems();
    initializeAccordion();
    loadLocalData();
document
.getElementById("inspectionDate")
?.addEventListener(
    "change",
    loadInspectionByDate
);

function createInspectionItems(){

    Object.keys(inspectionData).forEach(listId=>{

        const container =
            document.getElementById(listId);

        if(!container) return;

        inspectionData[listId].forEach(item=>{

            const row =
                document.createElement("div");

            row.className = "item-row";

            row.innerHTML = `
                <div class="item-name">
                    ${item}
                </div>

                <div class="result-buttons">

                    <button type="button" class="ok-btn">
                        ✓ 正常
                    </button>

                    <button type="button" class="ng-btn">
                        ✕ 異常
                    </button>

                </div>

                <div class="ng-comment" style="display:none;">

                    <textarea
                    placeholder="異常内容を入力"></textarea>

                </div>
            `;

            const okBtn =
                row.querySelector(".ok-btn");

            const ngBtn =
                row.querySelector(".ng-btn");

            const comment =
                row.querySelector(".ng-comment");

            okBtn.addEventListener("click",()=>{

                okBtn.classList.add("active");
                ngBtn.classList.remove("active");

                comment.style.display="none";

                saveLocalData();

            });

            ngBtn.addEventListener("click",()=>{

                ngBtn.classList.add("active");
                okBtn.classList.remove("active");

                comment.style.display="block";

                saveLocalData();

            });

            container.appendChild(row);

        });

    });

}

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

            current.style.display =
                current.style.display==="block"
                ? "none"
                : "block";

        });

    });

}

function saveLocalData(){

    const data=[];

    document
    .querySelectorAll(".item-row")
    .forEach(row=>{

        data.push({

            ok:
            row.querySelector(".ok-btn")
            .classList.contains("active"),

            ng:
            row.querySelector(".ng-btn")
            .classList.contains("active"),

            comment:
            row.querySelector("textarea").value

        });

    });

    localStorage.setItem(
        "inspectionDraft",
        JSON.stringify(data)
    );

}

function loadLocalData(){

    const saved =
        localStorage.getItem("inspectionDraft");

    if(!saved) return;

    const data =
        JSON.parse(saved);

    const rows =
        document.querySelectorAll(".item-row");

    data.forEach((item,index)=>{

        const row = rows[index];

        if(!row) return;

        const okBtn =
            row.querySelector(".ok-btn");

        const ngBtn =
            row.querySelector(".ng-btn");

        const comment =
            row.querySelector(".ng-comment");

        const textarea =
            row.querySelector("textarea");

        if(item.ok){

            okBtn.classList.add("active");

        }

        if(item.ng){

            ngBtn.classList.add("active");

            comment.style.display="block";

        }

        textarea.value =
            item.comment || "";

    });

}

document.addEventListener("input",e=>{

    if(e.target.tagName==="TEXTAREA"){

        saveLocalData();

    }

});

document.getElementById("saveBtn")
?.addEventListener("click", saveInspection);


document.getElementById("historyBtn")
?.addEventListener("click",()=>{

   location.href = "logs.html";

});

document.getElementById("excelBtn")
?.addEventListener("click",()=>{

    alert("Excel出力は次工程");

});

async function saveInspection(){

    try{

        const machine =
            document.getElementById("machine").value;

        const date =
            document.getElementById("inspectionDate").value;

        const worker =
            document.getElementById("worker").value;

        const memo =
            document.getElementById("memo").value;

        if(!worker){

            alert("点検者を入力してください");

            return;
        }

        const inspections = [];

        document
        .querySelectorAll(".item-row")
        .forEach(row=>{

            let result = "";

            if(
                row.querySelector(".ok-btn")
                .classList.contains("active")
            ){

                result = "OK";

            }

            if(
                row.querySelector(".ng-btn")
                .classList.contains("active")
            ){

                result = "NG";

            }

            inspections.push({

                category:
                    row.closest(".inspection-content")
                    .previousElementSibling
                    .textContent
                    .trim(),

                item:
                    row.querySelector(".item-name")
                    .textContent
                    .trim(),

                result,

                comment:
                    row.querySelector("textarea")
                    .value

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

        inspections,

        updatedAt:
            serverTimestamp()

    }
);

        alert("保存完了");

        clearForm();

    }catch(error){

        console.error(error);

        alert(
            "保存エラー\n" +
            error.message
        );

    }

}
function clearForm(){

    document
    .querySelectorAll(".ok-btn,.ng-btn")
    .forEach(btn=>{

        btn.classList.remove("active");

    });

    document
    .querySelectorAll(".ng-comment")
    .forEach(comment=>{

        comment.style.display="none";

    });

    document
    .querySelectorAll("textarea")
    .forEach(text=>{

        text.value="";

    });

    document
    .getElementById("worker")
    .value="";

    document
    .getElementById("memo")
    .value="";

    localStorage.removeItem(
        "inspectionDraft"
    );

}
document
.getElementById("inspectionDate")
?.addEventListener("change",()=>{

    const ok =
        confirm(
            "日付変更すると入力内容をクリアします。続行しますか？"
        );

    if(!ok){

        location.reload();

        return;

    }

    clearForm();

});
async function loadInspectionByDate(){

    try{

        const machine =
            document.getElementById("machine").value;

        const date =
            document.getElementById("inspectionDate").value;

        if(!machine || !date) return;

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

        if(!snapshot.exists()){

           function clearInspectionData(){

    document.getElementById("worker").value = "";

    document.getElementById("memo").value = "";

    document
    .querySelectorAll(".item-row")
    .forEach(row=>{

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

            return;
        }

        const data =
            snapshot.data();

       function restoreInspectionData(data){

    clearInspectionData();

    document.getElementById("worker").value =
        data.worker || "";

    document.getElementById("memo").value =
        data.memo || "";

    const rows =
        document.querySelectorAll(".item-row");

    data.inspections.forEach((saved,index)=>{

        const row = rows[index];

        if(!row) return;

        const okBtn =
            row.querySelector(".ok-btn");

        const ngBtn =
            row.querySelector(".ng-btn");

        const textarea =
            row.querySelector("textarea");

        const comment =
            row.querySelector(".ng-comment");

        if(saved.result==="OK"){

            okBtn.classList.add("active");

        }

        if(saved.result==="NG"){

            ngBtn.classList.add("active");

            comment.style.display =
                "block";

        }

        textarea.value =
            saved.comment || "";

    });

}

    }catch(error){

        console.error(error);

    }

}
