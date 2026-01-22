'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Check,
  X,
  Plus,
  LogOut,
  Search,
  Pencil,
  MoreVertical,
  CalendarCheck2,
} from 'lucide-react';
import api from '@/lib/api';
import { Task, TaskStatus, CreateTaskData, UpdateTaskData } from '@/types';
import { toast } from 'sonner';
import { EditTaskDialog } from '@/components/edit-task-dialog';
import {
  DropdownMenuSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [page, statusFilter, searchQuery]);

  const fetchTasks = async () => {
    try {
      const params: any = { page, limit: 5 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/tasks', { params });
      setTasks(response.data.data.tasks);
      setTotalPages(response.data.data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', description: '' });
      fetchTasks();
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create tasks');
    }
  };

  const toggleTask = async (id: string) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      fetchTasks();
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleEditTask = async (id: string, data: UpdateTaskData) => {
    try {
      await api.patch(`/tasks/${id}`, data);
      fetchTasks();
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      router.push('/login');
    }
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl flex items-center gap-2 font-bold">
            <CalendarCheck2 />
            Task Manager
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createTask} className="space-y-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />
              <Textarea
                placeholder="Task description (optional)"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={TaskStatus.IN_PROGRESS}>
                In Progress
              </SelectItem>
              <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No tasks found. Create your first task!
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-md ${getStatusBadgeColor(task.status)}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 mb-2">{task.description}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="sm:hidden" asChild>
                        <Button>
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          {task.status === TaskStatus.COMPLETED ? (
                            <>
                              <X className="h-4 w-4" />
                              Reset
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Complete
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden sm:flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEditDialog(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={
                          task.status === TaskStatus.COMPLETED
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.status === TaskStatus.COMPLETED ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditTask}
      />
    </div>
  );
}
