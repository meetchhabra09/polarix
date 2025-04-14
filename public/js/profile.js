  // import { fetchAndRenderDashboardCharts } from './dashboard.js';

const API_URL = 'http://localhost:3000/api';
const USD_TO_INR_RATE = 1; // No conversion needed, all amounts in INR


// Validation functions
function validateProfileData(data) {
  const requiredFields = ['firstName', 'lastName', 'gender', 'maritalStatus', 
                         'dateOfBirth', 'occupation', 'phoneNumber', 'city', 
                         'email', 'incomeStability', 'investmentPercentage', 'riskAppetite'];
  const missingFields = [];
  requiredFields.forEach(field => {
    if (!data[field]) missingFields.push(field);
  });
  if (missingFields.length > 0) {
    alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    alert('Please enter a valid email address');
    return false;
  }
  if (isNaN(data.phoneNumber) || data.phoneNumber.length !== 10) {
    alert('Please enter a valid 10-digit phone number');
    return false;
  }
  return true;
}

function validateTransactionData(data) {
  const requiredFields = ['amount', 'date', 'category', 'account'];
  const missingFields = [];
  requiredFields.forEach(field => {
    if (!data[field]) missingFields.push(field);
  });
  if (missingFields.length > 0) {
    alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    return false;
  }
  if (isNaN(data.amount) || data.amount <= 0) {
    alert('Please enter a valid positive amount');
    return false;
  }
  if (!data.date || isNaN(new Date(data.date).getTime())) {
    console.log('Invalid date');
    return false;
  }
  const validCategories = ['Income', 'Expense', 'Transfer', 'Asset', 'Liability', 'Goals'];
  if (!validCategories.includes(data.category)) {
    console.log(`Invalid category: ${data.category}`);
    return false;
  }
  return true;
}

