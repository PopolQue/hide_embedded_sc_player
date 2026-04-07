import Navbar from './components/Navbar'
import NewsArticle from './components/NewsArticle'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Navbar activeLink="news" />
      <main className="mainContent">
        <NewsArticle />
      </main>
      <Footer />
    </>
  )
}

export default App
