import { Button } from '@caly/ui/components/button';
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@caly/ui/components/card';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@caly/ui/components/dialog';

export function Dashboard() {
   return (
      <section className='flex flex-col gap-6'>
         <h1 className='font-heading text-2xl font-medium'>Dashboard</h1>

         <Card>
            <CardHeader>
               <CardTitle>Dialog smoke test</CardTitle>
               <CardDescription>Base UI primitives under preact/compat (SPEC D3).</CardDescription>
            </CardHeader>
            <CardContent>
               <Dialog>
                  <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>It works</DialogTitle>
                        <DialogDescription>
                           If you can read this, the Base UI dialog opened without hanging.
                        </DialogDescription>
                     </DialogHeader>
                     <DialogFooter showCloseButton />
                  </DialogContent>
               </Dialog>
            </CardContent>
         </Card>
      </section>
   );
}
