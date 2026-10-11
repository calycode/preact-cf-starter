import { buttonVariants } from '@caly/ui/components/button';

export function ExampleDetail({ id }: { id?: string }) {
   return (
      <section className='flex flex-col gap-4'>
         <h1 className='font-heading text-2xl font-medium'>Example {id}</h1>
         <p className='text-sm text-muted-foreground'>
            preact-iso passes the <code>:id</code> route parameter as a prop.
         </p>
         <div>
            <a
               href='/examples'
               className={buttonVariants({ variant: 'ghost' })}
            >
               Back to examples
            </a>
         </div>
      </section>
   );
}
