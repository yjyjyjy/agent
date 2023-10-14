import Link from 'next/link';
import s from './Footer.module.css';
import Image from 'next/image'

import Logo from 'components/icons/Logo';
import GitHub from 'components/icons/GitHub';

export default function Footer() {
  return (
    <footer className="mx-auto  px-6 bg-zinc-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-zinc-600 py-12 text-white transition-colors duration-150 bg-zinc-900">
        <div className="col-span-1 lg:col-span-2">
          <Link href="/" className="flex flex-initial items-center font-bold md:mr-24">
            <span className="rounded-full border border-zinc-700 mr-2">
              <Logo />
            </span>
            <span></span>
          </Link>
        </div>

        {/* <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/">
                <a className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                  Home
                </a>
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/">
                <a className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                  About
                </a>
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/">
                <a className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                  Careers
                </a>
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/">
                <a className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                  Blog
                </a>
              </Link>
            </li>
          </ul>
        </div> */}
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="text-white font-bold hover:text-zinc-200 transition ease-in-out duration-150">
                Support
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/contact" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Contact us
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/refund" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Refund Policy
              </Link>
            </li>
            {/* <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/compliance">
                <a className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                  Report Abuse
                </a>
              </Link>
            </li> */}
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="text-white font-bold hover:text-zinc-200 transition ease-in-out duration-150">
                Legal
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/privacy" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Privacy Policy
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/terms" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Terms of Services
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/community-guidelines" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Community Guidelines
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="/about/2257-compliance" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link href="mailto:support@yuzu.fan" className="text-white hover:text-zinc-200 transition ease-in-out duration-150">
                Report Abuse
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-6 flex items-start lg:justify-end text-white">
          <div className="flex space-x-2 items-center h-10">
            <span>We accept</span>
            {/* <Image src="/public/logo/discover.jpg" alt="Visa" width={80} height={40} /> */}
            <img src="/logo/visa.jpg" alt="Visa" width={50} />
            <img src="/logo/master.jpg" alt="Master" width={50} />
            <img src="/logo/discover.jpg" alt="Master" width={50} />
            {/* <img src="/logo/ae.jpg" alt="American Express" width={50} /> */}
          </div>
        </div>
      </div>
      <div className="py-12 flex flex-col md:flex-row justify-between items-center space-y-4 bg-zinc-900">
        <div>
          <span>&copy; 2023 Open Insight, Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center">
          <span className="text-white">Oakland, California, 94611, USA</span>
          {/* <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="inline-block h-6 ml-4 text-white"
            />
          </a> */}
        </div>
      </div>
    </footer>
  );
}
