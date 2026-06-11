import { db, collection, getDocs } from "./firebase.js";

document.addEventListener("DOMContentLoaded", loadLogs);

async function loadLogs() {

    const container = document.getElementById("logContainer");
    container.innerHTML = "";

    const snap = await getDocs(collection(db, "inspections"));

    snap.forEach(docSnap => {

        const data = docSnap.data();

        const card = document.createElement("div");
        card.className = "card";

        let html = `
            <div class="title">
                ${data.date} / ${data.machine} / ${data.worker}
            </div>

            <table>
                <tr>
                    <th>項目</th>
                    <th>結果</th>
                    <th>コメント</th>
                </tr>
        `;

        (data.inspections || []).forEach(i => {

            html += `
                <tr>
                    <td>${i.item}</td>
                    <td>${i.result}</td>
                    <td>${i.comment || ""}</td>
                </tr>
            `;
        });

        html += "</table>";

        card.innerHTML = html;
        container.appendChild(card);
    });
}
