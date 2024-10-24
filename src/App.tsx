

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Player } from './components/Player';



export const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Player />} />
        </Routes>
      </Router>
    </div>
  );
}