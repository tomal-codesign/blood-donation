// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to public home page
  redirect('/home');
}