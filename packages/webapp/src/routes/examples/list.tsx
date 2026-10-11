import { Button, buttonVariants } from '@caly/ui/components/button';
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@caly/ui/components/card';
import { useExamples } from '../../features/examples/use-examples';

export function ExampleList() {
   const { examples, status, error, refresh, add } = useExamples();

   return (
      <section className='flex flex-col gap-6'>
         <div className='flex items-center justify-between gap-4'>
            <h1 className='font-heading text-2xl font-medium'>Examples</h1>
            <div className='flex gap-2'>
               <Button
                  variant='outline'
                  size='sm'
                  onClick={() => void refresh()}
               >
                  Refresh
               </Button>
               <Button
                  size='sm'
                  onClick={() => void add(`Example ${Date.now()}`)}
               >
                  New example
               </Button>
            </div>
         </div>

         {status === 'error' && (
            <p className='text-sm text-destructive'>{error}. Is the API Worker running on :8787?</p>
         )}

         {examples.length === 0 && status !== 'error' ? (
            <p className='text-sm text-muted-foreground'>
               No examples yet. Create one to hit POST /api/v1/examples.
            </p>
         ) : (
            <div className='grid gap-4 sm:grid-cols-2'>
               {examples.map((example) => (
                  <Card key={example.id}>
                     <CardHeader>
                        <CardTitle>{example.name}</CardTitle>
                        <CardDescription>Created {example.createdAt}</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <a
                           href={`/examples/${example.id}`}
                           className={buttonVariants({ variant: 'outline' })}
                        >
                           View
                        </a>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </section>
   );
}
