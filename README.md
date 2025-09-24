Vitascan
Vitascan is a Next.js web application for symptom checking, user health profile management, and sharing scan results. It leverages Supabase for authentication, database, and storage, and uses Tailwind CSS for styling.


Features
User Authentication: Sign up, log in, and manage your profile securely.
Symptom Checker: Select symptoms from a comprehensive list and save your scans.
Scan History: View your previous scans and analyze your health trends.
Share Scans: Share scan results with others via public links.
Responsive UI: Built with shadcn/ui and Tailwind CSS.


Tech Stack
Next.js
Supabase
Tailwind CSS
shadcn/ui
Lucide Icons


Getting Started
Prerequisites
Node.js (v18+ recommended)
pnpm or npm
Supabase project (get your API keys from the Supabase dashboard)


Installation
Clone the repository:
git clone 
cd vitascan


Install dependencies:
pip install pandas numpy scikit-learn
npm install next react react-dom


Configure environment variables:
Create a .env.local file in the root directory and add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key


Set up the database:
Run the SQL script in setup-database.sql on your Supabase project's SQL editor to create the necessary tables and policies.


Running the App
cd scripts
python3 load-data.py
npm run dev



Project Structure
app – Next.js app directory (pages, API routes, shared layouts)
components – Reusable UI components
hooks – Custom React hooks
lib – Supabase client and utilities
public – Static assets
scripts – Database setup scripts
styles – Global and component styles


Customization
UI Components: Uses shadcn/ui for consistent, customizable components.
Styling: Tailwind CSS configuration in tailwind.config.js.
Authentication & Database: Supabase configuration in supabase.ts.