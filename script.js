const form = document.getElementById('loanForm');
const tableBody = document.getElementById('loanTableBody');
let isReadOnly = true;

window.onload = function () {
  const username = prompt("Enter your username:");
  isReadOnly = username !== "tonying";

  if (isReadOnly) {
    form.style.display = 'none';

    const notice = document.createElement('div');
    notice.textContent = "🔒 Read-only mode: You do not have permission to edit.";
    notice.className = "read-only-notice";
    document.body.insertBefore(notice, document.body.firstChild);
    }

  displayAllLoans();
};

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const releasedAmount = parseFloat(document.getElementById('releasedAmount').value);
  const releaseDate = document.getElementById('releaseDate').value;
  const interestRate = parseFloat(document.getElementById('interest').value);
  const months = parseInt(document.getElementById('months').value);

  const monthlyInterest = releasedAmount * (interestRate / 100);
  const totalPayment = releasedAmount + monthlyInterest * months;

  const loan = {
    name,
    releasedAmount,
    releaseDate,
    interestRate,
    months,
    monthlyInterest: monthlyInterest.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    status: "Unpaid",
    balance: totalPayment.toFixed(2),
    datePaid: "",
    paymentNote: ""
  };

  saveLoan(loan);
  displayAllLoans();
  form.reset();
});

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function displayLoan(loan, index) {
  const row = document.createElement('tr');

  if (loan.status === "Paid") {
    row.style.backgroundColor = "#d3d3d3";
  }

  row.innerHTML = `
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${loan.name}</td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${formatDate(loan.releaseDate)}</td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${formatNumber(loan.releasedAmount)}</td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${formatNumber(loan.monthlyInterest)}</td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${loan.months}</td>
    <td>
      <select onchange="updateRowColor(this)" ${isReadOnly ? 'disabled' : ''}>
        <option value="Unpaid" ${loan.status === "Unpaid" ? "selected" : ""}>Unpaid</option>
        <option value="Paid" ${loan.status === "Paid" ? "selected" : ""}>Paid</option>
      </select>
    </td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${formatNumber(loan.balance)}</td>
    <td><input type="date" value="${loan.datePaid}" ${isReadOnly ? 'disabled' : ''}></td>
    <td ${isReadOnly ? '' : 'contenteditable="true"'}>${loan.paymentNote || '-'}</td>
    <td>
      ${isReadOnly ? '' : `
        <button onclick="saveEdit(${index}, this)">💾</button>
        <button onclick="deleteLoan(${index})">🗑️</button>
      `}
    </td>
  `;
  tableBody.appendChild(row);
}

function updateRowColor(selectElement) {
  const row = selectElement.closest('tr');
  if (selectElement.value === "Paid") {
    row.style.backgroundColor = "#d3d3d3";
  } else {
    row.style.backgroundColor = "";
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function displayAllLoans() {
  tableBody.innerHTML = '';
  const loans = JSON.parse(localStorage.getItem('loans') || '[]');
  loans.forEach((loan, index) => displayLoan(loan, index));
}

function saveLoan(loan) {
  const loans = JSON.parse(localStorage.getItem('loans') || '[]');
  loans.push(loan);
  localStorage.setItem('loans', JSON.stringify(loans));
}

function saveEdit(index, button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');

  const statusSelect = cells[6].querySelector('select');
  const dateInput = cells[8].querySelector('input');

  const updatedLoan = {
    name: cells[0].innerText,
    releasedAmount: parseFloat(cells[3].innerText),
    releaseDate: cells[2].innerText,
    interestRate: parseFloat(cells[4].innerText) * 100 / parseFloat(cells[3].innerText),
    months: parseInt(cells[5].innerText),
    monthlyInterest: parseFloat(cells[4].innerText).toFixed(2),
    totalPayment: (parseFloat(cells[3].innerText) + parseFloat(cells[4].innerText) * parseInt(cells[5].innerText)).toFixed(2),
    status: statusSelect.value,
    balance: parseFloat(cells[7].innerText).toFixed(2),
    datePaid: dateInput.value,
    paymentNote: cells[9].innerText === '-' ? '' : cells[9].innerText
  };

  const loans = JSON.parse(localStorage.getItem('loans') || '[]');
  loans[index] = updatedLoan;
  localStorage.setItem('loans', JSON.stringify(loans));
  displayAllLoans();
}

function deleteLoan(index) {
  const loans = JSON.parse(localStorage.getItem('loans') || '[]');
  loans.splice(index, 1);
  localStorage.setItem('loans', JSON.stringify(loans));
  displayAllLoans();
}