// document.addEventListener('DOMContentLoaded', function() {
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const saveTransactionBtn = document.getElementById('saveTransactionBtn');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const addCategoryPopup = document.getElementById('addCategoryPopup');
  const editCategoryPopup = document.getElementById('editCategoryPopup');
  const addAccountPopup = document.getElementById('addAccountPopup');
  const editTransactionPopup = document.getElementById('editTransactionPopup');
  const addFieldPopup = document.getElementById('addFieldPopup');
  const overlay = document.getElementById('overlay');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const editCategoryBtn = document.getElementById('editCategoryBtn');
  const addAccountBtn = document.getElementById('addAccountBtn');
  const incomePeriodSelect = document.getElementById('incomePeriod');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  let currentSection = null;

  if (user.username) {
    document.querySelector('.user-name').textContent = user.username;
    document.querySelector('.user-role').textContent = 'User';
  }

  if (user.email) {
    document.getElementById('email').value = user.email;
  }

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('currentDateTransactions').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateLiabilities').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateAssets').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateIncome').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateExpenses').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateGoals').textContent = new Date().toLocaleDateString();
  document.getElementById('currentDateCategory').textContent = new Date().toLocaleDateString();
  document.getElementById('transactionDate').value = today;


  // Sidebar navigation
  const sections = {
    'nav-home': null,
    'nav-dashboard': 'dashboard',
    'nav-category': 'category',
    'nav-profile': 'my-profile',
    'nav-transactions': 'transactions',
    'nav-assets': 'assets',
    'nav-goals': 'goals',
    'nav-income': 'income',
    'nav-liabilities': 'liabilities',
    'nav-expenses': 'expenses',
    'nav-reminder': 'reminder',
    'nav-calculator': 'calculator'
    // 'tab-income': 'income',
    // 'tab-transactions': 'transactions',
    // 'tab-expenses': 'expenses',
    // 'tab-assets': 'assets',
    // 'tab-liabilities': 'liabilities',
    // 'tab-calculator': 'calculator' // ✅ New line
  };
  

  function setActiveNavItem(navId) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const activeItem = document.getElementById(navId);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  function showSection(sectionId) {
    document.querySelectorAll('.form-container').forEach(section => {
      section.style.display = 'none';
    });
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'block';
    }
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      const navId = this.id;
      if (navId === 'nav-home') {
        window.location.href = 'index.html';
        return;
      }
      const sectionId = sections[navId];
      if (sectionId) {
        showSection(sectionId);
        setActiveNavItem(navId);
        setActiveTopTab(sectionId);
        if (sectionId === 'income') {
          updateIncomeTotals();
        }
        // if (sectionId === 'dashboard') {
        //   setTimeout(() => {
        //     if (typeof fetchAndRenderDashboardCharts === 'function') {
        //       fetchAndRenderDashboardCharts();
        //     }
        //   }, 100); // short delay ensures canvas elements exist
        // }
        

        
        if (sectionId === 'dashboard') {
          
          fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          })
            .then(res => res.json())
            .then(data => {
              console.log("Transaction response:", data);
        
              if (!Array.isArray(data)) {
                console.error("Expected an array of transactions but got:", data);
                return;
              }
        
              if (data.length === 0) {
                console.warn("No transactions to display in dashboard.");
                return;
              }
              window.savedTransactions =data;
              renderDashboardChartsFromTransactions(data); // ✅ Live update the charts
            })
            .catch(err => {
              console.error("Error fetching transactions for dashboard:", err);
            });
        }
        else if (sectionId === 'category') {
          // Always fetch fresh transactions to ensure charts work
          fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (!Array.isArray(data)) {
                console.error("Expected an array of transactions for category pie charts.");
                return;
              }
              window.savedTransactions = data;
              renderCategoryPieCharts(data); // ✅ This will now work with fresh data
            })
            .catch(err => {
              console.error("Error fetching transactions for category charts:", err);
            });
        }
        
        
        
        fetchSectionData(sectionId);
      }
    });
  });

  function setActiveTopTab(sectionId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  
    // Match by section ID → tab ID pattern: #tab-income, #tab-calculator, etc.
    const tabId = `tab-${sectionId}`;
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
  

  if (user.email && user.token) {
    showSection('my-profile');
    setActiveSidebarItem('my-profile');
  }

  let categories = [];

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('user');
          window.location.href = 'signup.html';
          return;
        }
        throw new Error(`Failed to fetch categories: HTTP ${response.status} - ${errorText}`);
      }
  
      const fetchedCategories = await response.json(); // ✅ THIS WAS MISSING
      categories = fetchedCategories.length > 0 ? fetchedCategories : getDefaultCategories();
  
      populateCategoryDropdown();
      populateEditCategoryDropdown();
      populateCategoryTypeSelect(); // ✅ This now runs with real categories
  
    } catch (error) {
      console.error('Fetch categories error:', error);
      alert(`Error loading categories: ${error.message}. Using default categories.`);
      categories = getDefaultCategories(); // ✅ use default with _ids
      populateCategoryDropdown();
      populateEditCategoryDropdown();
      populateCategoryTypeSelect();
    }
  }
  

  function populateCategoryDropdown() {
    const categorySelect = document.getElementById('transactionCategory');
    const editCategorySelect = document.getElementById('editTransactionCategory');
  
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
      console.log('Transaction category dropdown populated:', categorySelect.innerHTML);
      updateSubcategory();
    }
  
    if (editCategorySelect) {
      editCategorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        editCategorySelect.appendChild(option);
      });
      console.log('Edit category dropdown populated:', editCategorySelect.innerHTML);
    }
  
    if (categorySelect && saveTransactionBtn) {
      categorySelect.addEventListener('change', function () {
        saveTransactionBtn.disabled = !this.value;
        console.log('Category selected:', this.value);
        updateSubcategory();
      });
      saveTransactionBtn.disabled = !categorySelect.value;
    }
  }

  function getDefaultCategories() {
    return [
      { _id: 'income-default', name: 'Income', subcategories: ['Salary', 'Freelance', 'Investments'] },
      { _id: 'expense-default', name: 'Expense', subcategories: ['Rent', 'Groceries', 'Utilities'] },
      { _id: 'transfer-default', name: 'Transfer', subcategories: ['Bank Transfer', 'Cash Withdrawal'] },
      { _id: 'asset-default', name: 'Asset', subcategories: ['Real Estate', 'Stocks', 'Mutual Fund'] },
      { _id: 'liability-default', name: 'Liability', subcategories: ['Loan', 'Credit Card Debt', 'Home Loan Amount'] },
      { _id: 'goals-default', name: 'Goals', subcategories: ['Vacation', 'Car', 'House'] }
    ];
  }

  
  
  

  function populateEditCategoryDropdown() {
    const categorySelect = document.getElementById('editCategorySelect');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select Category</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
      });
      updateEditSubcategories();
    }
  }

  function populateCategoryTypeSelect() {
    const select = document.getElementById('categoryTypeSelect');
    if (!select) return;
  
    // Reset dropdown
    select.innerHTML = `
      <option value="">-- Select Category --</option>
      <option value="new">+ Create New</option>
    `;
  
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  
    console.log('Add Category dropdown populated:', select.innerHTML);
  }

  function addSubcategoryField(value = '') {
    const container = document.createElement('div');
    container.className = 'subcategory-edit-group';
  
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control subcategory-input';
    input.placeholder = 'Enter subcategory';
    input.value = value;
  
    container.appendChild(input);
    document.getElementById('subcategoryFields').appendChild(container);
  }
  
  
  

  function addSubcategoryDropdown(selectedValue, allOptions = []) {
    const container = document.createElement("div");
    container.className = "subcategory-edit-group";
  
    const select = document.createElement("select");
    select.className = "form-control subcategory-dropdown";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Subcategory --";
    select.appendChild(defaultOption);
  
    allOptions.forEach(optionValue => {
      const opt = document.createElement("option");
      opt.value = optionValue;
      opt.textContent = optionValue;
      if (optionValue === selectedValue) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  
    select.addEventListener("change", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "form-control subcategory-input";
      input.placeholder = "Edit subcategory";
      input.value = select.value;
      container.innerHTML = "";
      container.appendChild(input);
    });
  
    container.appendChild(select);
    document.getElementById("subcategoryFields").appendChild(container);
  }
  
  
  
  
  

  function updateSubcategory() {
    const categorySelect = document.getElementById('transactionCategory');
    const subcategorySelect = document.getElementById('transactionSubcategory');
    if (categorySelect && subcategorySelect) {
      const selectedCategory = categorySelect.value;
      subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
      if (selectedCategory) {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category && category.subcategories?.length > 0) {
          category.subcategories.forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
          });
        }
      }
    }
  }

  function updateEditSubcategory() {
    const categorySelect = document.getElementById('editTransactionCategory');
    const subcategorySelect = document.getElementById('editTransactionSubcategory');
    if (categorySelect && subcategorySelect) {
      const selectedCategory = categorySelect.value;
      subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
      if (selectedCategory) {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category && category.subcategories?.length > 0) {
          category.subcategories.forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
          });
        }
      }
    }
  }

  // New Field Popup Logic
  document.querySelectorAll('.new-button').forEach(button => {
    button.addEventListener('click', function() {
      currentSection = this.getAttribute('data-section');
      addFieldPopup.style.display = 'block';
      overlay.style.display = 'block';
      document.getElementById('newFieldLabel').value = '';
    });
  });

  document.getElementById('closeFieldPopupBtn').addEventListener('click', () => {
    addFieldPopup.style.display = 'none';
    overlay.style.display = 'none';
    currentSection = null;
  });

  document.getElementById('addSubcategoryBtn').addEventListener('click', e => {
    e.preventDefault();
    addSubcategoryField(); // Adds blank input for a new subcategory
  });
  
  

  
  document.getElementById('saveNewFieldBtn').addEventListener('click', function() {
    const label = document.getElementById('newFieldLabel').value.trim();
    if (!label) {
      alert('Please enter a field label.');
      return;
    }
    if (!currentSection) {
      alert('No section selected.');
      return;
    }

    const sectionGrid = document.querySelector(`#${currentSection} .form-grid`);
    const newField = document.createElement('div');
    newField.className = 'form-group';
    newField.innerHTML = `
      <label class="form-label">${label}</label>
      <input type="${currentSection === 'income' || currentSection === 'expenses' ? 'number' : 'text'}" 
             class="form-control" placeholder="Enter ${label.toLowerCase()}">
    `;
    sectionGrid.appendChild(newField);

    addFieldPopup.style.display = 'none';
    overlay.style.display = 'none';
    currentSection = null;
  });

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      if (addCategoryPopup && overlay) {
        addCategoryPopup.style.display = 'block';
        overlay.style.display = 'block';
      }
    });
  }

  // if (editCategoryBtn) {
  //   editCategoryBtn.addEventListener('click', () => {
  //     if (editCategoryPopup && overlay) {
  //       editCategoryPopup.style.display = 'block';
  //       overlay.style.display = 'block';
  //       populateEditCategoryDropdown();
  //     }
  //   });
  // }

  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', () => {
      if (addAccountPopup && overlay) {
        addAccountPopup.style.display = 'block';
        overlay.style.display = 'block';
      }
    });
  }

  document.getElementById('categoryTypeSelect').addEventListener('change', function () {
    const isNew = this.value === 'new';
    const newCategoryInputGroup = document.getElementById('newCategoryInputGroup');
    const subcategoryFields = document.getElementById('subcategoryFields');
  
    subcategoryFields.innerHTML = ''; // Clear previous fields
    newCategoryInputGroup.style.display = isNew ? 'block' : 'none';
  
    if (isNew) {
      // For new category, add one empty subcategory input
      addSubcategoryField();
    } else {
      // For existing category, populate all subcategories as editable inputs
      const selectedCat = categories.find(cat => cat.name === this.value);
      if (selectedCat && selectedCat.subcategories?.length) {
        selectedCat.subcategories.forEach(sub => {
          addSubcategoryField(sub); // Populate each subcategory
        });
      } else {
        addSubcategoryField(); // Add one empty input if no subcategories
      }
    }
  });

  
  document.getElementById("addSubcategoryBtn").addEventListener("click", e => {
    e.preventDefault();
    addSubcategoryField(); // this adds one blank input
  });
  
  

  document.getElementById('closeAddPopupBtn').addEventListener('click', () => {
    if (addCategoryPopup && overlay) {
      addCategoryPopup.style.display = 'none';
      overlay.style.display = 'none';
    }
  });

  document.getElementById('closeAccountPopupBtn').addEventListener('click', () => {
    if (addAccountPopup && overlay) {
      addAccountPopup.style.display = 'none';
      overlay.style.display = 'none';
    }
  });

  document.getElementById('saveNewCategoryBtn').addEventListener('click', async function (e) {
    e.preventDefault();
  
    const categorySelect = document.getElementById('categoryTypeSelect');
    const isNew = categorySelect.value === 'new';
    const categoryName = isNew
      ? document.getElementById('newCategoryName').value.trim()
      : categorySelect.value;
  
    const newSubcategories = Array.from(document.querySelectorAll('.subcategory-input'))
      .map(input => input.value.trim())
      .filter(sub => sub !== '');
  
    if (!categoryName || newSubcategories.length === 0) {
      alert('Please enter a valid category name and at least one subcategory.');
      return;
    }
  
    let subcategories = newSubcategories;
    let method = isNew ? 'POST' : 'PUT';
    let endpoint = isNew
      ? `${API_URL}/categories`
      : `${API_URL}/categories/${categories.find(cat => cat.name === categoryName)?._id}`;
  
    if (!isNew) {
      // Fetch existing subcategories for the category
      const existingCategory = categories.find(cat => cat.name === categoryName);
      if (existingCategory) {
        // Merge existing and new subcategories, avoiding duplicates
        subcategories = Array.from(
          new Set([...existingCategory.subcategories, ...newSubcategories])
        );
      }
    }
  
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: categoryName, subcategories })
      });
  
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      alert(data.message || 'Category saved!');
      fetchCategories(); // Refresh categories and dropdowns
      addCategoryPopup.style.display = 'none';
      overlay.style.display = 'none';
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  });
  
  

  document.getElementById('saveNewAccountBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    const accountName = document.getElementById('newAccountName').value;
    
    if (!accountName) {
      alert('Please enter an account name.');
      return;
    }

    const accountData = { name: accountName };
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(accountData)
      });
      if (!response.ok) throw new Error(`Account save failed: HTTP ${response.status}`);
      const data = await response.json();
      alert(data.message || 'Account added successfully!');
      addAccountPopup.style.display = 'none';
      overlay.style.display = 'none';
      document.getElementById('newAccountName').value = '';
      fetchAccounts();
    } catch (error) {
      console.error('Save account error:', error);
      alert(`Error: ${error.message}`);
    }
  });
  document.getElementById('deleteCategoryBtn').addEventListener('click', async function (e) {
    e.preventDefault();
  
    const categorySelect = document.getElementById('categoryTypeSelect');
    const selectedCategory = categorySelect.value;
    const subcategoryInputs = Array.from(document.querySelectorAll('.subcategory-input'))
      .map(input => input.value.trim())
      .filter(Boolean);
  
    if (!selectedCategory || selectedCategory === 'new') {
      alert('Please select an existing category to delete.');
      return;
    }
  
    const categoryObj = categories.find(cat => cat.name === selectedCategory);
    console.log("Selected Category Object:", categoryObj);
    if (!categoryObj) {
      alert('Selected category not found.');
      return;
    }
  
    const categoryId = categoryObj._id;
    if (!categoryId) {
      alert('Category ID missing.');
      return;
    }
  
    if (subcategoryInputs.length === 0) {
      // 🔴 Delete entire category
      if (!confirm(`Are you sure you want to delete the entire category "${selectedCategory}" and all its subcategories?`)) return;
      try {
        const response = await fetch(`${API_URL}/categories/${categoryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
        alert(`Category "${selectedCategory}" deleted successfully.`);
        addCategoryPopup.style.display = 'none';
        overlay.style.display = 'none';
        fetchCategories();
      } catch (err) {
        console.error('Category delete error:', err);
        alert(`Error: ${err.message}`);
      }
    } else {
      // 🟡 Delete specific subcategories
      if (!confirm(`Delete selected subcategories from "${selectedCategory}"?`)) return;
      const remainingSubcategories = categoryObj.subcategories.filter(
        sub => !subcategoryInputs.some(input => input.toLowerCase() === sub.toLowerCase())
      );      
  
      try {
        const response = await fetch(`${API_URL}/categories/${categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ name: selectedCategory, subcategories: remainingSubcategories })
        });
  
        if (!response.ok) throw new Error(`Failed to update category: ${response.status}`);
        alert('Subcategories deleted successfully.');
        addCategoryPopup.style.display = 'none';
        overlay.style.display = 'none';
        fetchCategories();
      } catch (err) {
        console.error('Subcategory delete error:', err);
        alert(`Error: ${err.message}`);
      }
    }
  });

  document.getElementById('categoryTypeSelect').addEventListener('change', function () {
    const isNew = this.value === 'new';
    const newCategoryInputGroup = document.getElementById('newCategoryInputGroup');
    const subcategoryFields = document.getElementById('subcategoryFields');
  
    subcategoryFields.innerHTML = ''; // Clear previous
  
    if (isNew) {
      // Show category name input + one subcategory input
      newCategoryInputGroup.style.display = 'block';
      addSubcategoryField(); // One new subcategory input
    } else {
      // Hide category name input
      newCategoryInputGroup.style.display = 'none';
  
      const selectedCat = categories.find(cat => cat.name === this.value);
      if (selectedCat && selectedCat.subcategories.length) {
        // Create ONE dropdown to pick subcategory
        const container = document.createElement('div');
        container.className = 'subcategory-edit-group';
  
        const select = document.createElement('select');
        select.className = 'form-control subcategory-dropdown';
        select.innerHTML = `<option value="">-- Select Subcategory --</option>`;
        selectedCat.subcategories.forEach(sub => {
          const opt = document.createElement('option');
          opt.value = sub;
          opt.textContent = sub;
          select.appendChild(opt);
        });
  
        // When selected, show input to edit it
        select.addEventListener('change', () => {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'form-control subcategory-input';
          input.placeholder = 'Edit subcategory';
          input.value = select.value;
          subcategoryFields.appendChild(input);
        });
  
        container.appendChild(select);
        subcategoryFields.appendChild(container);
      }
    }
  });
  
  
  

  if (editCategoryPopup) {
    document.getElementById('closeEditPopupBtn').addEventListener('click', () => {
      editCategoryPopup.style.display = 'none';
      overlay.style.display = 'none';
    });

    document.getElementById('editCategorySelect').addEventListener('change', updateEditSubcategories);

    document.getElementById('saveEditedCategoryBtn').addEventListener('click', async function(e) {
      e.preventDefault();
      const categoryName = document.getElementById('editCategorySelect').value;
      const subcategorySelect = document.getElementById('editSubcategories');
      const selectedSubcategories = subcategorySelect ? Array.from(subcategorySelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== '') : [];
      const categoryId = document.getElementById('editCategoryId')?.value || null;

      if (!categoryName) {
        alert('Please select a category.');
        return;
      }

      const categoryData = {
        name: categoryName,
        subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : []
      };

      try {
        const response = await fetch(`${API_URL}/categories${categoryId ? '/' + categoryId : ''}`, {
          method: categoryId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error(`Category update failed: HTTP ${response.status}`);
        const data = await response.json();
        alert(data.message || 'Category updated successfully!');
        editCategoryPopup.style.display = 'none';
        overlay.style.display = 'none';
        fetchCategories();
      } catch (error) {
        console.error('Update category error:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }

  window.editTransaction = function(id) {
    window.currentEditingTransactionId = id;
    editTransactionPopup.style.display = 'block';
    overlay.style.display = 'block';
    fetchTransactionAndPopulateForm(id);
  };

  document.getElementById('cancelEditTransactionBtn').addEventListener('click', () => {
    editTransactionPopup.style.display = 'none';
    overlay.style.display = 'none';
    document.getElementById('editTransactionForm').reset();
    window.currentEditingTransactionId = null;
  });

  async function fetchTransactionAndPopulateForm(id) {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch transaction: HTTP ${response.status}`);
      const transaction = await response.json();
      document.getElementById('editTransactionAmount').value = transaction.amount;
      document.getElementById('editTransactionDate').value = transaction.date.split('T')[0];
      document.getElementById('editTransactionDescription').value = transaction.description || '';
      document.getElementById('editTransactionCategory').value = transaction.category;
      document.getElementById('editTransactionSubcategory').value = transaction.subcategory || '';
      document.getElementById('editTransactionAccount').value = transaction.account;
      updateEditSubcategory();
    } catch (error) {
      console.error('Fetch transaction error:', error);
      alert(`Error loading transaction: ${error.message}`);
    }
  }

  document.getElementById('saveEditedTransactionBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    const id = window.currentEditingTransactionId;
    if (!id) {
      alert('No transaction selected for editing.');
      return;
    }
    const editedData = {
      amount: parseFloat(document.getElementById('editTransactionAmount').value),
      date: document.getElementById('editTransactionDate').value,
      description: document.getElementById('editTransactionDescription').value || '',
      category: document.getElementById('editTransactionCategory').value,
      subcategory: document.getElementById('editTransactionSubcategory').value || null,
      account: document.getElementById('editTransactionAccount').value
    };
    if (!validateTransactionData(editedData)) return;
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editedData)
      });
      if (!response.ok) throw new Error(`Transaction update failed: HTTP ${response.status}`);
      const data = await response.json();
      alert(data.message || 'Transaction updated successfully!');
      editTransactionPopup.style.display = 'none';
      overlay.style.display = 'none';
      document.getElementById('editTransactionForm').reset();
      window.currentEditingTransactionId = null;
      fetchTransactions();
      fetchSectionData(editedData.category.toLowerCase());
    } catch (error) {
      console.error('Update transaction error:', error);
      alert(`Error: ${error.message}`);
    }
  });

  async function fetchProfile() {
    try {
      if (!user.email || !user.token) {
        alert('User data is incomplete. Please log in again.');
        localStorage.removeItem('user');
        window.location.href = 'signup.html';
        return;
      }
      const response = await fetch(`${API_URL}/profile/${encodeURIComponent(user.email)}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.status === 404) {
        console.log('No profile found, ready to create a new one.');
        return;
      }
      if (!response.ok) throw new Error(`Profile fetch failed: HTTP ${response.status}`);
      const data = await response.json();
      document.getElementById('firstName').value = data.firstName || '';
      document.getElementById('middleName').value = data.middleName || '';
      document.getElementById('lastName').value = data.lastName || '';
      document.getElementById(data.gender?.toLowerCase() || 'male').checked = true;
      document.getElementById(data.maritalStatus?.toLowerCase() || 'single').checked = true;
      document.getElementById('dateOfBirth').value = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';
      document.getElementById('occupation').value = data.occupation || 'Financial Director';
      document.getElementById('phoneNumber').value = data.phoneNumber || '';
      document.getElementById('city').value = data.city || '';
      document.getElementById('email').value = data.email || user.email;
      if (data.incomeStability) document.getElementById(`income-${data.incomeStability}`).checked = true;
      if (data.investmentPercentage) document.getElementById(`investment-${data.investmentPercentage}`).checked = true;
      if (data.riskAppetite) document.getElementById(`appetite-${data.riskAppetite}`).checked = true;
    } catch (error) {
      console.error('Fetch profile error:', error);
      alert(`Error loading profile: ${error.message}`);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error(`Transactions fetch failed: HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(transactions)) {
        renderDashboardChartsFromTransactions(transactions2);
      } else {
        console.warn("Chart update skipped. transactions is not an array:", transactions);
      }
      


      const tableBody = document.getElementById('transactionTableBody');
      if (tableBody) {
        tableBody.innerHTML = '';
        data.forEach(tx => {
          const isPositive = ['Income', 'Asset'].includes(tx.category);
          const color = isPositive ? '#119c11' : '#ff0000';
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(tx.date).toLocaleDateString()}</td>
            <td style="color: ${color}">₹${tx.amount.toFixed(2)}</td>
            <td>${tx.description || 'N/A'}</td>
            <td>${tx.category}</td>
            <td>${tx.subcategory || 'N/A'}</td>
            <td>${tx.account}</td>
            <td>
              <span class="text-button" onclick="editTransaction('${tx._id}')">Edit</span>
              <span class="text-button" onclick="deleteTransaction('${tx._id}')">Delete</span>
            </td>
          `;
          tableBody.appendChild(row);
        });
      }
      return data;

      

    } catch (error) {
      console.error('Fetch transactions error:', error);
      alert(`Error loading transactions: ${error.message}`);
      return [];
    }
  }

  async function fetchAccounts() {
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch accounts: HTTP ${response.status}`);
      const accounts = await response.json();
      const accountSelect = document.getElementById('transactionAccount');
      const editAccountSelect = document.getElementById('editTransactionAccount');
      if (accountSelect) accountSelect.innerHTML = '<option value="">Select Account</option>';
      if (editAccountSelect) editAccountSelect.innerHTML = '<option value="">Select Account</option>';
      if (accounts.length === 0) {
        ['Bank', 'Cash', 'Credit Card', 'Other'].forEach(acc => {
          const option = document.createElement('option');
          option.value = acc;
          option.textContent = acc;
          if (accountSelect) accountSelect.appendChild(option.cloneNode(true));
          if (editAccountSelect) editAccountSelect.appendChild(option);
        });
      } else {
        accounts.forEach(acc => {
          const option = document.createElement('option');
          option.value = acc.name;
          option.textContent = acc.name;
          if (accountSelect) accountSelect.appendChild(option.cloneNode(true));
          if (editAccountSelect) editAccountSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
      alert(`Error loading accounts: ${error.message}`);
    }
  }

  // Update Income totals
  async function updateIncomeTotals() {
    const transactions = await fetchTransactions();
    const incomeTransactions = transactions.filter(tx => tx.category === 'Income');
    const period = incomePeriodSelect.value;
    const now = new Date();
    let startDate;

    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarterly') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredIncome = incomeTransactions.filter(tx => new Date(tx.date) >= startDate);
    const salaryTransactions = filteredIncome.filter(tx => tx.subcategory === 'Salary');
    const salaryTotal = salaryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = filteredIncome.reduce((sum, tx) => sum + tx.amount, 0);

    document.getElementById('totalIncomeAmount').textContent = totalIncome.toFixed(2);
    const salaryInput = document.querySelector('#income .form-grid input[placeholder="Enter monthly salary"]') ||
                       document.querySelector('#income .form-grid input');
    if (salaryInput) {
      salaryInput.value = salaryTotal.toFixed(2);
    }
  }

  // Fetch and populate section data

  async function fetchSectionData(sectionId) {
    const categoryMap = {
      'income': 'Income',
      'expenses': 'Expense',
      'assets': 'Asset',
      'liabilities': 'Liability',
      'goals': 'Goals',
      'calculator': 'Calculator'
    };
    const category = categoryMap[sectionId];
    if (!category) {
      console.warn(`No category mapping for sectionId: ${sectionId}`);
      return;
    }

    try {
      const transactions = await fetchTransactions();
      let sectionTransactions = transactions.filter(tx => tx.category === category);

      if (sectionId === 'goals') {
        sectionTransactions = transactions.filter(tx => 
          tx.category === 'Goals' || (tx.category === 'Expense' && (tx.description || '').toLowerCase().includes('goal'))
        );
        const totalGoalsAmount = sectionTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const section = document.getElementById(sectionId);
        let totalDiv = section.querySelector('#totalGoalsAmount');
        if (!totalDiv) {
          totalDiv = document.createElement('div');
          totalDiv.id = 'totalGoalsAmount';
          totalDiv.style.marginTop = '20px';
          totalDiv.style.marginBottom = '20px';
          totalDiv.style.fontWeight = 'bold';
          section.insertBefore(totalDiv, section.querySelector('.form-grid'));
        }
        totalDiv.textContent = `${totalGoalsAmount.toFixed(2)}`;
      }

      const totals = {};
      sectionTransactions.forEach(tx => {
        if (tx.subcategory) {
          totals[tx.subcategory.toLowerCase()] = (totals[tx.subcategory.toLowerCase()] || 0) + tx.amount;
        }
      });

      const section = document.getElementById(sectionId);
      const inputs = section.querySelectorAll('.form-grid input:not([type="date"])');
      inputs.forEach(input => {
        const label = input.previousElementSibling?.textContent.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        if (label) {
          input.value = (totals[label] || 0).toFixed(2);
          input.dataset.originalValue = input.value;
        }
      });

      if (sectionId === 'income') {
        await updateIncomeTotals();
      }
    } catch (error) {
      console.error(`Fetch section data error for ${sectionId}:, error`);
      console.log(`Error loading ${sectionId} data: ${error.message}`);
    }
  }

  async function saveSectionData(sectionId, category, inputs) {
    const categoryMap = {
      'Assets': 'Asset',
      'Income': 'Income',
      'Liabilities': 'Liability',
      'Expenses': 'Expense',
      'Goals': 'Goals'
    };
    let validCategory = categoryMap[category] || category;

    try {
      const transactions = [];
      inputs.forEach(input => {
        if (input.type !== 'number') {
          console.log(`Skipping non-number input: ${input.previousElementSibling?.textContent}`);
          return;
        }

        const label = input.previousElementSibling?.textContent.toLowerCase().replace(/[^a-z\s]/g, '').trim();
        const amountValue = input.value.trim();
        const amount = parseFloat(amountValue);

        if (isNaN(amount) || amount <= 0) {
          console.log(`Skipping invalid amount for ${label}: ${amountValue}`);
          return;
        }
        if (input.dataset.originalValue && parseFloat(input.dataset.originalValue) === amount) {
          console.log(`Skipping unchanged amount for ${label}: ${amount}`);
          return;
        }

        transactions.push({
          amount,
          date: today,
          description: `${label} ${category.toLowerCase()}`,
          category: validCategory,
          subcategory: label.charAt(0).toUpperCase() + label.slice(1) || null,
          account: 'Bank'
        });
      });

      if (transactions.length === 0) {
        console.log(`No valid transactions to save for ${category}`);
        return;
      }

      for (const tx of transactions) {
        console.log('Saving section transaction:', tx);
        if (!validateTransactionData(tx)) {
          console.log(`Validation failed for transaction:, tx`);
          continue;
        }
        const response = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(tx)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`${category} save failed: HTTP ${response.status} - ${errorText}`);
        }
        console.log('Section transaction saved:', await response.json());
      }

      console.log(`${category} saved`);
      await fetchSectionData(sectionId);
      // / ✅ Show alert only for Goals
    if (category === 'Goals') {
      alert('🎯 Goals saved successfully!');
    }

  
    } catch (error) {
      console.error(`Save ${category} error:, error`);
      console.log(`Error: ${error.message}`);
    }
  }

  document.querySelectorAll('.save-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.closest('.form-container');
      const sectionId = section.id;
      const category = section.querySelector('.page-title').textContent;
      const inputs = section.querySelectorAll('.form-grid input[type="number"]');
      const hasValidInputs = Array.from(inputs).some(input => {
        const amount = parseFloat(input.value) || 0;
        const original = parseFloat(input.dataset.originalValue) || 0;
        return amount > 0 && amount !== original;
      });
      if (hasValidInputs) {
        console.log(`Saving section: ${sectionId}`);
        saveSectionData(sectionId, category, inputs);
      } else {
        console.log(`No changes to save in ${category}`);
      }
    });
  });

  incomePeriodSelect.addEventListener('change', updateIncomeTotals);


  async function exportToExcel() {
    const transactions = await fetchTransactions();
    if (transactions.length === 0) {
      alert('No transactions to export!');
      return;
    }
    const exportData = transactions.map(tx => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Amount: `₹${tx.amount.toFixed(2)}`,
      Description: tx.description || 'N/A',
      Category: tx.category,
      Subcategory: tx.subcategory || 'N/A',
      Account: tx.account
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const profileData = {
        firstName: document.getElementById('firstName')?.value || '',
        middleName: document.getElementById('middleName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        gender: document.querySelector('input[name="gender"]:checked')?.id === 'male' ? 'Male' : 'Female',
        maritalStatus: document.querySelector('input[name="marital"]:checked')?.id === 'single' ? 'Single' : 'Married',
        dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
        occupation: document.getElementById('occupation')?.value || 'Financial Director',
        phoneNumber: document.getElementById('phoneNumber')?.value || '',
        city: document.getElementById('city')?.value || '',
        email: document.getElementById('email')?.value || user.email,
        incomeStability: document.querySelector('input[name="income"]:checked')?.value || '',
        investmentPercentage: document.querySelector('input[name="investment"]:checked')?.value || '',
        riskAppetite: document.querySelector('input[name="appetite"]:checked')?.value || ''
      };
      if (!validateProfileData(profileData)) return;
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(profileData)
        });
        if (!response.ok) throw new Error(`Profile save failed: HTTP ${response.status}`);
        const data = await response.json();
        alert(data.message || 'Profile saved successfully!');
      } catch (error) {
        console.error('Save profile error:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }

  if (saveTransactionBtn) {
    document.getElementById('saveTransactionBtn').addEventListener('click', async function (e) {
      e.preventDefault();
    
      const amount = document.getElementById('transactionAmount').value;
      const date = document.getElementById('transactionDate').value;
      const description = document.getElementById('transactionDescription').value;
      const category = document.getElementById('transactionCategory').value;
      const subcategory = document.getElementById('transactionSubcategory').value;
      const account = document.getElementById('transactionAccount').value;
    
      // Client-side validation
      if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      if (!date) {
        alert('Please select a date.');
        return;
      }
      if (!category) {
        alert('Please select a category.');
        return;
      }
      if (!account) {
        alert('Please select an account.');
        return;
      }
    
      const transactionData = {
        amount: parseFloat(amount),
        date,
        description: description || '',
        category,
        subcategory: subcategory || '',
        account
      };
    
      try {
        const response = await fetch(`${API_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(transactionData)
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save transaction');
        }
    
        alert(data.message || 'Transaction saved successfully!');
        // Reset form
        document.getElementById('transactionAmount').value = '';
        document.getElementById('transactionDate').value = '';
        document.getElementById('transactionDescription').value = '';
        document.getElementById('transactionCategory').value = '';
        document.getElementById('transactionSubcategory').value = '';
        document.getElementById('transactionAccount').value = '';
        // Refresh transactions
        fetchTransactions();
      } catch (err) {
        console.error('Error saving transaction:', err);
        alert(`Error: ${err.message}`);
      }
    });
  }

  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', exportToExcel);
  }

  window.deleteTransaction = async function(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error(`Transaction delete failed: HTTP ${response.status}`);
      const data = await response.json();
      alert(data.message || 'Transaction deleted successfully!');
      fetchTransactions();
      ['income', 'expenses', 'assets', 'liabilities','goals'].forEach(fetchSectionData);
    } catch (error) {
      console.error('Delete transaction error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (user.email && user.token) {
    fetchProfile();
    fetchTransactions();
    fetchCategories();
    fetchAccounts();
    ['income', 'expenses', 'assets', 'liabilities','goals'].forEach(fetchSectionData);
  }

  document.getElementById('transactionCategory').addEventListener('change', updateSubcategory);
  document.getElementById('editTransactionCategory').addEventListener('change', updateEditSubcategory);
  if (document.getElementById('editCategorySelect')) {
    document.getElementById('editCategorySelect').addEventListener('change', updateEditSubcategories);
  }


  const calculatorTab = document.getElementById('tab-calculator');
if (calculatorTab) {
  calculatorTab.addEventListener('click', function () {
    // Hide all other sections
    document.querySelectorAll('.form-container').forEach(section => {
      section.style.display = 'none';
    });

    // Show the calculator section
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection) {
      calculatorSection.style.display = 'block';
    }

    // Update active tab styling (optional)
    // document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    // this.classList.add('active');

    // Set current date if needed
    const today = new Date().toISOString().split('T')[0];
    const span = document.getElementById('currentDateCalculator');
    if (span) span.textContent = new Date().toLocaleDateString();
  });
}
// === Top Tab Event Listeners with Sync to Sidebar ===
const topTabMappings = {
  'tab-calculator': 'calculator',
  'tab-income': 'income',
  'tab-expenses': 'expenses',
  'tab-assets': 'assets',
  'tab-liabilities': 'liabilities',
  'tab-transactions': 'transactions',
  'tab-goals': 'goals',
  'tab-my-profile': 'my-profile', // assuming you have tab-profile
};

