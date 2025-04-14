// EMI Calculation
function calculateEMI() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const R = parseFloat(document.getElementById('interestRate').value) / 12 / 100;
    const N = parseFloat(document.getElementById('tenure').value) * 12;

    if (isNaN(P) || isNaN(R) || isNaN(N)) {
        alert("Please enter valid loan details.");
        return;
    }

    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    const emiresult = document.getElementById('emiResult');
    const total = document.getElementById('totalAmountResult');
    const interest = document.getElementById('totalInterestResult');
    
    emiresult.innerHTML = `${emi.toFixed(2)}`;
    total.innerHTML = `${totalPayment.toFixed(2)}`;
    interest.innerHTML = `${totalInterest.toFixed(2)}`;

    emiresult.classList.add('show');
    total.classList.add('show');
    interest.classList.add('show');
}

// // Tax Calculation
// function calculateTax() {
//     let income = parseFloat(document.getElementById('taxIncome').value);
//     if (isNaN(income)) {
//         alert("Please enter valid income.");
//         return;
//     }

//     let tax = 0;
//     let ra = 0;
//     const slabs = [
//         { limit: 300000, rate: 0 },
//         { limit: 300000, rate: 0.05 },
//         { limit: 300000, rate: 0.10 },
//         { limit: 300000, rate: 0.15 },
//         { limit: 300000, rate: 0.20 },
//         { limit: Infinity, rate: 0.30 }
//     ];

//     for (let slab of slabs) {
//         if (income > 0) {
//             let taxable = Math.min(income, slab.limit);
//             tax += taxable * slab.rate;
//             ra = slab.rate;
//             income -= taxable;
//         } else break;
//     }

//     const result = document.getElementById('taxResult');
//     const rateresult=document.getElementById('taxrate');

//     result.innerHTML = `${tax.toFixed(2)}`;
//     rateresult.innerHTML = `${ra * 100}`;

//     result.classList.add('show');
//     rateresult.classList.add('show');
// }




window.calculateTax = function() {
    const income = parseFloat(document.getElementById('taxIncome').value) || 0;
    const regime = document.getElementById('taxRegime').value;
    const year = document.getElementById('taxYear').value;
  
    if (income <= 0) {
      document.getElementById('taxResult').textContent = '0.00';
      return;
    }
  
    let tax = 0;
    const cess = 0.04; // 4% Health & Education Cess
  
    // Tax slabs for FY 2025-26 (based on latest web data)
    if (regime === 'new') {
      if (income <= 400000) tax = 0;
      else if (income <= 800000) tax = (income - 400000) * 0.05;
      else if (income <= 1200000) tax = (400000 * 0.05) + (income - 800000) * 0.10;
      else if (income <= 1600000) tax = (400000 * 0.05) + (400000 * 0.10) + (income - 1200000) * 0.15;
      else if (income <= 2000000) tax = (400000 * 0.05) + (400000 * 0.10) + (400000 * 0.15) + (income - 1600000) * 0.20;
      else if (income <= 2400000) tax = (400000 * 0.05) + (400000 * 0.10) + (400000 * 0.15) + (400000 * 0.20) + (income - 2000000) * 0.25;
      else tax = (400000 * 0.05) + (400000 * 0.10) + (400000 * 0.15) + (400000 * 0.20) + (400000 * 0.25) + (income - 2400000) * 0.30;
      // Rebate u/s 87A for income up to 1200000
      if (income <= 1200000) tax = 0;
    } else { // Old regime (for individuals below 60 years)
      if (income <= 250000) tax = 0;
      else if (income <= 500000) tax = (income - 250000) * 0.05;
      else if (income <= 1000000) tax = (250000 * 0.05) + (income - 500000) * 0.20;
      else tax = (250000 * 0.05) + (500000 * 0.20) + (income - 1000000) * 0.30;
    }
  
    // Apply 4% cess
    tax += tax * cess;
  
    document.getElementById('taxResult').textContent = tax.toFixed(2);
  };




















// Scroll Animation
// const fadeElements = document.querySelectorAll('.fade-in');
// const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//         if (entry.isIntersecting) {
//             entry.target.classList.add('visible');
//         }
//     });
// }, { threshold: 0.1 });

// fadeElements.forEach(element => observer.observe(element));
