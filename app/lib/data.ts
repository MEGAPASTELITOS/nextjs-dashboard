import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
  LatestInvoice,
  Customer,
} from './definitions';
import { formatCurrency } from './utils';
import axios from 'axios';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  try {
 
    const revenue = await axios.get("https://nest-dashboar.onrender.com/revenue")
    return revenue.data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await axios.get("https://nest-dashboar.onrender.com/invoices")
    const invoices:LatestInvoiceRaw[] = data.data.data


    const latestInvoices = invoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    
    const dataInvoices = await axios.get("https://nest-dashboar.onrender.com/invoices")
    const invoices:LatestInvoice[] = await dataInvoices.data.data

    const customerData = await axios.get("https://nest-dashboar.onrender.com/customers")
    const customer:Customer[] = await customerData.data

    const InvoicesDataPain = await axios.get("https://nest-dashboar.onrender.com/invoices?status=PAID")
    const invoicesPaid:LatestInvoice[] = await InvoicesDataPain.data.data

    const InvoicesDataPending = await axios.get("https://nest-dashboar.onrender.com/invoices?status=PENDING")
    const invoicesPending:LatestInvoice[] = await InvoicesDataPending.data.data

    let invoicesPaidNumber = 0;
    invoicesPaid.forEach(invoice => {
      invoicesPaidNumber += Number(invoice.amount);
    });
    
    let invoicesPendingNumber = 0;
    invoicesPending.forEach(invoice => {
      invoicesPendingNumber += Number(invoice.amount);
    });

    const numberOfCustomer = customer.length;
    const numberOfInvoices = invoices.length;
    return {
      numberOfCustomer,
      numberOfInvoices,
      invoicesPaidNumber,
      invoicesPendingNumber,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    if(query){
      const response = await axios.get(`https://nest-dashboar.onrender.com/invoices?take=${ITEMS_PER_PAGE}&skip=${offset}&name=${query}`)
      const  invoices:LatestInvoice[] = response.data.data
      return  invoices;
    }

    const response = await axios.get(`https://nest-dashboar.onrender.com/invoices?take=${ITEMS_PER_PAGE}&skip=${offset}`)
    const  invoices:LatestInvoice[] = response.data.data

    return  invoices;
  } catch (error) {
    console.error('Database Error:', await error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
  const dataInvoices = await axios.get(`https://nest-dashboar.onrender.com/invoices?name=${query}`)
  console.log(dataInvoices)
    const totalPages = Math.ceil(Number(dataInvoices.data.length) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const dataInvoices = await axios.get(`https://nest-dashboar.onrender.com/invoices/${id}`)

    const invoice = dataInvoices.data.data.amount = dataInvoices.data.data.amount / 100

    return invoice
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await axios.get(`https://nest-dashboar.onrender.com/customers`)

    const customers = data.data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data:Customer[] = await axios.get(`https://nest-dashboar.onrender.com/customers`)

    data.map(customer => {
      return {
        ...customer,
        total_pending:0,
        total_paid:0
      }
    })
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
