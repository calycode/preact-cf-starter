import type { ComponentChildren } from 'preact';
import { ThemeSwitcher } from './theme-switcher';

export function AppShell({ children }: { children: ComponentChildren }) {
   return (
      <div className='min-h-dvh bg-background text-foreground'>
         <header className='flex items-center justify-between gap-4 border-b px-4 py-2'>
            <a
               href='/'
               className='font-heading font-medium'
            >
               Caly Cloud
            </a>
            <nav className='flex items-center gap-4 text-sm text-muted-foreground'>
               <a
                  href='/dashboard'
                  className='hover:text-foreground'
               >
                  Dashboard
               </a>
               <a
                  href='/examples'
                  className='hover:text-foreground'
               >
                  Examples
               </a>
               <a
                  href='/settings'
                  className='hover:text-foreground'
               >
                  Settings
               </a>
            </nav>
            <ThemeSwitcher />
         </header>
         <main className='mx-auto w-full max-w-3xl px-4 py-8'>{children}</main>
      </div>
   );
}
