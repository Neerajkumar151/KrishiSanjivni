import { Sprout, Shield, Lock, Eye, Cookie, Users, FileText, Mail, ChevronRight, Database, Server, Globe, UserCheck, Layout } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/Footer';
import i18n from '@/lib/i18n';
import { useTranslation, Trans } from 'react-i18next'; // Import Trans

function PrivacyPolicy() {
  const { t } = useTranslation(); // Initialize the hook

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-amber-50 to-green-50">
      <Header />
      {/* Hero Section */}
      <section className="pt-5 pb-1 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 via-amber-50/20 to-green-50/30 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
            <Shield className="w-5 h-5" />
            {t('Your Privacy Matters')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('Privacy Policy')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("At KrishiSanjivni, we're committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.")}
          </p>
          <div className="mt-8 text-sm text-gray-500">
            {t('Last Updated: October 18, 2025')}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-2 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Introduction */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed mb-0">
              {t('Welcome to KrishiSanjivni! We understand that trust is essential, especially when it comes to your personal and farming data. This Privacy Policy explains in simple terms how we handle your information when you use our platform for tool rentals, warehouse bookings, soil analysis, market insights, and more.')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t("We believe in transparency and want you to feel confident that your data is safe with us. If you have any questions, please don't hesitate to reach out to our team.")}
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('Information We Collect')}</h2>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {t('To provide you with the best farming solutions, we collect the following types of information:')}
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6 py-2">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  {t('Personal Information')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Name, email address, phone number, and location')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Farm details including size, crop types, and location coordinates')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Profile information you choose to share')}</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 pl-6 py-2">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  {t('Service Usage Data')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Tool and equipment rental bookings and history')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Warehouse storage bookings and preferences')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Soil testing results, NPK values, pH readings, and recommendations')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Weather queries and advisory requests')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Market information searches and Mandi price checks')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{t('AI chatbot conversations and queries (to improve responses)')}</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  {t('Technical Information')}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Device type, browser information, and operating system')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{t('IP address and approximate location (for localized services)')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{t('Usage patterns, pages visited, and time spent on platform')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('How We Use Your Information')}</h2>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {t('We use your information to provide, improve, and personalize your KrishiSanjivni experience:')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('Service Delivery')}</h3>
                <p className="text-gray-700">{t('Process tool rentals, warehouse bookings, and provide soil analysis results and recommendations.')}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('Personalization')}</h3>
                <p className="text-gray-700">{t('Tailor market insights, weather updates, and farming advice based on your location and crop types.')}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('Communication')}</h3>
                <p className="text-gray-700">{t('Send important updates, alerts, booking confirmations, and agricultural advisories.')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('Platform Improvement')}</h3>
                <p className="text-gray-700">{t('Analyze usage patterns to enhance features, fix bugs, and develop new farming solutions.')}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('AI Training')}</h3>
                <p className="text-gray-700">{t("Improve our AI assistant's responses using anonymized conversation data.")}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('Support & Safety')}</h3>
                <p className="text-gray-700">{t('Provide customer support and ensure platform security and fraud prevention.')}</p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-xl p-8 md:p-12 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">{t('Data Security')}</h2>
              </div>

              <p className="text-lg text-green-50 mb-6 leading-relaxed">
                {t('Your data security is our top priority. We implement industry-standard security measures to protect your information:')}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="w-6 h-6 text-green-200" />
                    <h3 className="text-lg font-bold">{t('Encryption')}</h3>
                  </div>
                  <p className="text-green-50">{t('All data is encrypted in transit and at rest using bank-grade SSL/TLS protocols.')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-green-200" />
                    <h3 className="text-lg font-bold">{t('Secure Storage')}</h3>
                  </div>
                  <p className="text-green-50">{t('Data is stored on secure servers with restricted access and regular security audits.')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-6 h-6 text-green-200" />
                    <h3 className="text-lg font-bold">{t('Access Control')}</h3>
                  </div>
                  <p className="text-green-50">{t('Strict authentication and authorization protocols ensure only authorized personnel access data.')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-6 h-6 text-green-200" />
                    <h3 className="text-lg font-bold">{t('Monitoring')}</h3>
                  </div>
                  <p className="text-green-50">{t('24/7 security monitoring and regular vulnerability assessments to prevent breaches.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies & Tracking */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                <Cookie className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('Cookies & Tracking')}</h2>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {t('Like most modern websites, we use cookies and similar technologies to enhance your experience:')}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg mt-1">
                  <ChevronRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('Essential Cookies')}</h3>
                  <p className="text-gray-700">{t('Required for basic platform functionality like login sessions and security features.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-amber-100 p-2 rounded-lg mt-1">
                  <ChevronRight className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('Functional Cookies')}</h3>
                  <p className="text-gray-700">{t('Remember your preferences, language settings, and personalized features.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg mt-1">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('Analytics Cookies')}</h3>
                  <p className="text-gray-700">{t('Help us understand how you use KrishiSanjivni so we can improve the platform.')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-gray-700">
                <span className="font-bold text-gray-900">{t('Your Control:')}</span> {t('You can manage cookie preferences through your browser settings. Note that disabling essential cookies may affect platform functionality.')}
              </p>
            </div>
          </div>

          {/* User Rights */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('Your Rights & Data Access')}</h2>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {t('You have full control over your personal data. Here are your rights:')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-green-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Access Your Data')}</h3>
                <p className="text-gray-700 mb-3">{t('Request a copy of all personal information we hold about you.')}</p>
                <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
                  {t('Request Data')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="border-2 border-amber-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Correct Information')}</h3>
                <p className="text-gray-700 mb-3">{t('Update or correct any inaccurate personal information.')}</p>
                <button className="text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-1 group">
                  {t('Update Profile')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="border-2 border-blue-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Delete Your Account')}</h3>
                <p className="text-gray-700 mb-3">{t('Request permanent deletion of your account and associated data.')}</p>
                <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group">
                  {t('Delete Account')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="border-2 border-green-200 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Export Your Data')}</h3>
                <p className="text-gray-700 mb-3">{t('Download your data in a portable, machine-readable format.')}</p>
                <button className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 group">
                  {t('Export Data')} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
              <p className="text-gray-700">
                <Trans i18nKey="needHelpSupport">
                  <span className="font-bold text-gray-900">Need Help?</span> Contact our support team at{' '}
                  <a href="mailto:privacy@KrishiSanjivni.com" className="text-green-600 font-semibold hover:underline">
                    privacy@KrishiSanjivni.com
                  </a>{' '}
                  to exercise any of these rights.
                </Trans>
              </p>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('Third-Party Services')}</h2>
            </div>

            <p className="text-lg text-gray-700 mb-6">
              {t('To provide comprehensive farming solutions, we partner with trusted third-party services:')}
            </p>

            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Weather Data Providers')}</h3>
                <p className="text-gray-700">{t('We use trusted meteorological services to provide accurate, hyper-local weather forecasts and alerts. Your location data is shared only to deliver relevant weather information.')}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Market Data Aggregators')}</h3>
                <p className="text-gray-700">{t('Real-time Mandi prices and crop demand insights are sourced from verified agricultural market data providers.')}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Payment Processors')}</h3>
                <p className="text-gray-700">{t('Secure payment processing for tool rentals and warehouse bookings through industry-leading payment gateways. We do not store your payment card details.')}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('Cloud Storage Providers')}</h3>
                <p className="text-gray-700">{t('Your data is stored on secure, GDPR-compliant cloud infrastructure with multiple backups and redundancy measures.')}</p>
              </div>
            </div>

            <div className="mt-6 p-6 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-gray-700">
                <span className="font-bold text-gray-900">{t('Important:')}</span> {t('We carefully vet all third-party partners and ensure they meet our strict privacy and security standards. We never sell your personal data to third parties.')}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-xl p-8 md:p-12 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">{t('Contact Us')}</h2>
            </div>

            <p className="text-lg text-green-50 mb-8 leading-relaxed">
              {t("Have questions about this Privacy Policy or how we handle your data? We're here to help!")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <h3 className="text-lg font-bold mb-2">{t('Email Us')}</h3>
                <a href="mailto:privacy@KrishiSanjivni.com" className="text-green-100 hover:text-white transition-colors">
                  privacy@KrishiSanjivni.com
                </a>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <h3 className="text-lg font-bold mb-2">{t('Call Us')}</h3>
                <a href="tel:+911800KrishiSanjivni" className="text-green-100 hover:text-white transition-colors">
                  8448275790
                </a>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 md:col-span-2">
                <h3 className="text-lg font-bold mb-2">{t('Mailing Address')}</h3>
                <p className="text-green-100">
                  <Trans i18nKey="mailingAddress">
                    KrishiSanjivni Technologies Pvt. Ltd.<br />
                    Agricultural Innovation Center<br />
                    Sector 62, Noida, Uttar Pradesh 201309<br />
                    India
                  </Trans>
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <h3 className="text-lg font-bold mb-3">{t('Response Time')}</h3>
              <p className="text-green-50">
                {t('We typically respond to privacy inquiries within 48 hours during business days. For urgent security concerns, please mark your email as "Urgent" in the subject line.')}
              </p>
            </div>
          </div>

          {/* Policy Updates */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mt-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Policy Updates')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t("We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make significant changes, we'll notify you via email or through a prominent notice on our platform.")}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {t("We encourage you to review this Privacy Policy periodically to stay informed about how we're protecting your information.")}
            </p>
          </div>

        </div>
      </section>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;