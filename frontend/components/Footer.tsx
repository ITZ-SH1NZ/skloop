import Link from "next/link";
import { Button } from "./ui/Button";
import { ArrowRight, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white pt-24 pb-12 rounded-t-[3rem] relative z-30 -mt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] border-t border-black/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary animate-pulse" />
                            <span className="font-bold tracking-tight text-xl">Skloop</span>
                        </Link>
                        <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                            Where skills come full circle. We're building a world where knowledge is the ultimate currency. Join the loop.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink icon={<Twitter size={20} />} href="#" />
                            <SocialLink icon={<Instagram size={20} />} href="#" />
                            <SocialLink icon={<Linkedin size={20} />} href="#" />
                            <SocialLink icon={<Github size={20} />} href="#" />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="font-bold text-gray-900">Product</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Marketplace</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <h4 className="font-bold text-gray-900">Company</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="font-bold text-gray-900">Stay in the loop</h4>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full h-12 rounded-full border border-gray-200 bg-gray-50 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button className="absolute right-1 top-1 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Unsubscribe at any time. No spam, we promise.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Skloop Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
        >
            {icon}
        </a>
    );
}
