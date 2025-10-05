import { Button } from "../components/ui/Button"
import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-5xl font-bold mb-6 text-white">404 - Game Not Found</h1>
      <p className="text-purple-200 text-xl mb-8">The game you're looking for doesn't exist or has been removed.</p>
      <Link to="/">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">Return to Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
