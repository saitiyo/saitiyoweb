// components/TaskCard.tsx
import { Card, Tag, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface TaskCardProps {
  priorities: { label: string; color: string }[];
  content: string;
  date: string;
  time?: string;
}

const TaskCard = ({ priorities, content, date, time }: TaskCardProps) => {
  // Map specific labels to Tailwind/Hex colors based on the image
  const getTagColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'low priority': return '#00f2ad';
      case 'medium priority': return '#fadb14';
      case 'high priority': return '#ff7a45';
      case 'highest priority': return '#ff4d4f';
      default: return 'default';
    }
  };

  return (
    <Card className="mb-4 shadow-sm border-none rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-2 mb-3">
        {priorities.map((p, idx) => (
          <Tag 
            key={idx} 
            bordered={false} 
            className="px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ backgroundColor: getTagColor(p.label), color: '#333' }}
          >
            {p.label}
          </Tag>
        ))}
      </div>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {content}
      </p>

      <div className="flex items-center gap-4 text-xs font-medium">
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${priorities.some(p => p.label.includes('high')) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
          <CalendarOutlined />
          <span>{date}</span>
        </div>
        {time && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${priorities.some(p => p.label.includes('high')) ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
            <ClockCircleOutlined />
            <span>{time}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