Object.entries(topTabMappings).forEach(([tabId, sectionId]) => {
  const tabEl = document.getElementById(tabId);
  if (tabEl) {
    tabEl.addEventListener('click', function () {
      showSection(sectionId);
      setActiveTopTab(sectionId);
      setActiveSidebarItem(sectionId);

      // If needed: fetch data, update charts, or update date
      if (sectionId === 'income') updateIncomeTotals();
      fetchSectionData(sectionId);

      // Optional: set current date if required
      const dateSpan = document.getElementById(`currentDate${capitalize(sectionId)}`);
      if (dateSpan) dateSpan.textContent = new Date().toLocaleDateString();
    });
  }
});

// Utility to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function setActiveTopTab(sectionId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  const tab = document.getElementById(`tab-${sectionId}`);
  if (tab) tab.classList.add('active');
}

function setActiveSidebarItem(sectionId) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const nav = document.getElementById(`nav-${sectionId}`);
  if (nav) nav.classList.add('active');
}




// function renderDashboardChartsFromTransactions(trans) {


//   const monthlyData = {};

//   trans.forEach(t => {
//     const date = new Date(t.date);
//     const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
//     if (!monthlyData[monthKey]) {
//       monthlyData[monthKey] = {
//         income: 0,
//         expense: 0,
//         assets: 0,
//         liabilities: 0
//       };
//     }
//     const amt = Number(t.amount);
//     switch (t.category) {
//       case 'Income': monthlyData[monthKey].income += amt; break;
//       case 'Expense': monthlyData[monthKey].expense += amt; break;
//       case 'Asset': monthlyData[monthKey].assets += amt; break;
//       case 'Liability': monthlyData[monthKey].liabilities += amt; break;
//     }
//   });

