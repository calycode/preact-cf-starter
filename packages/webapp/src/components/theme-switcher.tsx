import { Button } from '@caly/ui/components/button';
import { useTheme } from '../lib/theme';

export function ThemeSwitcher() {
   const { canonicalTheme, setTheme } = useTheme();

   return (
      <Button
         variant='outline'
         size='sm'
         onClick={() => setTheme(canonicalTheme === 'dark' ? 'light' : 'dark')}
      >
         {canonicalTheme === 'dark' ? 'Light' : 'Dark'}
      </Button>
   );
}
