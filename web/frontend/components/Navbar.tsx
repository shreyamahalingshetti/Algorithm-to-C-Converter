"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Code2, TerminalSquare, FileText, Share2, PlayCircle, BookOpen } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Editor", path: "/editor", icon: Code2 },
    { name: "Lexer", path: "/lexer", icon: TerminalSquare },
    { name: "Parser", path: "/parser", icon: FileText },
    { name: "Parse Tree", path: "/tree", icon: Share2 },
    { name: "Generate C", path: "/codegen", icon: Code2 },
    { name: "Execute", path: "/output", icon: PlayCircle },
    { name: "Docs", path: "/docs", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 md:py-0 md:h-16 gap-3 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                C
              </div>
              <span className="font-bold text-xl gradient-text tracking-tight block">
                AutoC
              </span>
            </Link>
          </div>
          
          <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <div className="flex items-center space-x-1 min-w-max">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "text-blue-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