//   const labels = Object.keys(monthlyData).sort();

//   const incomeData = labels.map(month => monthlyData[month].income);
//   const expenseData = labels.map(month => monthlyData[month].expense);
//   const assetsData = labels.map(month => monthlyData[month].assets);
//   const liabilitiesData = labels.map(month => monthlyData[month].liabilities);
//   const savingsData = labels.map(
//     month => monthlyData[month].income - monthlyData[month].expense
//   );
//   renderIncomeExpenseChart(labels, incomeData, expenseData);
//   renderAssetsLiabilitiesChart(labels, assetsData, liabilitiesData);
//   renderSavingsChart(labels, savingsData);

//   let totalIncome = 0;
//   let totalExpense = 0;
//   let totalAssets = 0;
//   let totalLiabilities = 0;
  
//   transactions.forEach(t => {
//     const amount = parseFloat(t.amount);
//     if (t.category === 'Income') totalIncome += amount;
//     else if (t.category === 'Expense') totalExpense += amount;
//     else if (t.category === 'Asset') totalAssets += amount;
//     else if (t.category === 'Liability') totalLiabilities += amount;
//   });
  
//   // 💡 Update Total Cards
//   document.getElementById('totalIncomeCard').textContent = `₹${totalIncome.toLocaleString()}`;
//   document.getElementById('totalExpenseCard').textContent = `₹${totalExpense.toLocaleString()}`;
//   document.getElementById('totalAssetsCard').textContent = `₹${totalAssets.toLocaleString()}`;
//   document.getElementById('totalLiabilitiesCard').textContent = `₹${totalLiabilities.toLocaleString()}`;
  
  
//     
// }



