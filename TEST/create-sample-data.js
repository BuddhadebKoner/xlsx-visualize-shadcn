import XLSX from 'xlsx';

// Sample data generators
function generateSalesData() {
   const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
   const products = ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Monitor', 'Keyboard', 'Mouse'];
   const regions = ['North', 'South', 'East', 'West', 'Central'];
   const salespeople = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emily Davis'];

   const data = [];

   for (let i = 0; i < 200; i++) {
      const month = months[Math.floor(Math.random() * months.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const salesperson = salespeople[Math.floor(Math.random() * salespeople.length)];

      // Generate realistic sales data
      const quantity = Math.floor(Math.random() * 50) + 1;
      const basePrice = {
         'Laptop': 1200,
         'Smartphone': 800,
         'Tablet': 500,
         'Headphones': 150,
         'Monitor': 300,
         'Keyboard': 80,
         'Mouse': 30
      }[product];

      const unitPrice = basePrice + (Math.random() * 200 - 100); // Add some variance
      const revenue = quantity * unitPrice;
      const cost = revenue * (0.6 + Math.random() * 0.2); // 60-80% of revenue
      const profit = revenue - cost;

      data.push({
         'Date': `2024-${months.indexOf(month) + 1 < 10 ? '0' : ''}${months.indexOf(month) + 1}-${Math.floor(Math.random() * 28) + 1 < 10 ? '0' : ''}${Math.floor(Math.random() * 28) + 1}`,
         'Month': month,
         'Product': product,
         'Region': region,
         'Salesperson': salesperson,
         'Quantity': quantity,
         'Unit Price': Math.round(unitPrice * 100) / 100,
         'Revenue': Math.round(revenue * 100) / 100,
         'Cost': Math.round(cost * 100) / 100,
         'Profit': Math.round(profit * 100) / 100,
         'Profit Margin (%)': Math.round((profit / revenue) * 100 * 100) / 100
      });
   }

   return data;
}

function generateEmployeeData() {
   const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
   const positions = {
      'Engineering': ['Software Engineer', 'Senior Engineer', 'Team Lead', 'Architect'],
      'Marketing': ['Marketing Specialist', 'Content Creator', 'SEO Specialist', 'Marketing Manager'],
      'Sales': ['Sales Rep', 'Account Manager', 'Sales Director', 'Business Development'],
      'HR': ['HR Specialist', 'Recruiter', 'HR Manager', 'Benefits Coordinator'],
      'Finance': ['Accountant', 'Financial Analyst', 'Controller', 'CFO'],
      'Operations': ['Operations Specialist', 'Project Manager', 'Operations Director', 'Coordinator']
   };

   const data = [];

   for (let i = 1; i <= 100; i++) {
      const department = departments[Math.floor(Math.random() * departments.length)];
      const position = positions[department][Math.floor(Math.random() * positions[department].length)];
      const experience = Math.floor(Math.random() * 15) + 1;

      // Generate realistic salary based on department and experience
      const baseSalary = {
         'Engineering': 80000,
         'Marketing': 60000,
         'Sales': 55000,
         'HR': 58000,
         'Finance': 65000,
         'Operations': 62000
      }[department];

      const salary = baseSalary + (experience * 3000) + (Math.random() * 20000 - 10000);
      const age = 22 + experience + Math.floor(Math.random() * 10);

      data.push({
         'Employee ID': `EMP${i.toString().padStart(3, '0')}`,
         'Name': `Employee ${i}`,
         'Department': department,
         'Position': position,
         'Age': age,
         'Years of Experience': experience,
         'Annual Salary': Math.round(salary),
         'Performance Score': Math.floor(Math.random() * 5) + 1,
         'Satisfaction Score': Math.floor(Math.random() * 10) + 1,
         'Training Hours': Math.floor(Math.random() * 40) + 10
      });
   }

   return data;
}

function generateInventoryData() {
   const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
   const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E'];
   const warehouses = ['Warehouse 1', 'Warehouse 2', 'Warehouse 3', 'Main Hub'];

   const data = [];

   for (let i = 1; i <= 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];

      const stockLevel = Math.floor(Math.random() * 1000) + 50;
      const reorderPoint = Math.floor(stockLevel * 0.2);
      const unitCost = Math.random() * 100 + 5;
      const sellingPrice = unitCost * (1.5 + Math.random() * 0.8); // 150-230% markup

      data.push({
         'Product ID': `PRD${i.toString().padStart(3, '0')}`,
         'Product Name': `Product ${i}`,
         'Category': category,
         'Supplier': supplier,
         'Warehouse': warehouse,
         'Stock Level': stockLevel,
         'Reorder Point': reorderPoint,
         'Unit Cost': Math.round(unitCost * 100) / 100,
         'Selling Price': Math.round(sellingPrice * 100) / 100,
         'Total Value': Math.round(stockLevel * unitCost * 100) / 100,
         'Days Since Last Order': Math.floor(Math.random() * 90) + 1,
         'Status': stockLevel > reorderPoint ? 'In Stock' : 'Low Stock'
      });
   }

   return data;
}

function generateCustomerData() {
   const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan'];
   const segments = ['Premium', 'Standard', 'Basic'];
   const sources = ['Website', 'Social Media', 'Email', 'Referral', 'Advertisement'];

   const data = [];

   for (let i = 1; i <= 120; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const segment = segments[Math.floor(Math.random() * segments.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];

      const monthsSinceFirstPurchase = Math.floor(Math.random() * 24) + 1;
      const totalOrders = Math.floor(Math.random() * 20) + 1;
      const avgOrderValue = Math.random() * 200 + 50;
      const totalSpent = totalOrders * avgOrderValue * (0.8 + Math.random() * 0.4);

      data.push({
         'Customer ID': `CUST${i.toString().padStart(3, '0')}`,
         'Customer Name': `Customer ${i}`,
         'Country': country,
         'Segment': segment,
         'Acquisition Source': source,
         'Registration Date': `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
         'Total Orders': totalOrders,
         'Total Spent': Math.round(totalSpent * 100) / 100,
         'Average Order Value': Math.round(avgOrderValue * 100) / 100,
         'Months Since First Purchase': monthsSinceFirstPurchase,
         'Customer Lifetime Value': Math.round(totalSpent * 1.5 * 100) / 100,
         'Is Active': Math.random() > 0.2 ? 'Yes' : 'No'
      });
   }

   return data;
}

// Create workbook with multiple sheets
function createSampleWorkbook() {
   const wb = XLSX.utils.book_new();

   // Add Sales Data sheet
   const salesData = generateSalesData();
   const salesWS = XLSX.utils.json_to_sheet(salesData);
   XLSX.utils.book_append_sheet(wb, salesWS, 'Sales Data');

   // Add Employee Data sheet
   const employeeData = generateEmployeeData();
   const employeeWS = XLSX.utils.json_to_sheet(employeeData);
   XLSX.utils.book_append_sheet(wb, employeeWS, 'Employee Data');

   // Add Inventory Data sheet
   const inventoryData = generateInventoryData();
   const inventoryWS = XLSX.utils.json_to_sheet(inventoryData);
   XLSX.utils.book_append_sheet(wb, inventoryWS, 'Inventory Data');

   // Add Customer Data sheet
   const customerData = generateCustomerData();
   const customerWS = XLSX.utils.json_to_sheet(customerData);
   XLSX.utils.book_append_sheet(wb, customerWS, 'Customer Data');

   return wb;
}

// Generate and save the sample data
console.log('Generating comprehensive sample data...');

try {
   const workbook = createSampleWorkbook();

   // Save as Excel file
   XLSX.writeFile(workbook, 'comprehensive-sample-data.xlsx');
   console.log('✅ Created comprehensive-sample-data.xlsx');

   // Also create individual CSV files for easier testing
   const salesData = generateSalesData();
   const salesWB = XLSX.utils.book_new();
   const salesWS = XLSX.utils.json_to_sheet(salesData);
   XLSX.utils.book_append_sheet(salesWB, salesWS, 'Sales');
   XLSX.writeFile(salesWB, 'sample-sales-data.csv', { bookType: 'csv' });
   console.log('✅ Created sample-sales-data.csv');

   const employeeData = generateEmployeeData();
   const employeeWB = XLSX.utils.book_new();
   const employeeWS = XLSX.utils.json_to_sheet(employeeData);
   XLSX.utils.book_append_sheet(employeeWB, employeeWS, 'Employees');
   XLSX.writeFile(employeeWB, 'sample-employee-data.csv', { bookType: 'csv' });
   console.log('✅ Created sample-employee-data.csv');

   console.log('\n📊 Sample data created successfully!');
   console.log('\nFiles created:');
   console.log('• comprehensive-sample-data.xlsx (4 sheets with different data types)');
   console.log('• sample-sales-data.csv (200 sales records)');
   console.log('• sample-employee-data.csv (100 employee records)');

   console.log('\n🎯 Perfect for testing:');
   console.log('• Bar charts: Revenue by Month, Profit by Product, Salary by Department');
   console.log('• Line charts: Sales trends over time, Performance trends');
   console.log('• Pie charts: Revenue by Region, Orders by Customer Segment');
   console.log('• Table filtering and search functionality');

} catch (error) {
   console.error('❌ Error creating sample data:', error);
}
