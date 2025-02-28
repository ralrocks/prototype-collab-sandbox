
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import WebLayout from "@/components/WebLayout";

const NotFound = () => {
  return (
    <WebLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Button asChild size="lg">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </WebLayout>
  );
};

export default NotFound;