function renderDashboardChartsFromTransactions(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalAssets = 0;
  let totalLiabilities = 0;
  

  const monthlyData = {};

  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    switch (t.category) {
      case 'Income': totalIncome += amt; break;
      case 'Expense': totalExpense += amt; break;
      case 'Asset': totalAssets += amt; break;
      case 'Liability': totalLiabilities += amt; break;
    }

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0, assets: 0, liabilities: 0 };
    }

    switch (t.category) {
      case 'Income': monthlyData[monthKey].income += amt; break;
      case 'Expense': monthlyData[monthKey].expense += amt; break;
      case 'Asset': monthlyData[monthKey].assets += amt; break;
      case 'Liability': monthlyData[monthKey].liabilities += amt; break;
    }
    // let savings=totalIncome-totalExpense;
    
  });

  // ✅ Update Total Summary Cards  
  document.getElementById('totalIncomeCard').textContent = `₹${totalIncome.toLocaleString()}`;
  document.getElementById('totalExpenseCard').textContent = `₹${totalExpense.toLocaleString()}`;
  document.getElementById('totalAssetsCard').textContent = `₹${totalAssets.toLocaleString()}`;
  document.getElementById('totalLiabilitiesCard').textContent = `₹${totalLiabilities.toLocaleString()}`;
  const totalSavings = totalIncome - totalExpense;
  document.getElementById('totalSavingsCard').textContent = `₹${totalSavings.toLocaleString()}`;


  

