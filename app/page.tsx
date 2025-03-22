import Link from "next/link" 
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, PieChart, TrendingUp, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 sm:px-8 md:px-8 lg:px-10">
          <div className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>BudgetAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">How It Works</Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="outline">Log In</Button></Link>
            <Link href="/signup"><Button>Sign Up</Button></Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Manage Your Finances with AI-Powered Insights
                </h1>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Track expenses, set budgets, and get personalized financial recommendations powered by AI.
                </p>
              </div>
              <div className="flex justify-center">
                <Link href="/signup">
                  <Button size="lg" className="gap-1">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Powerful Features</h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl">
                  Everything you need to take control of your finances
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {/* Feature Cards */}
              {[
                { title: "Expense Tracking", icon: BarChart3, desc: "Easily log and categorize your expenses to keep track of your spending habits." },
                { title: "Budget Management", icon: PieChart, desc: "Create and manage budgets for different categories to stay on top of your financial goals." },
                { title: "AI Insights", icon: TrendingUp, desc: "Get personalized recommendations and insights based on your spending patterns." },
                { title: "Secure Authentication", icon: Shield, desc: "Your financial data is protected with secure authentication and encryption." }
              ].map(({ title, icon: Icon, desc }, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm bg-white">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-center text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 md:py-10">
        <div className="container mx-auto flex flex-col items-center justify-between px-6 sm:px-8 md:px-12 lg:px-16 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 BudgetAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Terms</Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
