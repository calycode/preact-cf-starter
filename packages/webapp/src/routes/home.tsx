import { buttonVariants } from '@caly/ui/components/button';
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@caly/ui/components/card';

export function Home() {
   return (
      <section className='flex flex-col gap-6'>
         <div className='flex flex-col gap-2'>
            <h1 className='font-heading text-2xl font-medium'>Caly Cloud</h1>
            <p className='text-sm text-muted-foreground'>
               Preact + Vite on Cloudflare Workers, with a Hono API and shared shadcn (Base UI)
               primitives.
            </p>
         </div>

         <div className='grid gap-4 sm:grid-cols-2'>
            <Card>
               <CardHeader>
                  <CardTitle>Frontend</CardTitle>
                  <CardDescription>Preact SPA, routed with preact-iso.</CardDescription>
               </CardHeader>
               <CardContent>
                  <a
                     href='/dashboard'
                     className={buttonVariants()}
                  >
                     Open dashboard
                  </a>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>API</CardTitle>
                  <CardDescription>A separate Hono Worker under /api/v1.</CardDescription>
               </CardHeader>
               <CardContent>
                  <a
                     href='/examples'
                     className={buttonVariants({ variant: 'outline' })}
                  >
                     Browse examples
                  </a>
               </CardContent>
            </Card>
         </div>
      </section>
   );
}
