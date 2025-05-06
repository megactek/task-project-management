import { Link } from "@remix-run/react";
import { Home } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function InvalidRoute() {
  return (
    <div className="container flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-8 text-7xl">🤔</div>
      <h1 className="text-4xl font-bold">Page Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        Sorry, we couldn't find the page you're looking for. It may be under construction.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
} 