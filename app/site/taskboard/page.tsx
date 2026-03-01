// app/page.tsx
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TaskCard from '../../components/TaskCard';
import CustomButton from '@/app/components/Button';

export default function TaskBoard() {
  const dummyText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer viverra venenatis accumsan.";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
        <CustomButton text='Add New Task' icon={<PlusOutlined />} />
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Column: To Do */}
        <div className="bg-[#f0f0f0] p-4 rounded-xl min-h-[70vh]">
          <h2 className="font-bold text-sm mb-6 px-2 tracking-wider">TO DO</h2>
          <TaskCard priorities={[{label: 'low priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" />
          <TaskCard priorities={[{label: 'medium priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" time="00:00" />
          <TaskCard priorities={[{label: 'high priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" />
          <TaskCard priorities={[{label: 'highest priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" time="00:00" />
        </div>

        {/* Column: In Progress */}
        <div className="bg-[#f0f0f0] p-4 rounded-xl">
          <h2 className="font-bold text-sm mb-6 px-2 tracking-wider">IN PROGRESS</h2>
          <TaskCard 
            priorities={[{label: 'low priority', color: ''}, {label: 'medium priority', color: ''}]} 
            content={dummyText} 
            date="Jan 29th, 2022" 
          />
          <TaskCard priorities={[{label: 'medium priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" time="00:00" />
          <TaskCard priorities={[{label: 'high priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" />
          <TaskCard 
            priorities={[{label: 'low priority', color: ''}, {label: 'high priority', color: ''}, {label: 'highest priority', color: ''}]} 
            content={dummyText} 
            date="Jan 29th, 2022" 
            time="00:00" 
          />
        </div>

        {/* Column: Completed */}
        <div className="bg-[#f0f0f0] p-4 rounded-xl">
          <h2 className="font-bold text-sm mb-6 px-2 tracking-wider">COMPLETED</h2>
          <TaskCard priorities={[{label: 'low priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" />
          <TaskCard priorities={[{label: 'medium priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" time="00:00" />
          <TaskCard priorities={[{label: 'high priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" />
          <TaskCard priorities={[{label: 'highest priority', color: ''}]} content={dummyText} date="Jan 29th, 2022" time="00:00" />
        </div>

      </div>
    </div>
  );
}
