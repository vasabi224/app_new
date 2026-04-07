'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './theme';
import { Button } from './ui/button';
import { GraduationCap, ArrowLeft, Pin } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const goBack = () => {
    if (window.history.state && window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <header className="flex items-center gap-2 font-medium justify-between py-2">
      <div className="brand flex items-center gap-2">
        {pathname !== '/' && (
          <div className="back-button">
            <Button onClick={goBack} size="icon" variant="ghost">
              <ArrowLeft />
            </Button>
          </div>
        )}
        <div className="logo flex items-center gap-2">
          <GraduationCap />
          <div className="title text-lg">Blink</div>
        </div>
      </div>

      <div className="actions flex items-center gap-2">
        <ThemeToggle />
        <Link href="/pinned">
          <Button variant="ghost" size="icon">
            <Pin className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}