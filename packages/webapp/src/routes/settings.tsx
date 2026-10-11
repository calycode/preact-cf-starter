import { buttonVariants } from '@caly/ui/components/button';
import { useTheme } from '../lib/theme';

export function Settings() {
   const { theme } = useTheme();

   return (
      <section className='flex flex-col gap-4'>
         <h1 className='font-heading text-2xl font-medium'>Settings</h1>
         <p className='text-sm text-muted-foreground'>
            Theme presets are CSS-variable token sets. Current mode: <strong>{theme}</strong>. Swap
            presets with the shadcn CLI.
         </p>
         <div>
            <a
               href='/'
               className={buttonVariants({ variant: 'outline' })}
            >
               Back home
            </a>
         </div>
      </section>
   );
}