const totalGoals = transactions.filter(tx => tx.category === 'Goals')
  .reduce((sum, tx) => sum + tx.amount, 0);

const goalPercent = totalGoals > 0 ? (totalSavings / totalGoals) * 100 : 0;
const savingsUtilizationPercent = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

renderArcGauge('goalCompletionGauge', goalPercent, 'goalGaugeText', totalSavings, totalGoals);
renderArcGauge('assetLiabilityGauge', savingsUtilizationPercent, 'assetGaugeText', totalSavings, totalIncome);







  // ✅ Prepare Monthly Chart Data
  const labels = Object.keys(monthlyData).sort();
  const incomeData = labels.map(m => monthlyData[m].income);
  const expenseData = labels.map(m => monthlyData[m].expense);
  const assetsData = labels.map(m => monthlyData[m].assets);
  const liabilitiesData = labels.map(m => monthlyData[m].liabilities);
  const savingsData = labels.map(m => monthlyData[m].income - monthlyData[m].expense);

  renderIncomeExpenseChart(labels, incomeData, expenseData);
  renderAssetsLiabilitiesChart(labels, assetsData, liabilitiesData);
  renderSavingsChart(labels, savingsData);
  renderIncomeExpenseLineChart(labels, incomeData, expenseData);
  const currentMonth = new Date().getMonth();

  const thisMonthIncome = transactions
    .filter(tx => tx.type === 'Income' && new Date(tx.date).getMonth() === currentMonth)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const thisMonthExpense = transactions
    .filter(tx => tx.type === 'Expense' && new Date(tx.date).getMonth() === currentMonth)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  renderMonthlySpendingGauge(thisMonthIncome, thisMonthExpense);
    

}
let incomeExpenseLineChart;

