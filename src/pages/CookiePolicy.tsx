import { useState } from 'react';
import {
  Cookie,
  Info,
  Layers,
  Target,
  Users,
  Settings,
  CheckCircle,
  RefreshCw,
  Mail,
  Sprout,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  BarChart3,
  Zap,
  Share2,
  FileText,
  Eye
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ icon, title, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-amber-50/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-green-100 to-amber-50 rounded-lg text-green-700">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

interface CookieTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples?: string[];
  color: string;
}

function CookieTypeCard({ icon, title, description, examples, color }: CookieTypeCardProps) {
  const { t } = useTranslation(); // Add hook for the static "Examples:" text
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-violet-50 border-violet-200 text-violet-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  };

  return (
    <div className={`rounded-lg border-2 p-5 transition-all duration-300 hover:shadow-md ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
          {examples && examples.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">{t('Examples:')}</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {examples.map((example, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CookiePolicy() {
  const { t } = useTranslation(); // Initialize the hook
  const lastUpdated = "January 1, 2024";

  return (
    <div className="pt-10 min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-amber-50">
      <Header />
      <div className="relative overflow-hidden bg-gradient-to-r from-green-700 via-green-600 to-amber-600 text-white">

        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sprout className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">{t('KrishiSanjivni')}</h1>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <Cookie className="w-10 h-10" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold">{t('Cookie Policy')}</h2>
          </div>

          <p className="text-lg text-green-50 max-w-3xl">
            {t('We use cookies to enhance your experience on KrishiSanjivni and provide you with personalized services. This policy explains how and why we use cookies on our platform.')}
          </p>
          <p className="text-sm text-green-100 mt-4">{t('Last Updated')}: {lastUpdated}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Info className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('What Are Cookies?')}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit our website. They help us recognize your device, remember your preferences, and improve your overall experience on KrishiSanjivni.')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('By using cookies, we can provide you with a more personalized experience, analyze how our platform is used, and continuously improve our services to better serve the farming community.')}
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('Your Control:')}</span> {t('You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Section icon={<Layers className="w-6 h-6" />} title={t('1. Types of Cookies We Use')} defaultOpen={true}>
            <p className="mb-6">
              {t("KrishiSanjivni uses different types of cookies to serve various purposes. Here's a breakdown of each type:")}
            </p>

            <div className="grid gap-4 mb-6">
              <CookieTypeCard
                icon={<Shield className="w-5 h-5" />}
                title={t('Essential Cookies')}
                description={t("These cookies are necessary for the website to function properly. Without them, you won't be able to use basic features like logging in, accessing your account, or using our services.")}
                examples={[
                  t("Session authentication cookies"),
                  t("Security cookies to prevent fraud"),
                  t("Load balancing cookies")
                ]}
                color="green"
              />

              <CookieTypeCard
                icon={<Zap className="w-5 h-5" />}
                title={t('Functional Cookies')}
                description={t("These cookies allow us to remember your preferences and choices (like your preferred language, region, or display settings) to provide you with a more personalized experience.")}
                examples={[
                  t("Language preference cookies"),
                  t("Theme and display settings"),
                  t("Recent searches and favorites")
                ]}
                color="blue"
              />

              <CookieTypeCard
                icon={<BarChart3 className="w-5 h-5" />}
                title={t('Analytical/Performance Cookies')}
                description={t("These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the platform's performance and user experience.")}
                examples={[
                  t("Google Analytics cookies"),
                  t("Page visit statistics"),
                  t("User journey tracking")
                ]}
                color="amber"
              />

              <CookieTypeCard
                icon={<Target className="w-5 h-5" />}
                title={t('Marketing Cookies')}
                description={t("These cookies track your online activity to help us deliver more relevant advertising and measure the effectiveness of our marketing campaigns. They may be set by our advertising partners.")}
                examples={[
                  t("Advertisement targeting cookies"),
                  t("Social media advertising pixels"),
                  t("Retargeting cookies")
                ]}
                color="purple"
              />

              <CookieTypeCard
                icon={<Eye className="w-5 h-5" />}
                title={t('Third-Party Cookies')}
                description={t("These cookies are set by external services we use on our website, such as analytics providers, social media platforms, and embedded content providers.")}
                examples={[
                  t("YouTube video embed cookies"),
                  t("Social media share buttons"),
                  t("Map service cookies")
                ]}
                color="orange"
              />
            </div>
          </Section>

          <Section icon={<Target className="w-6 h-6" />} title={t('2. How We Use Cookies')}>
            <div className="space-y-4">
              <p className="mb-4">
                {t("KrishiSanjivni uses cookies to enhance your experience and provide better services. Here's how we use them:")}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('Authentication & Security')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('To keep you logged in securely and protect your account from unauthorized access.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('Personalization')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('To remember your preferences, settings, and customizations, making your experience more tailored and efficient.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('Analytics & Performance')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('To analyze how users interact with our platform, identify popular features, and understand usage patterns to improve our services.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('Service Improvement')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('To identify bugs, test new features, and optimize the platform based on real user behavior and feedback.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('Relevant Content & Advertising')}</h4>
                    <p className="text-sm text-gray-700">
                      {t('To show you relevant content, recommendations, and advertisements that match your interests and farming needs.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section icon={<Share2 className="w-6 h-6" />} title={t('3. cookies2')}>
            <div className="space-y-4">
              <p className="mb-4">
                {t('In addition to our own cookies, we may also use various third-party cookies to enhance functionality and provide better services:')}
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-700" />
                  {t('Analytics Services')}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('We use analytics services like Google Analytics to understand how visitors use our website. These services use cookies to collect information about your usage patterns.')}
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('Google Analytics (tracking website traffic and user behavior)')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('Heat mapping tools (understanding how users interact with pages)')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-green-700" />
                  {t('Social Media Integration')}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('Our website includes social media features that may set cookies to enable sharing and interaction.')}
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('Facebook, Twitter, LinkedIn share buttons')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('YouTube video embeds')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('Social media login options')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-700" />
                  {t('Advertising Partners')}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('We work with advertising partners who may use cookies to deliver relevant ads based on your interests.')}
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{t('Google Ads and AdSense')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{t('Retargeting platforms')}</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 italic mt-4">
                {t("Note: These third-party services have their own privacy policies. We recommend reviewing their policies to understand how they collect and use your data.")}
              </p>
            </div>
          </Section>

          <Section icon={<Settings className="w-6 h-6" />} title={t('4. Managing Your Cookie Preferences')}>
            <div className="space-y-4">
              <p className="mb-4">
                {t("You have full control over how cookies are used on your device. Here's how you can manage your preferences:")}
              </p>

              <div className="bg-gradient-to-br from-green-50 to-amber-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-700" />
                  {t('Browser Settings')}
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('Most web browsers allow you to control cookies through their settings. You can:')}
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('View which cookies are stored and delete them individually')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('Block third-party cookies')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('Block all cookies from specific websites')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{t('Delete all cookies when you close your browser')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">{t('Browser-Specific Instructions:')}</h4>
                <div className="grid gap-3">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                    <span className="text-gray-700 font-medium">{t('Google Chrome')}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                    <span className="text-gray-700 font-medium">{t('Mozilla Firefox')}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                    <span className="text-gray-700 font-medium">{t('Safari')}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                    <span className="text-gray-700 font-medium">{t('Microsoft Edge')}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{t('Important:')}</span> {t('Blocking or deleting cookies may affect your ability to use certain features of KrishiSanjivni. Some functionality may not work properly without cookies enabled.')}
                </p>
              </div>
            </div>
          </Section>

          <Section icon={<CheckCircle className="w-6 h-6" />} title={t('5. Your Consent')}>
            <div className="space-y-4">
              <p className="mb-4">
                {t('By using KrishiSanjivni, you consent to our use of cookies as described in this Cookie Policy.')}
              </p>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-3">{t('What This Means:')}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t("When you first visit our website, you'll see a cookie consent banner where you can choose to accept or customize your preferences")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t("Essential cookies will be placed automatically as they're necessary for the website to function")}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t('Non-essential cookies (analytics, marketing) will only be set after you give explicit consent')}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t('You can withdraw your consent or change your preferences at any time through your browser settings')}
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 italic mt-4">
                {t('If you do not wish to accept cookies, you can adjust your browser settings before using our website.')}
              </p>
            </div>
          </Section>

          <Section icon={<RefreshCw className="w-6 h-6" />} title={t('6. Updates to This Cookie Policy')}>
            <div className="space-y-4">
              <p className="mb-4">
                {t('We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices.')}
              </p>

              <div className="bg-blue-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-800 mb-3">{t('When We Update This Policy:')}</h4>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('We will update the "Last Updated" date at the top of this page')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('Significant changes will be communicated through a notice on our website or via email')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('We encourage you to review this policy periodically')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{t('Continued use of our website after changes indicates acceptance of the updated policy')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <Section icon={<Mail className="w-6 h-6" />} title={t('7. Contact Us')}>
            <div className="space-y-4">
              <p className="text-gray-700 mb-4">
                {t("If you have any questions, concerns, or requests regarding our Cookie Policy or how we use cookies, please don't hesitate to contact us:")}
              </p>

              <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{t('Email')}</p>
                    <a href="mailto:privacy@KrishiSanjivni.com" className="text-green-700 hover:text-green-800 font-medium">
                      privacy@KrishiSanjivni.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{t('General Support')}</p>
                    <a href="mailto:support@krishisanjivni.com" className="text-green-700 hover:text-green-800 font-medium">
                      support@krishisanjivni.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Sprout className="w-5 h-5 text-green-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-600">{t('Website')}</p>
                    <a href="https://neerajportfolio-mocha.vercel.app/" className="text-green-700 hover:text-green-800 font-medium">
                      {t("Admin's Website")}
                    </a>
                  </div>
                </div>
              </div>

              <Link to="/contact"><button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 mt-4">
                <Mail className="w-5 h-5" />
                {t('Contact Our Privacy Team')}
              </button></Link>
            </div>
          </Section>
        </div>

        {/* Related Policies Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md border border-amber-100 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{t('Related Policies')}</h3>
          <p className="text-gray-600 text-center mb-6">
            {t('For more information about how we protect your data and our platform terms, please review:')}
          </p>

          <div className="grid md:grid-cols-2 gap-4">

            {/* Privacy Policy Card */}
            <Link
              to="/privacy-policy"
              className="flex items-center justify-between p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-700" />
                <div>
                  <p className="font-semibold text-gray-800">{t('Privacy Policy')}</p>
                  <p className="text-xs text-gray-600">{t('How we handle your data')}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </Link>

            {/* Terms of Service Card */}
            <Link
              to="/terms-of-service"
              className="flex items-center justify-between p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-amber-700" />
                <div>
                  <p className="font-semibold text-gray-800">{t('Terms of Service')}</p>
                  <p className="text-xs text-gray-600">{t('Platform usage terms')}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </Link>

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default CookiePolicy;