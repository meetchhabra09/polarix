const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

async function createDummyExcelForAllUsers() {
  const users = await User.find({});
  const folderPath = path.join(__dirname, '..', 'dummy_data');
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

  for (const user of users) {
    const filePath = path.join(folderPath, `${user._id}.xlsx`);
    if (!fs.existsSync(filePath)) {
      const dummyData = [
        { amount: 5000, date: '2025-04-01', description: 'Salary', category: 'Income', subcategory: 'Salary', account: 'Bank' },
        { amount: 200, date: '2025-04-02', description: 'Snacks', category: 'Expense', subcategory: 'Food', account: 'Cash' },
        { amount: 1500, date: '2025-04-03', description: 'Mutual Fund', category: 'Asset', subcategory: 'Investments', account: 'Bank' },
        { amount: 10000, date: '2025-04-04', description: 'EMI', category: 'Liability', subcategory: 'Loan', account: 'Credit Card' }
      ];

      const worksheet = XLSX.utils.json_to_sheet(dummyData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      XLSX.writeFile(workbook, filePath);

      console.log(`✅ Dummy Excel created for user: ${user.username}`);
    } else {
      console.log(`✔️ Excel already exists for user: ${user.username}`);
    }
  }
}

module.exports = {
  createDummyExcelForAllUsers
};