import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, BarChart3, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14 lg:pt-20 pb-20 overflow-hidden">
         <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Build powerful forms <br/>
            <span className="text-primary">in seconds, not hours.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            FormApp Pro allows you to create, share, and analyze forms with ease. 
            From simple contact forms to complex surveys, we've got you covered.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/register" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all">
              Create Form Now
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-primary">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Deploy Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to manage data
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                {
                  name: 'Drag & Drop Builder',
                  description: 'Intuitive interface to build forms. Text, numbers, dropdowns, and more.',
                  icon: FileText,
                },
                {
                  name: 'Secure & Reliable',
                  description: 'Data is stored securely. Built-in authentication and session management.',
                  icon: Shield,
                },
                {
                  name: 'Data Insights',
                  description: 'View submissions in real-time. Export to CSV for analysis.',
                  icon: BarChart3,
                },
                {
                  name: 'AI Assisted',
                  description: 'Describe your form and let our AI build the structure for you instantly.',
                  icon: Zap,
                },
              ].map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-slate-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
