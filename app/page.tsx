import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Shield, Clock, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm text-blue-600 dark:text-blue-400">
                AI-Powered Healthcare
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Advanced AI Medical Diagnosis at Your Fingertips
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Get instant symptom analysis and medical insights powered by cutting-edge artificial intelligence. Fast,
                accurate, and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link href="/symptom-checker">Start Symptom Check</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/AI_doctors.jpg"
                  alt="AI Medical Diagnosis"
                  className="w-full h-auto object-cover"
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose VitaScan?</h2>
            <p className="text-muted-foreground md:text-xl max-w-3xl mx-auto">
              Our AI-powered platform provides accurate symptom analysis with advanced features designed for your health
              and safety.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <Brain className="h-12 w-12 text-primary mb-2" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced machine learning algorithms analyze your symptoms against vast medical databases for accurate
                  insights.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Clock className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get immediate analysis of your symptoms without waiting for appointments or long queues.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Shield className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your health data is encrypted and protected with enterprise-grade security measures.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Star className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Comprehensive Database</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access to extensive medical knowledge base covering hundreds of symptoms and conditions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Start Your Health Journey Today</h2>
            <p className="md:text-xl">
              Get instant insights about your symptoms and take control of your health with VitaScan.
            </p>
            <div className="flex justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/symptom-checker">Try Symptom Checker</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
