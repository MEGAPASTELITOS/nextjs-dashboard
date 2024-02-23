"use server"
import { z } from 'zod';
import axios from 'axios';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['PENDING', 'PAID']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export const createInvoice = async (formData:FormData)  => {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

      const amountInCents = amount * 100;
      const date = new Date().toISOString().split('T')[0];

  await axios.post(`https://nest-dashboar.onrender.com/customers/${customerId}/invoices`,{
    amount:`${amountInCents}`,
    status:status,
    date:date,
  })

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices")
}