function renderIncomeExpenseLineChart(labels, incomeData, expenseData) {
  const ctx = document.getElementById('incomeExpenseLineChart').getContext('2d');
  if (incomeExpenseLineChart) incomeExpenseLineChart.destroy();

  incomeExpenseLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.2)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Income vs Expense (Line)' },
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

  


let incomeExpenseChart, assetsLiabilitiesChart, savingsChart;



function renderIncomeExpenseChart(labels, incomeData, expenseData) {
  const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
  if (incomeExpenseChart) incomeExpenseChart.destroy();

  incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#48bb78'
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: '#f56565'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Monthly Income vs Expense'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}



function renderAssetsLiabilitiesChart(labels, assetsData, liabilitiesData) {
  const ctx = document.getElementById('assetsLiabilitiesChart').getContext('2d');
  if (assetsLiabilitiesChart) assetsLiabilitiesChart.destroy();

  assetsLiabilitiesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Assets',
          data: assetsData,
          backgroundColor: '#4299e1'
        },
        {
          label: 'Liabilities',
          data: liabilitiesData,
          backgroundColor: '#ed8936'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Monthly Assets vs Liabilities' },
        legend: { position: 'bottom' }
      }
    }
  });
}


function renderSavingsChart(labels, savingsData) {
  const ctx = document.getElementById('savingsChart').getContext('2d');
  if (savingsChart) savingsChart.destroy();

  savingsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Savings',
        data: savingsData,
        fill: false,
        borderColor: '#38b2ac',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Savings Over Time' },
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}



