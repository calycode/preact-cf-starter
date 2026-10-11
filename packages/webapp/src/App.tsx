import { Route, Router } from 'preact-iso';
import { AppShell } from './components/app-shell';
import { AgentationToolbar } from './lib/agentation';
import { Dashboard } from './routes/dashboard';
import { ExampleDetail } from './routes/examples/detail';
import { ExampleList } from './routes/examples/list';
import { Home } from './routes/home';
import { NotFound } from './routes/not-found';
import { Settings } from './routes/settings';

export function App() {
   return (
      <AppShell>
         <Router>
            <Route
               path='/'
               component={Home}
            />
            <Route
               path='/dashboard'
               component={Dashboard}
            />
            <Route
               path='/settings'
               component={Settings}
            />
            <Route
               path='/examples'
               component={ExampleList}
            />
            <Route
               path='/examples/:id'
               component={ExampleDetail}
            />
            <Route
               default
               component={NotFound}
            />
         </Router>
         <AgentationToolbar />
      </AppShell>
   );
}
