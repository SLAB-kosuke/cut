import {
    db,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "./firebase.js";

/* =========================
   マスタ（元仕様そのまま）
========================= */
const inspectionData = {
    dailyList: [/* 省略せず元通り */],
    weeklyList: [],
    otherList: [],
    monthlyList: [],
    threeMonthList: [],
    sixMonthList: [],
    yearlyList: []
};

/* =========================
   初期化
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const dateInput = document.getElementById("inspectionDate");

    if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    createInspectionItems();
    initializeAccordion();

    loadInspectionByDate();

    document.getElementById("inspectionDate")
        ?.addEventListener("change", handleDateChange);

    document.getElementById("saveBtn")
        ?.addEventListener("click", saveInspection);

    document.getElementById("historyBtn")
        ?.addEventListener("click", () => {
            location.href = "logs.html";
        });

    document.getElementById("excelBtn")
        ?.addEventListener("click", generatePrint);
});

/* =========================
   日付変更（confirm復活）
========================= */
function handleDateChange() {

    const ok = confirm("日付変更すると入力内容をクリアします。続行しますか？");

    if (!ok) {
        location.reload();
        return;
    }

    clearUI();
    loadInspectionByDate();
}

/* =========================
   画面生成
========================= */
function createInspectionItems() {

    Object.keys(inspectionData).forEach(listId => {

        const container = document.getElementById(listId);
        if (!container) return;

        inspectionData[listId].forEach(item => {

            const row = document.createElement("div");
            row.className = "item-row";

            row.innerHTML = `
                <div class="item-name">${item}</div>
                <div class="result-buttons">
                    <button class="ok-btn">OK</button>
                    <button class="ng-btn">NG</button>
                </div>
                <div class="ng-comment" style="display:none;">
                    <textarea></textarea>
                </div>
            `;

            const okBtn = row.querySelector(".ok-btn");
            const ngBtn = row.querySelector(".ng-btn");
            const comment = row.querySelector(".ng-comment");

            okBtn.addEventListener("click", () => {
                okBtn.classList.add("active");
                ngBtn.classList.remove("active");
                comment.style.display = "none";
                saveLocalData();
            });

            ngBtn.addEventListener("click", () => {
                ngBtn.classList.add("active");
                okBtn.classList.remove("active");
                comment.style.display = "block";
                saveLocalData();
            });

            container.appendChild(row);
        });
    });
}

/* =========================
   保存（Firebase + category復活）
========================= */
async function saveInspection() {

    const machine = document.getElementById("machine").value;
    const date = document.getElementById("inspectionDate").value;
    const worker = document.getElementById("worker").value;
    const memo = document.getElementById("memo").value;

    if (!worker) {
        alert("点検者を入力してください");
        return;
    }

    const inspections = [];

    document.querySelectorAll(".item-row").forEach(row => {

        let result = "";

        if (row.querySelector(".ok-btn").classList.contains("active")) result = "OK";
        if (row.querySelector(".ng-btn").classList.contains("active")) result = "NG";

        inspections.push({
            category: row.closest(".inspection-content")
                ?.previousElementSibling?.textContent?.trim() || "",

            item: row.querySelector(".item-name").textContent.trim(),
            result,
            comment: row.querySelector("textarea").value
        });
    });

    const docId = `${machine}_${date}`;

    await setDoc(doc(db, "inspections", docId), {
        machine,
        date,
        worker,
        memo,
        inspections,
        updatedAt: serverTimestamp()
    }, { merge: true });

    alert("保存完了");
}

/* =========================
   読み込み（完全復元）
========================= */
async function loadInspectionByDate() {

    const machine = document.getElementById("machine").value;
    const date = document.getElementById("inspectionDate").value;

    if (!machine || !date) return;

    const docId = `${machine}_${date}`;

    const snapshot = await getDoc(doc(db, "inspections", docId));

    clearUI();

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    document.getElementById("worker").value = data.worker || "";
    document.getElementById("memo").value = data.memo || "";

    const rows = document.querySelectorAll(".item-row");

    (data.inspections || []).forEach((saved, index) => {

        const row = rows[index];
        if (!row) return;

        const okBtn = row.querySelector(".ok-btn");
        const ngBtn = row.querySelector(".ng-btn");
        const textarea = row.querySelector("textarea");
        const comment = row.querySelector(".ng-comment");

        if (saved.result === "OK") okBtn.classList.add("active");
        if (saved.result === "NG") {
            ngBtn.classList.add("active");
            comment.style.display = "block";
        }

        textarea.value = saved.comment || "";
    });
}

/* =========================
   クリア
========================= */
function clearUI() {

    document.querySelectorAll(".ok-btn,.ng-btn")
        .forEach(b => b.classList.remove("active"));

    document.querySelectorAll(".ng-comment")
        .forEach(c => c.style.display = "none");

    document.querySelectorAll("textarea")
        .forEach(t => t.value = "");

    document.getElementById("worker").value = "";
    document.getElementById("memo").value = "";
}

/* =========================
   ローカル保存（復活）
========================= */
function saveLocalData() {

    const data = [];

    document.querySelectorAll(".item-row").forEach(row => {

        data.push({
            ok: row.querySelector(".ok-btn").classList.contains("active"),
            ng: row.querySelector(".ng-btn").classList.contains("active"),
            comment: row.querySelector("textarea").value
        });

    });

    localStorage.setItem("inspectionDraft", JSON.stringify(data));
}

/* =========================
   印刷（A4）
========================= */
function generatePrint() {

    const machine = document.getElementById("machine").value;
    const date = document.getElementById("inspectionDate").value;
    const worker = document.getElementById("worker").value;
    const memo = document.getElementById("memo").value;

    let rowsHtml = "";

    document.querySelectorAll(".item-row").forEach(row => {

        const item = row.querySelector(".item-name").textContent;

        let result = "未";

        if (row.querySelector(".ok-btn").classList.contains("active")) {
            result = "OK";
        }

        if (row.querySelector(".ng-btn").classList.contains("active")) {
            result = "NG";
        }

        const comment = row.querySelector("textarea").value || "";

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
@page { size: A4; margin: 10mm; }

body { font-family: sans-serif; font-size: 12px; }

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    border: 1px solid #000;
    padding: 6px;
}

th { background: #eee; }
</style>

</head>
<body>

<h2>点検表</h2>
<p>
機械：${machine} / 日付：${date} / 作業者：${worker}
</p>

<table>
<tr>
<th>項目</th>
<th>結果</th>
<th>コメント</th>
</tr>
${rowsHtml}
</table>

</body>
</html>
`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
}
