import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Users, LayoutDashboard, ChartBar, PieChart, BookOpen, FileText, FolderOpen, ShieldCheck, CheckCircle, BarChart3, Award } from "lucide-react";

export default function Landing() {
  const {
    t
  } = useLanguage();
  const {
    isAuthenticated,
    user
  } = useAuth();
  return <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-left">
                COBAIN
              </h1>
              <p className="text-xl font-medium mb-6">Sistem Audit Mandiri</p>
              <p className="text-lg mb-8 opacity-90">
                {t("landing.description")}
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? <Link to={user?.role === "admin" ? "/admin-dashboard" : "/auditor-dashboard"}>
                    <Button size="lg" className="bg-white text-cobain-blue hover:bg-gray-100">
                      {t("landing.getStarted")}
                    </Button>
                  </Link> : <Link to="/login">
                    <Button size="lg" className="bg-white text-cobain-blue hover:bg-gray-100">
                      {t("landing.getStarted")}
                    </Button>
                  </Link>}
                <Button size="lg" variant="outline" className="border-white hover:bg-white/10 text-zinc-50">
                  {t("landing.learnMore")}
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" alt="COBAIN Logo" className="w-64 h-64 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Header section with COBIT 2019 overview */}
      <section className="py-16 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">COBIT 2019 Audit Framework</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive Online-Based Audit Instrument (COBAIN) is an integrated platform designed to simplify 
              and streamline the implementation of COBIT 2019 framework for IT governance and management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="bg-cobain-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Streamlined Assessment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simplifies the complex COBIT 2019 assessment process with structured questionnaires and guided workflows.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="bg-cobain-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Provides comprehensive gap analysis and visualization between current and target maturity levels.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="bg-cobain-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generates actionable recommendations based on assessment results to improve IT governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("landing.features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <Users className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.userManagement")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage users, roles, and permissions with a comprehensive access control system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <LayoutDashboard className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.assessment")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Conduct COBIT 2019 assessments with a structured and guided approach.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <ChartBar className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.maturity")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate maturity levels across COBIT domains and processes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <PieChart className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.gap")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize gaps between current and target maturity levels.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.recommendation")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get intelligent recommendations for improvement based on assessment results.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <FileText className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.reporting")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate comprehensive reports in multiple formats.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <FolderOpen className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.document")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Store and manage supporting documents and evidence.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="bg-cobain-blue/10 p-3 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8 text-cobain-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.features.audit")}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Maintain a comprehensive audit trail of all activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Using COBAIN</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Standardized Assessment Process</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ensures consistent application of COBIT 2019 framework across your organization.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Time and Resource Efficiency</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reduces the time and effort required to conduct comprehensive IT governance assessments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Evidence-Based Approach</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Supports documentation management for audit evidence and compliance purposes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-start mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Data-Driven Decision Making</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Provides actionable insights through comprehensive visualization and reporting.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Continuous Improvement</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enables tracking of improvement initiatives and progress against target maturity levels.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Regulatory Compliance</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Helps organizations meet regulatory requirements through structured governance frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-cobain-blue/10 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your audit journey?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join organizations worldwide that use COBAIN to implement and assess COBIT 2019 framework.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-cobain-blue hover:bg-cobain-navy">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple footer for landing page */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            COBAIN — (Comprehensive Online-Based Audit Instrument) © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>;
}