function renderCategoryPieCharts(transac) {
  function groupByCategory(transac, type) {
    const summary = {};
    transac
      .filter(t => t.category === type)
      .forEach(t => {
        const label = t.label || t.subcategory || 'Other';
        const amt = parseFloat(t.amount);
        if (!summary[label]) summary[label] = 0;
        summary[label] += amt;
      });

    return {
      labels: Object.keys(summary),
      values: Object.values(summary)
    };
  }

  function drawPieChart(canvasId, labels, data, title) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: generateColorPalette(labels.length)
        }]
      },
      options: {
        responsive: true,
        cutout:'60%',
        plugins: {
          legend: { position: 'bottom' },
          labels:{color:'white'},
          title: { display: true, text: title }
        }
      }
    });
  }

  function generateColorPalette(n) {
    const baseColors = [
      '#63b3ed', '#f6ad55', '#48bb78', '#ed64a6',
      '#667eea', '#f56565', '#fbd38d', '#38b2ac'
    ];
    return Array.from({ length: n }, (_, i) => baseColors[i % baseColors.length]);
  }

  // 👉 Render each category chart
  const income = groupByCategory(transac, 'Income');
  drawPieChart('incomePieChart', income.labels, income.values, 'Income Sources');

  const expense = groupByCategory(transac, 'Expense');
  drawPieChart('spendingPieChart', expense.labels, expense.values, 'Expense Categories');

  const assets = groupByCategory(transac, 'Asset');
  drawPieChart('assetsPieChart', assets.labels, assets.values, 'Asset Sources');

  const liabilities = groupByCategory(transac, 'Liability');
  drawPieChart('liabilitiesPieChart', liabilities.labels, liabilities.values, 'Liability Sources');
}


let goalGaugeChart, assetGaugeChart;

function renderDualGauges({ goalPercent, goalSaved, goalTotal, assetPercent, assets, liabilities }) {
  // Gauge 1 – Goal Completion
  const goalCtx = document.getElementById('goalCompletionGauge')?.getContext('2d');
  if (goalCtx) {
    if (goalGaugeChart) goalGaugeChart.destroy();
    goalGaugeChart = new Chart(goalCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [goalPercent, 100 - goalPercent],
          backgroundColor: [getGaugeColor(goalPercent), '#2d3748'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
    document.getElementById('gaugeText').textContent = `${goalPercent}%`;
    document.getElementById('goalStatsText').textContent = `₹${goalSaved.toLocaleString()} / ₹${goalTotal.toLocaleString()}`;
  }

  // Gauge 2 – Asset vs Liability Completion
  const assetCtx = document.getElementById('assetLiabilityGauge')?.getContext('2d');
  if (assetCtx) {
    if (assetGaugeChart) assetGaugeChart.destroy();
    assetGaugeChart = new Chart(assetCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [assetPercent, 100 - assetPercent],
          backgroundColor: [getGaugeColor(assetPercent), '#2d3748'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
    document.getElementById('assetGaugeText').textContent = `${assetPercent}%`;
    document.getElementById('assetStatsText').textContent = `₹${assets.toLocaleString()} / ₹${liabilities.toLocaleString()}`;
  }
}

function getGaugeColor(percent) {
  return percent >= 100 ? '#48bb78' : percent >= 50 ? '#ecc94b' : '#f56565';
}

function renderMonthlySpendingGauge(income, expense) {
  const canvasId = 'monthlySpendingGauge';
  const labelId = 'monthlySpendingGaugeText';
  const statsId = 'monthlySpendingStatsText';

  const percent = income > 0 ? Math.round((expense / income) * 100) : 0;
  const displayColor = percent < 50 ? '#22c55e' : percent < 90 ? '#facc15' : '#ef4444';

  // Update label
  document.getElementById(labelId).textContent = `${percent}%`;
  document.getElementById(statsId).textContent = `₹${expense.toLocaleString()} / ₹${income.toLocaleString()}`;

  const existingChart = Chart.getChart(canvasId);
  if (existingChart) existingChart.destroy();

  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: [displayColor, '#334155'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 180,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}



// });