import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChartBar, CreditCard, PiggyBank, Shield } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import threeImage from '../../assets/welcompage/three.jpg';
import fourImage from '../../assets/welcompage/four.jpg';

// Feature item component for reuse
const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 text-blue-600">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="mt-6 text-xl font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-base text-gray-500 text-center">{description}</p>
  </div>
);

// Testimonial component for reuse
const Testimonial = ({ quote, name, title }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <p className="text-gray-600 italic">"{quote}"</p>
    <div className="mt-4 flex items-center">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-blue-200"></div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  </div>
);

// CheckItem component for reuse
const CheckItem = ({ text }) => (
  <li className="flex items-start">
    <div className="flex-shrink-0">
      <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <p className="ml-3 text-base text-gray-500">{text}</p>
  </li>
);

function WelcomePage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // If user is logged in, don't render the welcome page
  if (currentUser) {
    return null;
  }

  // Feature data
  const features = [
    {
      icon: CreditCard,
      title: "Transaction Tracking",
      description: "Record and categorize all your expenses and income in one place."
    },
    {
      icon: ChartBar,
      title: "Budgeting Tools",
      description: "Create and manage budgets to keep your spending in check."
    },
    {
      icon: PiggyBank,
      title: "Savings Goals",
      description: "Set and track progress toward your financial goals."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and never shared with third parties."
    }
  ];

  // Testimonial data
  const testimonials = [
    {
      quote: "This app changed how I manage my money. I've saved more in the last 3 months than I did all of last year!",
      name: "Sarah Johnson",
      title: "Marketing Professional"
    },
    {
      quote: "The budgeting tools are incredible. I can finally see where my money is going and make better decisions.",
      name: "Michael Rodriguez",
      title: "Software Engineer"
    }
  ];

  // Visualization benefits data
  const visualizationBenefits = [
    "Interactive charts and graphs",
    "Monthly progress reports",
    "Customizable budget categories"
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="lg:flex lg:items-center lg:space-x-8">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Take control of your</span>
              <span className="block text-blue-600">financial future</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
              Track expenses, set budgets, and achieve your financial goals with our easy-to-use personal finance tracker.
            </p>
            <div className="mt-10 flex justify-center lg:justify-start gap-x-6">
              <Link
                to="/register"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition duration-150 ease-in-out flex items-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-md transition duration-150 ease-in-out"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:w-1/2">
            <img
              src={threeImage}
              alt="Financial planning illustration"
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our comprehensive set of tools helps you stay on top of your financial health.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image with Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:space-x-8">
            <div className="lg:w-1/2 mb-10 lg:mb-0 lg:order-2">
              <img
                src={fourImage}
                alt="Financial success visualization"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
            <div className="lg:w-1/2 lg:order-1">
              <h2 className="text-3xl font-extrabold text-gray-900">Visualize your financial progress</h2>
              <p className="mt-4 text-lg text-gray-500">
                Our intuitive dashboards and reports help you see where your money is going and how close you are to achieving your financial goals.
              </p>
              <div className="mt-6">
                <ul className="space-y-3">
                  {visualizationBenefits.map((benefit, index) => (
                    <CheckItem key={index} text={benefit} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Join thousands of satisfied users
            </h2>
          </div>
          <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-4xl">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                quote={testimonial.quote}
                name={testimonial.name}
                title={testimonial.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 lg:px-12 lg:py-16">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white">
                  Ready to take control of your finances?
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                  Sign up now and start your journey to financial freedom.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex rounded-md shadow">
                    <Link
                      to="/register"
                      className="px-5 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50"
                    >
                      Create Free Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex items-center justify-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Finance Tracker
              </Link>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;