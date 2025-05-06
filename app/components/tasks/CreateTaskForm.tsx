import { useState } from "react";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus } from "lucide-react";

export function CreateTaskForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCancel = () => {
    setIsExpanded(false);
  };

  return (
    <div className="border rounded-md">
      {isExpanded ? (
        <Form
          method="post"
          action="/tasks/quick-create"
          className="p-3 space-y-3"
          onSubmit={() => {
            // After form submission, collapse the form
            setTimeout(() => setIsExpanded(false), 300);
          }}
        >
          <Input
            type="text"
            name="title"
            placeholder="Task title"
            autoFocus
            className="w-full"
            required
          />
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Task
            </Button>
          </div>
        </Form>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          variant="ghost"
          className="w-full justify-start p-3 h-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add new task</span>
        </Button>
      )}
    </div>
  );
} 