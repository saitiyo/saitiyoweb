// Reusable Project Card Component
const ProjectCard = ({ name, status, daysLeft, progress, color, badge, logo }: { name: string; status: string; daysLeft: number; progress: number; color: string; badge: number | null; logo: string }) => (
  <div className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
    {/* Notification Badge */}
    {badge && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
        {badge}
      </span>
    )}

    <div className="flex items-center gap-4">
      {/* Project Logo Placeholder */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden ${logo === 'dark' ? 'bg-black' : 'bg-white'}`}>
         <div className="text-[10px] text-gray-400">LOGO</div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-700">{name}</h3>
    </div>

    <div className="space-y-1">
      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Status : {status}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-tight">Days left: {daysLeft}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

export default ProjectCard;
